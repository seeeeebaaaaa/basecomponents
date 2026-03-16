import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode
} from 'react'
import styled, { keyframes } from 'styled-components'
import type { Annotation, DevOptions } from './AnnotatedContent'

const isDev = window.location.hostname === 'localhost'

/** Dev-mode annotation tools: click-to-copy, drag-to-reposition, annotation panel. */
export function useAnnotationDevTools (
  containerRef: React.RefObject<HTMLDivElement | null>,
  annotations: Annotation[],
  containerWidth: number,
  containerHeight: number,
  devOptions?: DevOptions
) {
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [badgesVisible, setBadgesVisible] = useState(false)
  const [gridVisible, setGridVisible] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [posOverrides, setPosOverrides] = useState<
    Record<number, { x: number; y: number }>
  >({})
  const idRef = useRef(0)

  const showToast = useCallback((msg: string) => {
    const id = ++idRef.current
    setToast({ msg, id })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(prev => (prev?.id === toast.id ? null : prev))
    }, 2500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!isDev) return
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setPanelOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /** Copies the clicked position to clipboard and shows a toast. */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.altKey || e.shiftKey) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      const str = `{ x: ${x.toFixed(2)}, y: ${y.toFixed(2)} }`
      navigator.clipboard.writeText(str)
      showToast(str)
      console.log(str)
    },
    [containerRef, showToast]
  )

  /** Returns the current position for an annotation (override or original). */
  const getPos = useCallback(
    (index: number) => posOverrides[index] ?? annotations[index]?.pos,
    [posOverrides, annotations]
  )

  /** Called when a drag ends — stores the new position. */
  const handleDragEnd = useCallback(
    (index: number, newPos: { x: number; y: number }) => {
      setPosOverrides(prev => ({ ...prev, [index]: newPos }))
    },
    []
  )

  /** Copies all annotation positions (with overrides) as a code-ready array. */
  const handleExport = useCallback(() => {
    const lines = annotations.map((a, i) => {
      const p = posOverrides[i] ?? a.pos
      return `  /* #${i} */ { x: ${p.x}, y: ${p.y} },`
    })
    navigator.clipboard.writeText(`[\n${lines.join('\n')}\n]`)
    showToast(`${annotations.length} positions copied`)
  }, [annotations, posOverrides, showToast])

  /** Wraps an annotation element with dev-mode chrome (badge, drag, highlight). */
  const wrapAnnotation = useCallback(
    (element: ReactNode, index: number, pos: { x: number; y: number }) => {
      if (!badgesVisible) return element
      return (
        <DraggableAnnotation
          key={index}
          index={index}
          pos={pos}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          isSelected={selectedIdx === index}
          onSelect={() =>
            setSelectedIdx(prev => (prev === index ? null : index))
          }
          onDragEnd={handleDragEnd}
          showToast={showToast}
        >
          {element}
        </DraggableAnnotation>
      )
    },
    [
      badgesVisible,
      containerWidth,
      containerHeight,
      selectedIdx,
      handleDragEnd,
      showToast
    ]
  )

  if (!isDev) {
    return {
      handleClick: undefined as undefined,
      wrapAnnotation: null as null,
      overlay: null as ReactNode
    }
  }

  const gridX = devOptions?.grid
    ? Array.isArray(devOptions.grid)
      ? devOptions.grid[0]
      : devOptions.grid
    : 10
  const gridY = devOptions?.grid
    ? Array.isArray(devOptions.grid)
      ? devOptions.grid[1]
      : devOptions.grid
    : 10
  const gridColor = devOptions?.gridColor ?? 'rgba(0, 150, 255, 0.3)'

  const overlay: ReactNode = (
    <>
      {toast && <DevToast key={toast.id}>{toast.msg}</DevToast>}
      {gridVisible && (
        <GridOverlay>
          <svg width='100%' height='100%'>
            {Array.from({ length: Math.floor(100 / gridX) - 1 }, (_, i) => {
              const x = (i + 1) * gridX
              return (
                <line
                  key={`v${i}`}
                  x1={`${x}%`}
                  y1='0'
                  x2={`${x}%`}
                  y2='100%'
                  stroke={gridColor}
                  strokeWidth='0.5'
                />
              )
            })}
            {Array.from({ length: Math.floor(100 / gridY) - 1 }, (_, i) => {
              const y = (i + 1) * gridY
              return (
                <line
                  key={`h${i}`}
                  x1='0'
                  y1={`${y}%`}
                  x2='100%'
                  y2={`${y}%`}
                  stroke={gridColor}
                  strokeWidth='0.5'
                />
              )
            })}
          </svg>
        </GridOverlay>
      )}
      <StickyOverlay>
        {panelOpen ? (
          <DevPanel
            annotations={annotations}
            getPos={getPos}
            selectedIdx={selectedIdx}
            badgesVisible={badgesVisible}
            gridVisible={gridVisible}
            onToggleBadges={() => setBadgesVisible(v => !v)}
            onToggleGrid={() => setGridVisible(v => !v)}
            onSelect={setSelectedIdx}
            onExport={handleExport}
            onClose={() => setPanelOpen(false)}
          />
        ) : (
          <ToggleRow>
            <PanelToggle
              onClick={() => setGridVisible(v => !v)}
              title={gridVisible ? 'Hide grid' : 'Show grid'}
              style={gridVisible ? { opacity: 1 } : undefined}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              >
                <rect x='3' y='3' width='18' height='18' />
                <line x1='3' y1='12' x2='21' y2='12' />
                <line x1='12' y1='3' x2='12' y2='21' />
              </svg>
            </PanelToggle>
            <PanelToggle
              onClick={() => setBadgesVisible(v => !v)}
              title={badgesVisible ? 'Hide badges' : 'Show badges'}
              style={badgesVisible ? { opacity: 1 } : undefined}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                <circle cx='12' cy='12' r='3' />
                {!badgesVisible && <line x1='1' y1='1' x2='23' y2='23' />}
              </svg>
            </PanelToggle>
            <PanelToggle
              onClick={() => setPanelOpen(true)}
              title='Annotation DevTools (Ctrl+`)'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              >
                <line x1='3' y1='6' x2='21' y2='6' />
                <line x1='3' y1='12' x2='21' y2='12' />
                <line x1='3' y1='18' x2='21' y2='18' />
              </svg>
            </PanelToggle>
          </ToggleRow>
        )}
      </StickyOverlay>
    </>
  )

  return { handleClick, wrapAnnotation, overlay }
}

// ─── DraggableAnnotation ─────────────────────────────────────────────────────

/** Wraps a single annotation with an index badge (drag handle) to reposition. */
function DraggableAnnotation ({
  children,
  index,
  pos,
  containerWidth,
  containerHeight,
  isSelected,
  onSelect,
  onDragEnd,
  showToast
}: {
  children: ReactNode
  index: number
  pos: { x: number; y: number }
  containerWidth: number
  containerHeight: number
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (index: number, newPos: { x: number; y: number }) => void
  showToast: (msg: string) => void
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const settled = useRef({ x: 0, y: 0 })

  /** Drag starts from the badge — no modifier key needed. */
  const handleBadgeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const base = { ...settled.current }
    setDragging(true)

    const onMove = (ev: MouseEvent) => {
      setOffset({
        x: base.x + ev.clientX - startX,
        y: base.y + ev.clientY - startY
      })
    }
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      setDragging(false)
      const finalOffset = {
        x: base.x + ev.clientX - startX,
        y: base.y + ev.clientY - startY
      }
      settled.current = finalOffset
      setOffset(finalOffset)
      const dxPct = (finalOffset.x / containerWidth) * 100
      const dyPct = (finalOffset.y / containerHeight) * 100
      const newPos = {
        x: +(pos.x + dxPct).toFixed(2),
        y: +(pos.y + dyPct).toFixed(2)
      }
      const str = `{ x: ${newPos.x}, y: ${newPos.y} }`
      navigator.clipboard.writeText(str)
      showToast(`#${index} → ${str}`)
      console.log(`Annotation #${index}:`, str)
      onDragEnd(index, newPos)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <DragBox
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        ...(offset.x || offset.y
          ? { transform: `translate(${offset.x}px, ${offset.y}px)` }
          : {})
      }}
      $selected={isSelected}
      $dragging={dragging}
    >
      <Badge
        $selected={isSelected}
        onMouseDown={handleBadgeMouseDown}
        onClick={e => {
          e.stopPropagation()
          onSelect()
        }}
      >
        {index}
      </Badge>
      {children}
    </DragBox>
  )
}

// ─── DevPanel ────────────────────────────────────────────────────────────────

/** Floating panel listing all annotations with select, highlight, and export. */
function DevPanel ({
  annotations,
  getPos,
  selectedIdx,
  badgesVisible,
  gridVisible,
  onToggleBadges,
  onToggleGrid,
  onSelect,
  onExport,
  onClose
}: {
  annotations: Annotation[]
  getPos: (index: number) => { x: number; y: number }
  selectedIdx: number | null
  badgesVisible: boolean
  gridVisible: boolean
  onToggleBadges: () => void
  onToggleGrid: () => void
  onSelect: (i: number | null) => void
  onExport: () => void
  onClose: () => void
}) {
  return (
    <PanelContainer onClick={e => e.stopPropagation()}>
      <PanelHeader>
        <PanelActions>
          <PanelBtn
            onClick={onToggleGrid}
            title={gridVisible ? 'Hide grid' : 'Show grid'}
            style={
              gridVisible
                ? { background: '#4dabf7', color: 'white' }
                : undefined
            }
          >
            Grid
          </PanelBtn>
          <PanelBtn
            onClick={onToggleBadges}
            title={badgesVisible ? 'Hide badges' : 'Show badges'}
            style={
              badgesVisible
                ? { background: '#4dabf7', color: 'white' }
                : undefined
            }
          >
            Badges
          </PanelBtn>

          <PanelBtn onClick={onExport} title='Copy all positions'>
            Copy
          </PanelBtn>
          <PanelBtn onClick={onClose}>✕</PanelBtn>
        </PanelActions>
      </PanelHeader>
      <PanelList>
        {annotations.map((_a, i) => {
          const p = getPos(i)
          return (
            <PanelRow
              key={i}
              $selected={i === selectedIdx}
              onClick={() => onSelect(i === selectedIdx ? null : i)}
            >
              <span>#{i}</span>
              <PanelPos>
                x: {p.x.toFixed(1)}, y: {p.y.toFixed(1)}
              </PanelPos>
            </PanelRow>
          )
        })}
      </PanelList>
      <PanelFooter>
        Click = copy pos &middot; Drag badge = move &middot; Ctrl+` = toggle
      </PanelFooter>
    </PanelContainer>
  )
}

// ─── Styled Components ───────────────────────────────────────────────────────

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 999;
  pointer-events: none;
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
`

const DevToast = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  color: #e0e0e0;
  padding: 8px 16px;
  border-radius: 8px;
  font: 13px/1.4 monospace;
  white-space: nowrap;
  z-index: 10000;
  pointer-events: none;
  animation: ${fadeIn} 0.2s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`

const DragBox = styled.div<{ $selected: boolean; $dragging: boolean }>`
  position: absolute;
  z-index: 1000;
  cursor: ${p => (p.$dragging ? 'grabbing' : 'default')};
  ${p =>
    p.$selected &&
    'outline: 2px dashed #4dabf7; outline-offset: 4px; border-radius: 2px;'}
  ${p => p.$dragging && 'opacity: 0.7; z-index: 10001 !important;'}
  > div {
    position: static !important;
    left: auto !important;
    top: auto !important;
    z-index: auto !important;
  }
`

const Badge = styled.span<{ $selected: boolean }>`
  position: absolute;
  top: -10px;
  left: -10px;
  background: ${p => (p.$selected ? '#4dabf7' : '#1a1a2e')};
  color: white;
  font: bold 10px/1 monospace;
  padding: 3px 5px;
  border-radius: 4px;
  z-index: 10001;
  cursor: grab;
  opacity: ${p => (p.$selected ? 1 : 0.4)};
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
  &:active {
    cursor: grabbing;
    opacity: 1;
  }
`

const StickyOverlay = styled.div`
  position: sticky;
  top: 8px;
  height: 0;
  overflow: visible;
  z-index: 10000;
  pointer-events: none;
  > * {
    position: absolute;
    right: 8px;
    top: 0;
    pointer-events: auto;
  }
`

const ToggleRow = styled.div`
  display: flex;
  gap: 4px;
`

const PanelToggle = styled.button`
  line-height: 0;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 2px 4px 0px 4px;
  cursor: pointer;
  font: bold 11px/1.2 monospace;
  color: #ccc;
  opacity: 0.5;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
`

const PanelContainer = styled.div`
  width: 240px;
  max-height: calc(100vh - 40px);
  background: #1a1a2eee;
  border: 1px solid #333;
  border-radius: 8px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  font: 12px/1.4 monospace;
  color: #e0e0e0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  overflow: hidden;
`

const PanelHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #333;
  font-weight: bold;
`

const PanelActions = styled.div`
  display: flex;
  gap: 4px;
`

const PanelBtn = styled.button`
  background: #333;
  border: none;
  color: #ccc;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
  &:hover {
    background: #4dabf7;
    color: white;
  }
`

const PanelList = styled.div`
  overflow-y: auto;
  flex: 1;
`

const PanelRow = styled.div<{ $selected: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  cursor: pointer;
  background: ${p => (p.$selected ? '#4dabf733' : 'transparent')};
  &:hover {
    background: #ffffff11;
  }
`

const PanelPos = styled.span`
  color: #888;
`

const PanelFooter = styled.div`
  padding: 6px 10px;
  border-top: 1px solid #333;
  color: #666;
  font-size: 10px;
  text-align: center;
`
