import React, { ReactNode } from 'react'
import styled from 'styled-components'

export type LegendType =
  | 'rect'
  | 'circle'
  | 'line'
  | 'line-circle'
  | 'hatched'
  | 'dotted'
  | 'custom'

export interface LegendItem {
  id?: string
  color: string
  borderColor?: string
  label: string | ReactNode
  type: LegendType
  thickness?: number
  custom?: React.ReactNode
}

export interface ColorKeyGroup {
  items: LegendItem[]
  compact?: boolean
  swatchSize?: SymbolSize
  swatchSpace?: number
}

export interface ColorKeyColumn {
  title?: string
  data: LegendItem[]
  className?: string
  style?: React.CSSProperties
  align?: 'left' | 'right'
}

export interface SymbolSize {
  width: number
  height: number
}

interface ColorKeyProps {
  groups?: ColorKeyGroup[]
  columns?: ColorKeyColumn[]
  groupSpace?: number
  ariaLabel?: string
  style?: React.CSSProperties
}

const DEFAULT_SIZE: SymbolSize = { width: 14, height: 14 }
const DEFAULT_GROUP_SPACE = 15

interface ContainerProps {
  $gap?: number
}

const GroupsContainer = styled.div<ContainerProps>`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: ${props => props.$gap ?? DEFAULT_GROUP_SPACE}px;
  row-gap: 6px;
  line-height: 1em;
  @media (max-width: 768px) {
    row-gap: 3px;
  }
`

const Group = styled.div<ContainerProps>`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${props => props.$gap ?? 0}px;
  row-gap: 4px;
  @media (max-width: 768px) {
    row-gap: 3px;
  }
`

const TwoColumnContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  width: 100%;
  margin-top: 10px;
`

interface ColumnWrapperProps {
  $align?: 'left' | 'right'
}

const ColumnWrapper = styled.div<ColumnWrapperProps>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
  align-items: ${props =>
    props.$align === 'right' ? 'flex-end' : 'flex-start'};
`

const ColumnTitle = styled.div`
  margin: 0;
  font-size: 11px;
  @media (max-width: 768px) {
    font-size: 11px;
  }
`

const ColumnItems = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
`

interface ItemContainerProps {
  $align?: 'left' | 'right'
  $isColumnLayout?: boolean
}

const ItemContainer = styled.li<ItemContainerProps>`
  display: flex;
  flex-direction: ${props =>
    props.$align === 'right' ? 'row-reverse' : 'row'};
  align-items: center;
  gap: 5px;
  padding: 0px 0;
  justify-content: ${props =>
    props.$align === 'right' ? 'flex-start' : 'flex-start'};
  padding-right: ${props => (props.$isColumnLayout ? '0' : '20px')};
  &:first-of-type {
    padding-left: 0;
  }
  &:last-of-type {
    padding-right: 0;
  }
`

const Label = styled.span`
  font-size: 13px;
  line-height: 1.2em;
  display: flex;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

interface SymbolBaseProps {
  $width?: number
  $height?: number
}

const SymbolBase = styled.span<SymbolBaseProps>`
  display: block;
  width: ${props => props.$width || DEFAULT_SIZE.width}px;
  height: ${props => props.$height || DEFAULT_SIZE.height}px;
`

const Rectangle = styled(SymbolBase)<{ color: string; $borderColor?: string }>`
  background-color: ${props => props.color};
  border: 1px solid ${props => props.$borderColor || 'transparent'};
`

const Circle = styled(SymbolBase)<{ color: string }>`
  background-color: ${props => props.color};
  border-radius: 50%;
`

const LineContainer = styled(SymbolBase)`
  display: flex;
  align-items: center;
`

const Line = styled.span<{ color: string; $thickness: number }>`
  display: block;
  width: 100%;
  height: ${props => props.$thickness}px;
  background-color: ${props => props.color};
  border-radius: ${props => props.$thickness}px;
  transform: rotate(-45deg);
`

const LineWithCircleContainer = styled(LineContainer)`
  position: relative;
`

const CircleOverlay = styled.span<{ color: string }>`
  display: block;
  width: 8px;
  height: 8px;
  background-color: ${props => props.color};
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const HatchedBox = styled(SymbolBase)<{ color: string }>`
  background-image: ${props => `repeating-linear-gradient(
    45deg,
    ${props.color},
    ${props.color} 2px,
    transparent 2px,
    transparent 6px
  )`};
`

const DottedBox = styled(SymbolBase)<{ color: string }>`
  background-image: ${props => `radial-gradient(
    circle,
    ${props.color} 1.5px,
    transparent 1.5px
  )`};
  background-size: 5px 5px;
`

const CompactItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
`

const CompactLabel = styled.span`
  font-size: 11px;
  text-align: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

/**
 * Renders the appropriate symbol based on type
 */
const renderSymbol = (item: LegendItem, size?: SymbolSize): React.ReactNode => {
  const { color, type, borderColor, thickness = 3 } = item
  const width = size?.width
  const height = size?.height

  switch (type) {
    case 'rect':
      return (
        <Rectangle
          color={color}
          $borderColor={borderColor}
          $width={width}
          $height={height}
          aria-hidden='true'
        />
      )

    case 'circle':
      return (
        <Circle
          color={color}
          $width={width}
          $height={height}
          aria-hidden='true'
        />
      )

    case 'line':
      return (
        <LineContainer $width={width} $height={height} aria-hidden='true'>
          <Line color={color} $thickness={thickness} />
        </LineContainer>
      )

    case 'line-circle':
      return (
        <LineWithCircleContainer
          $width={width}
          $height={height}
          aria-hidden='true'
        >
          <Line color={color} $thickness={thickness} />
          <CircleOverlay color={color} />
        </LineWithCircleContainer>
      )

    case 'hatched':
      return (
        <HatchedBox
          color={color}
          $width={width}
          $height={height}
          aria-hidden='true'
        />
      )

    case 'dotted':
      return (
        <DottedBox
          color={color}
          $width={width}
          $height={height}
          aria-hidden='true'
        />
      )

    case 'custom':
      return <span aria-hidden='true'>{item.custom}</span>

    default:
      return null
  }
}

/**
 * Renders a single legend entry with symbol and label side by side
 */
const LegendEntry: React.FC<{
  item: LegendItem
  size?: SymbolSize
  align?: 'left' | 'right'
  isColumnLayout?: boolean
}> = ({ item, size, align, isColumnLayout }) => {
  return (
    <ItemContainer $align={align} $isColumnLayout={isColumnLayout||item.label==''}>
      {renderSymbol(item, size)}
      {item.label && item.label != '' && <Label>{item.label}</Label>}
    </ItemContainer>
  )
}

/**
 * Renders a single legend entry with symbol above label (compact layout)
 */
const CompactLegendEntry: React.FC<{
  item: LegendItem
  size?: SymbolSize
}> = ({ item, size }) => {
  return (
    <CompactItem>
      {renderSymbol(item, size)}
      <CompactLabel>{item.label}</CompactLabel>
    </CompactItem>
  )
}

/**
 * Generates a stable key for a legend item
 */
const getItemKey = (item: LegendItem, index: number): string => {
  return item.id ?? `${item.type}-${item.color}-${index}`
}

/**
 * ColorKey component for displaying map/chart legends
 * Supports grouped and multi-column layouts
 */
const ColorKey: React.FC<ColorKeyProps> = ({
  groups,
  columns,
  groupSpace,
  ariaLabel = 'Legende',
  style
}) => {
  // Grouped layout
  if (groups && groups.length > 0) {
    return (
      <GroupsContainer
        $gap={groupSpace}
        style={style}
        role='list'
        aria-label={ariaLabel}
      >
        <VisuallyHidden>{ariaLabel}:</VisuallyHidden>
        {groups.map((group, groupIndex) => (
          <Group key={groupIndex} $gap={group.swatchSpace} role='group'>
            {group.items.map((item, itemIndex) =>
              group.compact ? (
                <CompactLegendEntry
                  key={getItemKey(item, itemIndex)}
                  item={item}
                  size={group.swatchSize}
                />
              ) : (
                <LegendEntry
                  key={getItemKey(item, itemIndex)}
                  item={item}
                  size={group.swatchSize}
                />
              )
            )}
          </Group>
        ))}
      </GroupsContainer>
    )
  }

  // Multi-column layout
  if (columns && columns.length > 0) {
    return (
      <TwoColumnContainer role='region' aria-label={ariaLabel}>
        {columns.map((column, colIndex) => (
          <ColumnWrapper
            key={colIndex}
            className={column.className}
            style={column.style}
            $align={column.align}
          >
            {column.title && (
              <ColumnTitle id={`col-title-${colIndex}`}>
                {column.title}
              </ColumnTitle>
            )}
            <ColumnItems
              role='list'
              aria-labelledby={
                column.title ? `col-title-${colIndex}` : undefined
              }
            >
              {column.data.map((item, itemIndex) => (
                <LegendEntry
                  key={getItemKey(item, itemIndex)}
                  item={item}
                  align={column.align}
                  isColumnLayout={true}
                />
              ))}
            </ColumnItems>
          </ColumnWrapper>
        ))}
      </TwoColumnContainer>
    )
  }

  return null
}

export default ColorKey
