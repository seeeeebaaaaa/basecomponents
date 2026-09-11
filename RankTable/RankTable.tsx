import {
  ReactNode,
  type Ref,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import styled from 'styled-components'

type PinEdge = 'top' | 'bottom'

const DEFAULT_COLLAPSED_LIMIT = 10
const DEFAULT_EXPANDED_LIMIT = 100
const MOBILE_BREAKPOINT = 711

export interface RankTableColumn<T> {
  id: string
  header: ReactNode
  cell: (item: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface RankTableProps<T> {
  items: T[]
  columns: RankTableColumn<T>[]
  getRowKey: (item: T, index: number) => string | number
  isHighlighted?: (item: T) => boolean
  mapHighlighted?: (item: T) => T
  collapsedLimit?: number
  expandedLimit?: number
  showMoreLabel?: ReactNode
  showLessLabel?: ReactNode
  loading?: boolean
  loadingLabel?: ReactNode
  resetKey?: string | number
  className?: string
}

/**
 * Expandable rank table: collapsed/expanded slice, highlighted row,
 * and a viewport pin when that row sits outside the scrollport.
 */
function RankTable<T> ({
  items,
  columns,
  getRowKey,
  isHighlighted,
  mapHighlighted,
  collapsedLimit = DEFAULT_COLLAPSED_LIMIT,
  expandedLimit = DEFAULT_EXPANDED_LIMIT,
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
  loading = false,
  loadingLabel = 'Loading…',
  resetKey,
  className
}: RankTableProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [pinEdge, setPinEdge] = useState<PinEdge | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const highlightRowRef = useRef<HTMLDivElement>(null)
  const columnTemplate = columns.map(column => column.width ?? '1fr').join(' ')
  const limit = isExpanded ? expandedLimit : collapsedLimit

  const { visibleItems, outsideItem, highlightedIndex } = useMemo(
    () => getVisibleSlice(items, limit, isHighlighted, mapHighlighted),
    [items, limit, isHighlighted, mapHighlighted]
  )

  useEffect(() => {
    setIsExpanded(false)
  }, [resetKey])

  useLayoutEffect(() => {
    if (outsideItem) {
      setPinEdge(null)
      return
    }

    const body = bodyRef.current
    const row = highlightRowRef.current
    if (!body || !row || highlightedIndex < 0) {
      setPinEdge(null)
      return
    }

    const updatePinEdge = () => {
      const bodyRect = body.getBoundingClientRect()
      const rowRect = row.getBoundingClientRect()
      const isInView =
        rowRect.bottom > bodyRect.top && rowRect.top < bodyRect.bottom
      if (isInView) {
        setPinEdge(null)
        return
      }
      setPinEdge(rowRect.bottom <= bodyRect.top ? 'top' : 'bottom')
    }

    updatePinEdge()
    body.addEventListener('scroll', updatePinEdge, { passive: true })
    const resizeObserver = new ResizeObserver(updatePinEdge)
    resizeObserver.observe(body)
    resizeObserver.observe(row)
    return () => {
      body.removeEventListener('scroll', updatePinEdge)
      resizeObserver.disconnect()
    }
  }, [outsideItem, highlightedIndex, visibleItems, isExpanded])

  const handleToggle = () => {
    const nextExpanded = !isExpanded
    if (nextExpanded && headerRef.current && isMobileViewport()) {
      headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsExpanded(nextExpanded)
  }

  const overlayItem = pinEdge ? visibleItems[highlightedIndex] : undefined

  if (loading) {
    return <RankTableRoot className={className}>{loadingLabel}</RankTableRoot>
  }

  if (items.length === 0) return null

  return (
    <RankTableRoot className={className}>
      <HeaderRow ref={headerRef} $template={columnTemplate}>
        {columns.map(column => (
          <HeaderCell key={column.id} $align={column.align}>
            {column.header}
          </HeaderCell>
        ))}
      </HeaderRow>
      <Body ref={bodyRef} $isExpanded={isExpanded}>
        {pinEdge === 'top' && overlayItem && (
          <PinSlot $edge='top'>
            <DataRow
              item={overlayItem}
              columns={columns}
              template={columnTemplate}
              isHighlighted
            />
          </PinSlot>
        )}
        {visibleItems.map((item, index) => (
          <DataRow
            key={getRowKey(item, index)}
            rowRef={index === highlightedIndex ? highlightRowRef : undefined}
            item={item}
            columns={columns}
            template={columnTemplate}
            isHighlighted={index === highlightedIndex}
          />
        ))}
        {pinEdge === 'bottom' && overlayItem && (
          <PinSlot $edge='bottom'>
            <DataRow
              item={overlayItem}
              columns={columns}
              template={columnTemplate}
              isHighlighted
            />
          </PinSlot>
        )}
      </Body>
      {outsideItem && (
        <Pinned>
          <DataRow
            item={outsideItem}
            columns={columns}
            template={columnTemplate}
            isHighlighted
          />
        </Pinned>
      )}
      <ShowMoreButton type='button' onClick={handleToggle}>
        {isExpanded ? showLessLabel : showMoreLabel}
      </ShowMoreButton>
    </RankTableRoot>
  )
}

/** Renders one data row using the shared column template. */
function DataRow<T> ({
  rowRef,
  item,
  columns,
  template,
  isHighlighted
}: {
  rowRef?: Ref<HTMLDivElement>
  item: T
  columns: RankTableColumn<T>[]
  template: string
  isHighlighted: boolean
}) {
  return (
    <Row ref={rowRef} $template={template} $isHighlighted={isHighlighted}>
      {columns.map(column => (
        <Cell key={column.id} $align={column.align}>
          {column.cell(item)}
        </Cell>
      ))}
    </Row>
  )
}

/**
 * Takes the collapsed/expanded slice and maps a highlight that lives in it.
 * Highlights beyond the slice are returned as `outsideItem` for a bottom pin.
 */
function getVisibleSlice<T> (
  items: T[],
  limit: number,
  isHighlighted?: (item: T) => boolean,
  mapHighlighted?: (item: T) => T
) {
  const slice = items.slice(0, limit)
  if (!isHighlighted) {
    return { visibleItems: slice, outsideItem: undefined, highlightedIndex: -1 }
  }

  const highlightedIndex = slice.findIndex(isHighlighted)
  if (highlightedIndex >= 0) {
    const visibleItems = mapHighlighted
      ? slice.map((item, index) =>
          index === highlightedIndex ? mapHighlighted(item) : item
        )
      : slice
    return { visibleItems, outsideItem: undefined, highlightedIndex }
  }

  const highlightedItem = items.find(isHighlighted)
  return {
    visibleItems: slice,
    outsideItem: highlightedItem
      ? mapHighlighted
        ? mapHighlighted(highlightedItem)
        : highlightedItem
      : undefined,
    highlightedIndex: -1
  }
}

/**
 * Returns whether the current viewport matches the table's mobile breakpoint.
 */
function isMobileViewport () {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
}

const RankTableRoot = styled.div`
  max-width: var(--rank-table-max-width, 668px);
  margin: var(--rank-table-margin, 0 auto 30px);

  @media screen and (max-width: ${MOBILE_BREAKPOINT}px) {
    max-width: var(--rank-table-max-width-mobile, calc(100vw - 30px));
  }
`

const GridRow = styled.div<{ $template: string }>`
  display: grid;
  grid-template-columns: ${props => props.$template};
  width: 100%;
  font-size: var(--rank-table-font-size, 18px);

  @media screen and (max-width: ${MOBILE_BREAKPOINT}px) {
    font-size: var(--rank-table-font-size, 14px);
  }
`

const HeaderRow = styled(GridRow)`
  font-size: var(--rank-table-header-size, 14px);
  color: var(--rank-table-header-color, var(--gray-3));
`

type CellAlign = RankTableColumn<unknown>['align']

const HeaderCell = styled.div<{ $align?: CellAlign }>`
  padding: var(--rank-table-cell-padding, 4px);
  text-align: ${props => props.$align ?? 'left'};
  border-bottom: 1px solid var(--rank-table-header-border, var(--text-color));

  @media screen and (max-width: ${MOBILE_BREAKPOINT}px) {
    padding: var(--rank-table-cell-padding, 2px);
  }
`

const Body = styled.div<{ $isExpanded: boolean }>`
  max-height: var(--rank-table-max-height, 500px);
  overflow-y: ${props => (props.$isExpanded ? 'scroll' : 'hidden')};

  ${props =>
    props.$isExpanded
      ? ''
      : `&::-webkit-scrollbar {
          display: none;
        }`}

  ${props =>
    props.$isExpanded
      ? `&::after {
          content: '';
          display: block;
          position: sticky;
          bottom: 0;
          z-index: 1;
          height: 70px;
          pointer-events: none;
          border-bottom: 1px solid
            var(--table-gradient-border-color, var(--gray-4));
          background: var(
            --table-gradient-2,
            linear-gradient(transparent, var(--site-background))
          );
        }`
      : ''}
`

const PinSlot = styled.div<{ $edge: PinEdge }>`
  position: sticky;
  z-index: 2;
  height: 0;
  overflow: visible;
  pointer-events: none;
  ${props => (props.$edge === 'top' ? 'top: 0;' : 'bottom: 0;')}

  > * {
    pointer-events: auto;
    ${props =>
      props.$edge === 'bottom' ? 'transform: translateY(-100%);' : ''}
  }
`

const Pinned = styled.div`
  border-top: 1px dashed var(--rank-table-pinned-border, var(--text-color));
  padding-top: 10px;
`

const Row = styled(GridRow)<{ $isHighlighted: boolean }>`
  ${props =>
    props.$isHighlighted
      ? `
    background-color: var(--rank-table-highlight-bg, var(--purple-main));
    color: var(--rank-table-highlight-text, #fff);
  `
      : ''}
`

const Cell = styled.div<{ $align?: CellAlign }>`
  padding: var(--rank-table-cell-padding, 4px);
  text-align: ${props => props.$align ?? 'left'};
  border-bottom: 1px solid var(--table-cell-border-color, var(--gray-5));
  overflow-x: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}px) {
    padding: var(--rank-table-cell-padding, 2px);
  }
`

const ShowMoreButton = styled.button`
  font-size: var(--rank-table-button-font-size, 14px) !important;
  display: block;
  margin: 10px auto;
  padding: 1rem;
  border: 0;
  border-radius: var(--rank-table-button-radius, 5px);
  background-color: var(--rank-table-button-bg, var(--text-color));
  color: var(--rank-table-button-text, var(--site-background));
  cursor: pointer;
  font: inherit;

  @media screen and (min-width: ${MOBILE_BREAKPOINT + 1}px) {
    &:hover {
      background-color: var(--rank-table-button-hover-bg, var(--purple-main));
      color: var(--rank-table-button-hover-text, #fff);
    }
  }
`

export default RankTable
