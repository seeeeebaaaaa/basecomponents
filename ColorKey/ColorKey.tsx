import { useMFContext } from 'components/MFHelpers'
import React, { ReactNode } from 'react'
import styled from 'styled-components'
import {
  DEFAULT_BAR_HEIGHT,
  DEFAULT_BAR_LABELS_STYLE,
  DEFAULT_COLOR_KEY_TITLE_STYLE,
  DEFAULT_GRADIENT_BAR_BORDER_RADIUS,
  DEFAULT_GROUP_SPACING,
  DEFAULT_GROUP_TITLE_STYLE,
  DEFAULT_ITEM_ROW_SPACE,
  DEFAULT_ITEM_SPACE,
  DEFAULT_LABEL_STYLE,
  DEFAULT_LINE_THICKNESS,
  DEFAULT_SIZE
} from './ColorKeyDefaults'

export type SwatchType = 'circle' | 'square' | 'line' | 'custom'

export interface ColorKeyItem {
  color?: string
  label: ReactNode
  type: SwatchType
  customSwatch?: ReactNode
  swatchSize?: number
  lineThickness?: number
  strokeWidth?: number
  strokeColor?: string
  labelStyle?: React.CSSProperties
}

export interface ColorKeyGradientItem {
  color: string
  value: number
  label?: ReactNode
}

/** Item for discrete color scale. Renders adjacent swatches with no gap. */
export interface ColorKeyDiscreteScaleItem {
  color: string
  label?: ReactNode
}

export interface ColorKeyGroup {
  items:
    | ColorKeyItem[]
    | ColorKeyGradientItem[]
    | ColorKeyDiscreteScaleItem[]
  title?: ReactNode
  /** When true, renders as gradient bar. items must be ColorKeyGradientItem[] */
  gradient?: boolean
  /** When true, renders discrete color scale (adjacent swatches, no gap). items must be ColorKeyDiscreteScaleItem[] */
  discreteScale?: boolean
  /** Swatch group props. Number of item columns within this group. */
  columns?: number
  swatchSize?: number
  strokeWidth?: number
  strokeColor?: string
  itemSpace?: number
  /** Vertical gap between wrapped rows. Defaults to itemSpace when not set. */
  itemRowSpace?: number
  labelStyle?: React.CSSProperties
  groupTitleStyle?: React.CSSProperties
  /** Gradient / discrete scale group props */
  maxWidth?: number
  height?: number
  barLabels?: [ReactNode, ReactNode]
  barLabelsStyle?: React.CSSProperties
  borderRadius?: number
}

function isGroup (x: ColorKeyItem | ColorKeyGroup): x is ColorKeyGroup {
  return 'items' in x && Array.isArray(x.items)
}

function isGradientItem (x: unknown): x is ColorKeyGradientItem {
  return typeof x === 'object' && x !== null && 'value' in x && 'color' in x
}

function isDiscreteScaleItem (x: unknown): x is ColorKeyDiscreteScaleItem {
  return typeof x === 'object' && x !== null && 'color' in x && !('value' in x)
}

interface SwatchGroupProps {
  gradient?: never
  items: ColorKeyItem[] | ColorKeyGroup[]
  title?: ReactNode
  titleStyle?: React.CSSProperties
  /** Number of groups per row. Default 1 (e.g. on mobile). */
  columns?: number
  /** Number of item columns within a group. Default 2 on mobile, else flex wrap. */
  itemColumns?: number
  swatchSize?: number
  strokeWidth?: number
  strokeColor?: string
  groupSpacing?: number
  /** Gap between groups when columns > 1. Defaults to groupSpacing. */
  groupGap?: number
  itemSpace?: number
  /** Vertical gap between wrapped rows. Defaults to itemSpace when not set. */
  itemRowSpace?: number
  labelStyle?: React.CSSProperties
  groupTitleStyle?: React.CSSProperties
  /** Defaults for gradient groups */
  maxWidth?: number
  height?: number
  barLabels?: [ReactNode, ReactNode]
  barLabelsStyle?: React.CSSProperties
  borderRadius?: number
}

interface GradientProps {
  gradient: true
  items: ColorKeyGradientItem[]
  title?: ReactNode
  titleStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
  barLabelsStyle?: React.CSSProperties
  maxWidth?: number
  height?: number
  barLabels?: [ReactNode, ReactNode]
  borderRadius?: number
}

interface DiscreteScaleProps {
  discreteScale: true
  items: ColorKeyDiscreteScaleItem[]
  title?: ReactNode
  titleStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
  barLabelsStyle?: React.CSSProperties
  maxWidth?: number
  height?: number
  barLabels?: [ReactNode, ReactNode]
  borderRadius?: number
}

export type ColorKeyProps =
  | SwatchGroupProps
  | GradientProps
  | DiscreteScaleProps
  | (ColorKeyItem & { items?: never })

/**
 * Wraps content with optional color key title.
 */
function withColorKeyTitle (
  content: ReactNode,
  title?: ReactNode,
  titleStyle?: React.CSSProperties
) {
  if (!title) return content
  const mergedTitleStyle = mergeLabelStyle(
    DEFAULT_COLOR_KEY_TITLE_STYLE,
    titleStyle
  )
  return (
    <ColorKeyWrapper>
      <ColorKeyTitle style={mergedTitleStyle}>{title}</ColorKeyTitle>
      {content}
    </ColorKeyWrapper>
  )
}

const ColorKeyWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const ColorKeyTitle = styled.div``

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Label = styled.span``

const SwatchBase = styled.span<{ $size: number }>`
  display: block;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  flex-shrink: 0;
`

interface StrokeProps {
  $strokeWidth?: number
  $strokeColor?: string
}

const CircleSwatch = styled(SwatchBase)<{ $color: string } & StrokeProps>`
  background-color: ${props => props.$color};
  border-radius: 50%;
  border: ${props =>
    props.$strokeWidth && props.$strokeWidth > 0
      ? `${props.$strokeWidth}px solid ${props.$strokeColor ?? 'currentColor'}`
      : 'none'};
`

const SquareSwatch = styled(SwatchBase)<{ $color: string } & StrokeProps>`
  background-color: ${props => props.$color};
  border: ${props =>
    props.$strokeWidth && props.$strokeWidth > 0
      ? `${props.$strokeWidth}px solid ${props.$strokeColor ?? 'currentColor'}`
      : 'none'};
`

const LineContainer = styled(SwatchBase)`
  display: flex;
  align-items: center;
  justify-content: center;
`

const LineSwatch = styled.span<
  { $color: string; $thickness: number } & StrokeProps
>`
  display: block;
  width: 100%;
  height: ${props => props.$thickness}px;
  background-color: ${props => props.$color};
  border-radius: ${props => props.$thickness}px;
  transform: rotate(-45deg);
  border: ${props =>
    props.$strokeWidth && props.$strokeWidth > 0
      ? `${props.$strokeWidth}px solid ${props.$strokeColor ?? 'currentColor'}`
      : 'none'};
`

interface SwatchDefaults {
  defaultSwatchSize?: number
  defaultStrokeWidth?: number
  defaultStrokeColor?: string
}

/**
 * Renders the swatch based on type
 */
function renderSwatch (
  props: ColorKeyItem,
  defaults?: SwatchDefaults
): ReactNode {
  const size = props.swatchSize ?? defaults?.defaultSwatchSize ?? DEFAULT_SIZE
  const lineThickness = props.lineThickness ?? DEFAULT_LINE_THICKNESS
  const strokeWidth = props.strokeWidth ?? defaults?.defaultStrokeWidth
  const strokeColor = props.strokeColor ?? defaults?.defaultStrokeColor

  const strokeProps =
    strokeWidth && strokeWidth > 0
      ? { $strokeWidth: strokeWidth, $strokeColor: strokeColor }
      : {}

  switch (props.type) {
    case 'circle':
      return (
        <CircleSwatch
          $color={props.color ?? 'transparent'}
          $size={size}
          {...strokeProps}
        />
      )
    case 'square':
      return (
        <SquareSwatch
          $color={props.color ?? 'transparent'}
          $size={size}
          {...strokeProps}
        />
      )
    case 'line':
      return (
        <LineContainer $size={size}>
          <LineSwatch
            $color={props.color ?? 'transparent'}
            $thickness={lineThickness}
            {...strokeProps}
          />
        </LineContainer>
      )
    case 'custom':
      return props.customSwatch ?? null
    default:
      return null
  }
}

interface ColorKeyItemComponentProps extends ColorKeyItem {
  defaultSwatchSize?: number
  defaultStrokeWidth?: number
  defaultStrokeColor?: string
  defaultLabelStyle?: React.CSSProperties
}

/**
 * Merges label styles with later sources overriding earlier. All values must be valid CSS.
 */
function mergeLabelStyle (
  ...styles: (React.CSSProperties | undefined)[]
): React.CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean))
}

/**
 * Renders a single color key item: a color swatch (circle, square, 45° line, or custom) and a label.
 */
const ColorKeyItemComponent = (props: ColorKeyItemComponentProps) => {
  const {
    label,
    defaultSwatchSize,
    defaultStrokeWidth,
    defaultStrokeColor,
    defaultLabelStyle,
    labelStyle: itemLabelStyle
  } = props
  const labelStyle = mergeLabelStyle(
    DEFAULT_LABEL_STYLE,
    defaultLabelStyle,
    itemLabelStyle
  )
  return (
    <Container>
      <span aria-hidden='true'>
        {renderSwatch(props, {
          defaultSwatchSize,
          defaultStrokeWidth,
          defaultStrokeColor
        })}
      </span>
      <Label style={labelStyle}>{label}</Label>
    </Container>
  )
}

interface GradientDefaults {
  maxWidth?: number
  height?: number
  barLabels?: [ReactNode, ReactNode]
  barLabelsStyle?: React.CSSProperties
  borderRadius?: number
  labelStyle?: React.CSSProperties
}

interface RenderGroupDefaults {
  columns?: number
  swatchSize?: number
  strokeWidth?: number
  strokeColor?: string
  itemSpace?: number
  itemRowSpace?: number
  labelStyle?: React.CSSProperties
  groupTitleStyle?: React.CSSProperties
  gradient?: GradientDefaults
}

/**
 * Renders a single group of items with optional title. Renders gradient or swatches based on group.gradient.
 */
function renderGroup (
  group: ColorKeyGroup,
  defaults: RenderGroupDefaults,
  key: number
) {
  const groupTitleStyle = mergeLabelStyle(
    DEFAULT_GROUP_TITLE_STYLE,
    defaults.groupTitleStyle,
    group.groupTitleStyle
  )

  if (group.gradient && group.items?.length) {
    const gradientContent = renderGradientKey(
      group.items.filter(isGradientItem),
      {
        labelStyle: group.labelStyle ?? defaults.gradient?.labelStyle,
        barLabelsStyle:
          group.barLabelsStyle ?? defaults.gradient?.barLabelsStyle,
        maxWidth: group.maxWidth ?? defaults.gradient?.maxWidth,
        height: group.height ?? defaults.gradient?.height,
        barLabels: group.barLabels ?? defaults.gradient?.barLabels,
        borderRadius: group.borderRadius ?? defaults.gradient?.borderRadius
      }
    )
    return (
      <GroupWrapper key={key}>
        {group.title && (
          <GroupTitle style={groupTitleStyle}>{group.title}</GroupTitle>
        )}
        {gradientContent}
      </GroupWrapper>
    )
  }

  if (group.discreteScale && group.items?.length) {
    const discreteItems = group.items.filter(isDiscreteScaleItem)
    const discreteContent = renderDiscreteScaleKey(discreteItems, {
      labelStyle: group.labelStyle ?? defaults.gradient?.labelStyle,
      barLabelsStyle: group.barLabelsStyle ?? defaults.gradient?.barLabelsStyle,
      maxWidth: group.maxWidth ?? defaults.gradient?.maxWidth,
      height: group.height ?? defaults.gradient?.height,
      barLabels: group.barLabels ?? defaults.gradient?.barLabels,
      borderRadius: group.borderRadius ?? defaults.gradient?.borderRadius
    })
    return (
      <GroupWrapper key={key}>
        {group.title && (
          <GroupTitle style={groupTitleStyle}>{group.title}</GroupTitle>
        )}
        {discreteContent}
      </GroupWrapper>
    )
  }

  const columns = group.columns ?? defaults.columns
  const swatchSize = group.swatchSize ?? defaults.swatchSize
  const strokeWidth = group.strokeWidth ?? defaults.strokeWidth
  const strokeColor = group.strokeColor ?? defaults.strokeColor
  const itemSpace = group.itemSpace ?? defaults.itemSpace ?? DEFAULT_ITEM_SPACE
  const itemRowSpace =
    group.itemRowSpace ?? defaults.itemRowSpace ?? DEFAULT_ITEM_ROW_SPACE
  const labelStyle = mergeLabelStyle(defaults.labelStyle, group.labelStyle)

  return (
    <GroupWrapper key={key}>
      {group.title && (
        <GroupTitle style={groupTitleStyle}>{group.title}</GroupTitle>
      )}
      <ItemsContainer
        $columns={columns}
        $itemSpace={itemSpace}
        $itemRowSpace={itemRowSpace}
      >
        {(group.items as ColorKeyItem[]).map((item, i) => (
          <ColorKeyItemComponent
            key={i}
            {...item}
            defaultSwatchSize={swatchSize}
            defaultStrokeWidth={strokeWidth}
            defaultStrokeColor={strokeColor}
            defaultLabelStyle={labelStyle}
          />
        ))}
      </ItemsContainer>
    </GroupWrapper>
  )
}

/**
 * Normalizes gradient values to 0-100 range for CSS stops.
 */
function normalizeGradientStops (
  items: ColorKeyGradientItem[]
): Array<{ color: string; percent: number; label: ReactNode }> {
  const sorted = [...items].sort((a, b) => a.value - b.value)
  const min = sorted[0]?.value ?? 0
  const max = sorted[sorted.length - 1]?.value ?? 100
  const range = max - min || 1
  return sorted.map(item => ({
    color: item.color,
    percent: ((item.value - min) / range) * 100,
    label: item.label
  }))
}

/**
 * Renders a gradient color key bar with labels.
 */
function renderGradientKey (
  items: ColorKeyGradientItem[],
  options?: {
    labelStyle?: React.CSSProperties
    barLabelsStyle?: React.CSSProperties
    maxWidth?: number
    height?: number
    barLabels?: [ReactNode, ReactNode]
    borderRadius?: number
  }
) {
  const stops = normalizeGradientStops(items)
  const gradientCss = stops.map(s => `${s.color} ${s.percent}%`).join(', ')
  const mergedLabelStyle = mergeLabelStyle(
    DEFAULT_LABEL_STYLE,
    options?.labelStyle
  )
  const mergedBarLabelsStyle = mergeLabelStyle(
    DEFAULT_BAR_LABELS_STYLE,
    options?.barLabelsStyle
  )
  const barLabels = options?.barLabels
  return (
    <GradientContainer $maxWidth={options?.maxWidth}>
      {barLabels && (
        <GradientBarLabels>
          <Label style={mergedBarLabelsStyle}>{barLabels[0]}</Label>
          <Label style={mergedBarLabelsStyle}>{barLabels[1]}</Label>
        </GradientBarLabels>
      )}
      <GradientBar
        $gradient={gradientCss}
        $height={options?.height}
        $borderRadius={options?.borderRadius}
      />
      <GradientLabels $columns={stops.length}>
        {stops.map((stop, i) => (
          <GradientLabelCell
            key={i}
            $align={
              i === 0 ? 'start' : i === stops.length - 1 ? 'end' : 'center'
            }
          >
            <Label style={mergedLabelStyle}>{stop.label}</Label>
          </GradientLabelCell>
        ))}
      </GradientLabels>
    </GradientContainer>
  )
}

/**
 * Renders a discrete color scale: adjacent swatches with no gap, min/max labels.
 */
function renderDiscreteScaleKey (
  items: ColorKeyDiscreteScaleItem[],
  options?: {
    labelStyle?: React.CSSProperties
    barLabelsStyle?: React.CSSProperties
    maxWidth?: number
    height?: number
    barLabels?: [ReactNode, ReactNode]
    borderRadius?: number
  }
) {
  const mergedLabelStyle = mergeLabelStyle(
    DEFAULT_LABEL_STYLE,
    options?.labelStyle
  )
  const mergedBarLabelsStyle = mergeLabelStyle(
    DEFAULT_BAR_LABELS_STYLE,
    options?.barLabelsStyle
  )
  const barLabels = options?.barLabels
  const hasLabels = items.some(item => item.label)
  return (
    <GradientContainer $maxWidth={options?.maxWidth}>
      {barLabels && (
        <GradientBarLabels>
          <Label style={mergedBarLabelsStyle}>{barLabels[0]}</Label>
          <Label style={mergedBarLabelsStyle}>{barLabels[1]}</Label>
        </GradientBarLabels>
      )}
      <DiscreteScaleBar
        $height={options?.height}
        $borderRadius={options?.borderRadius}
      >
        {items.map((item, i) => (
          <DiscreteScaleSegment key={i} $color={item.color} />
        ))}
      </DiscreteScaleBar>
      {hasLabels && (
        <GradientLabels $columns={items.length}>
          {items.map((item, i) => (
            <GradientLabelCell key={i} $align='center'>
              <Label style={mergedLabelStyle}>{item.label}</Label>
            </GradientLabelCell>
          ))}
        </GradientLabels>
      )}
    </GradientContainer>
  )
}

/**
 * Renders color key item(s). Accepts single item, items array (flat or groups), or gradient mode.
 * Detects groups by checking if first element has an items array.
 */
const ColorKey = (props: ColorKeyProps) => {
  const { isMobile } = useMFContext()

  if ('gradient' in props && props.gradient && props.items?.length) {
    const content = renderGradientKey(props.items, {
      labelStyle: props.labelStyle,
      barLabelsStyle: props.barLabelsStyle,
      maxWidth: props.maxWidth,
      height: props.height,
      barLabels: props.barLabels,
      borderRadius: props.borderRadius
    })
    return withColorKeyTitle(content, props.title, props.titleStyle)
  }

  if ('discreteScale' in props && props.discreteScale && props.items?.length) {
    const discreteProps = props as DiscreteScaleProps
    const content = renderDiscreteScaleKey(discreteProps.items, {
      labelStyle: discreteProps.labelStyle,
      barLabelsStyle: discreteProps.barLabelsStyle,
      maxWidth: discreteProps.maxWidth,
      height: discreteProps.height,
      barLabels: discreteProps.barLabels,
      borderRadius: discreteProps.borderRadius
    })
    return withColorKeyTitle(
      content,
      discreteProps.title,
      discreteProps.titleStyle
    )
  }

  if ('items' in props && props.items?.length) {
    const p = props as SwatchGroupProps
    const groupColumns = p.columns ?? 1
    const defaultItemColumns = p.itemColumns ?? (isMobile ? 2 : undefined)
    const groupDefaults: RenderGroupDefaults = {
      columns: defaultItemColumns,
      swatchSize: p.swatchSize,
      strokeWidth: p.strokeWidth,
      strokeColor: p.strokeColor,
      itemSpace: p.itemSpace,
      itemRowSpace: p.itemRowSpace,
      labelStyle: p.labelStyle,
      groupTitleStyle: p.groupTitleStyle,
      gradient: {
        maxWidth: p.maxWidth,
        height: p.height,
        barLabels: p.barLabels,
        barLabelsStyle: p.barLabelsStyle,
        borderRadius: p.borderRadius,
        labelStyle: p.labelStyle
      }
    }

    if (isGroup(p.items[0])) {
      const groups = p.items as ColorKeyGroup[]
      const content = (
        <GroupsContainer
          $columns={groupColumns}
          $groupGap={p.groupGap ?? p.groupSpacing ?? DEFAULT_GROUP_SPACING}
        >
          {groups.map((group, i) => renderGroup(group, groupDefaults, i))}
        </GroupsContainer>
      )
      return withColorKeyTitle(content, p.title, p.titleStyle)
    }

    const items = p.items as ColorKeyItem[]
    const itemSpace = p.itemSpace ?? DEFAULT_ITEM_SPACE
    const itemRowSpace = p.itemRowSpace ?? DEFAULT_ITEM_ROW_SPACE
    const content = (
      <ItemsContainer
        $columns={defaultItemColumns}
        $itemSpace={itemSpace}
        $itemRowSpace={itemRowSpace}
      >
        {items.map((item, i) => (
          <ColorKeyItemComponent
            key={i}
            {...item}
            defaultSwatchSize={p.swatchSize}
            defaultStrokeWidth={p.strokeWidth}
            defaultStrokeColor={p.strokeColor}
            defaultLabelStyle={p.labelStyle}
          />
        ))}
      </ItemsContainer>
    )
    return withColorKeyTitle(content, p.title, p.titleStyle)
  }

  if (!('items' in props)) {
    return (
      <ColorKeyItemComponent
        {...props}
        defaultSwatchSize={undefined}
        defaultStrokeWidth={undefined}
        defaultStrokeColor={undefined}
        defaultLabelStyle={undefined}
      />
    )
  }

  return null
}

interface GroupsContainerProps {
  $columns?: number
  $groupGap?: number
}

const GroupsContainer = styled.div<GroupsContainerProps>`
  display: ${props =>
    props.$columns !== undefined && props.$columns > 1 ? 'grid' : 'flex'};
  flex-direction: column;
  grid-template-columns: ${props =>
    props.$columns !== undefined && props.$columns > 1
      ? `repeat(${props.$columns}, 1fr)`
      : 'unset'};
  gap: ${props => props.$groupGap ?? DEFAULT_GROUP_SPACING}px;
`

const GroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`

const GroupTitle = styled.span``

interface ItemsContainerProps {
  $columns?: number
  $itemSpace?: number
  $itemRowSpace?: number
}

const ItemsContainer = styled.div<ItemsContainerProps>`
  display: ${props => (props.$columns !== undefined ? 'grid' : 'flex')};
  flex-wrap: ${props => (props.$columns === undefined ? 'wrap' : 'unset')};
  grid-template-columns: ${props =>
    props.$columns !== undefined ? `repeat(${props.$columns}, 1fr)` : 'unset'};
  column-gap: ${props => props.$itemSpace ?? DEFAULT_ITEM_SPACE}px;
  row-gap: ${props => props.$itemRowSpace ?? DEFAULT_ITEM_ROW_SPACE}px;
  align-items: center;
`

const GradientContainer = styled.div<{ $maxWidth?: number }>`
  display: flex;
  flex-direction: column;
  gap: 0px;
  max-width: ${props => (props.$maxWidth ? `${props.$maxWidth}px` : 'none')};
`

const GradientBarLabels = styled.div`
  display: flex;
  justify-content: space-between;
  line-height: 1em;
`

const GradientBar = styled.div<{
  $gradient: string
  $height?: number
  $borderRadius?: number
}>`
  height: ${props => props.$height ?? DEFAULT_BAR_HEIGHT}px;
  border-radius: ${props =>
    props.$borderRadius ?? DEFAULT_GRADIENT_BAR_BORDER_RADIUS}px;
  background: linear-gradient(to right, ${props => props.$gradient});
`

const DiscreteScaleBar = styled.div<{
  $height?: number
  $borderRadius?: number
}>`
  display: flex;
  height: ${props => props.$height ?? DEFAULT_BAR_HEIGHT}px;
  border-radius: ${props =>
    props.$borderRadius ?? DEFAULT_GRADIENT_BAR_BORDER_RADIUS}px;
  overflow: hidden;
`

const DiscreteScaleSegment = styled.div<{ $color: string }>`
  flex: 1;
  background-color: ${props => props.$color};
`

const GradientLabels = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.$columns}, 1fr)`};
  column-gap: 4px;
`

const GradientLabelCell = styled.div<{ $align: 'start' | 'center' | 'end' }>`
  text-align: ${props => props.$align};
  align-self: start;
  line-height: 1em;
`

export default ColorKey
