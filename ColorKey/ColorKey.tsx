import { useMFContext } from '../MFHelpers'
import React, { ReactNode } from 'react'
import styled from 'styled-components'
import {
  DEFAULT_BAR_BORDER_RADIUS,
  DEFAULT_BAR_HEIGHT,
  DEFAULT_END_LABEL_STYLE,
  DEFAULT_ITEM_GAP,
  DEFAULT_LABEL_STYLE,
  DEFAULT_LINE_THICKNESS,
  DEFAULT_ROW_GAP,
  DEFAULT_SECTION_GAP,
  DEFAULT_SECTION_TITLE_STYLE,
  DEFAULT_SWATCH_SHAPE,
  DEFAULT_SWATCH_SIZE,
  DEFAULT_TITLE_STYLE
} from './ColorKeyDefaults'

export type SwatchShape = 'circle' | 'square' | 'line' | 'custom'

export interface Stroke {
  width?: number
  color?: string
}

export interface BarStyle {
  /** Maximum width of the bar in px. Unconstrained when not set. */
  width?: number
  height?: number
  borderRadius?: number
}

export interface Gap {
  /** Horizontal gap between items. */
  item?: number
  /** Vertical gap between wrapped rows. */
  row?: number
}

export interface ColorKeySwatch {
  label: ReactNode
  color?: string
  /** Defaults to 'circle'. Implied to be 'custom' when `swatch` is given. */
  shape?: SwatchShape
  /** Custom swatch node, rendered in place of the built-in shapes. */
  swatch?: ReactNode
  size?: number
  lineThickness?: number
  stroke?: Stroke
  labelStyle?: React.CSSProperties
}

/** A color stop on a gradient bar. Stops without a value are spread evenly. */
export interface ColorKeyStop {
  color: string
  value?: number
  label?: ReactNode
}

/** One equally sized segment of a stepped bar. */
export interface ColorKeyStep {
  color: string
  label?: ReactNode
}

interface SectionBase {
  title?: ReactNode
  /** Overrides styles.sectionTitle for this section. */
  titleStyle?: React.CSSProperties
  /** Overrides styles.label for this section. */
  labelStyle?: React.CSSProperties
}

interface BarSectionBase extends SectionBase {
  /** Pair of labels above the bar marking its start and end. */
  endLabels?: [ReactNode, ReactNode]
  /** Overrides styles.endLabel for this section. */
  endLabelStyle?: React.CSSProperties
  bar?: BarStyle
}

export interface SwatchSection extends SectionBase {
  type: 'swatches'
  swatches: ColorKeySwatch[]
  /** Swatches per row. Falls back to defaults.columns, else flex wrap. */
  columns?: number
  gap?: Gap
  swatchSize?: number
  stroke?: Stroke
}

export interface GradientSection extends BarSectionBase {
  type: 'gradient'
  stops: ColorKeyStop[]
  /** Value range the bar spans. Defaults to the min and max of the stop values. */
  domain?: [number, number]
}

export interface StepsSection extends BarSectionBase {
  type: 'steps'
  steps: ColorKeyStep[]
}

export type ColorKeySection = SwatchSection | GradientSection | StepsSection

/** Fallbacks for every section. Any section or item may override them locally. */
export interface ColorKeyDefaults {
  columns?: number
  swatchSize?: number
  shape?: SwatchShape
  stroke?: Stroke
  gap?: Gap
  bar?: BarStyle
}

export interface ColorKeyStyles {
  title?: React.CSSProperties
  sectionTitle?: React.CSSProperties
  label?: React.CSSProperties
  endLabel?: React.CSSProperties
}

export interface ColorKeyProps {
  sections: ColorKeySection | ColorKeySection[]
  title?: ReactNode
  /** Sections per row. Default 1. */
  columns?: number
  /** Gap between sections. */
  gap?: number
  defaults?: ColorKeyDefaults
  styles?: ColorKeyStyles
}

/**
 * Renders a color key built from one or more sections: swatch lists, gradient bars or stepped bars.
 * Each section names its own data (`swatches`, `stops`, `steps`), and values cascade
 * root -> section -> item with the nearest one winning.
 */
const ColorKey = ({
  sections,
  title,
  columns = 1,
  gap,
  defaults,
  styles
}: ColorKeyProps) => {
  const { isMobile } = useMFContext()
  const list = Array.isArray(sections) ? sections : [sections]
  if (!list.length) return null

  const resolvedDefaults: ColorKeyDefaults = {
    ...defaults,
    columns: defaults?.columns ?? (isMobile ? 2 : undefined)
  }
  const content = (
    <SectionsContainer $columns={columns} $gap={gap ?? DEFAULT_SECTION_GAP}>
      {list.map((section, i) =>
        renderSection(section, resolvedDefaults, styles, i)
      )}
    </SectionsContainer>
  )
  if (!title) return content

  return (
    <ColorKeyWrapper>
      <Title style={mergeStyle(DEFAULT_TITLE_STYLE, styles?.title)}>
        {title}
      </Title>
      {content}
    </ColorKeyWrapper>
  )
}

/**
 * Renders a single section with its optional title.
 */
function renderSection (
  section: ColorKeySection,
  defaults: ColorKeyDefaults,
  styles: ColorKeyStyles | undefined,
  key: number
) {
  const body = renderSectionBody(section, defaults, styles)
  if (!body) return null

  const titleStyle = mergeStyle(
    DEFAULT_SECTION_TITLE_STYLE,
    styles?.sectionTitle,
    section.titleStyle
  )
  return (
    <SectionWrapper key={key}>
      {section.title && (
        <SectionTitle style={titleStyle}>{section.title}</SectionTitle>
      )}
      {body}
    </SectionWrapper>
  )
}

/**
 * Picks the renderer matching the section type, skipping sections that hold no entries.
 */
function renderSectionBody (
  section: ColorKeySection,
  defaults: ColorKeyDefaults,
  styles: ColorKeyStyles | undefined
): ReactNode {
  switch (section.type) {
    case 'gradient':
      if (!section.stops?.length) return warnEmpty(section.type)
      return renderGradient(section, defaults, styles)
    case 'steps':
      if (!section.steps?.length) return warnEmpty(section.type)
      return renderSteps(section, defaults, styles)
    case 'swatches':
      if (!section.swatches?.length) return warnEmpty(section.type)
      return renderSwatches(section, defaults, styles)
    default:
      return null
  }
}

/**
 * Renders a list of labelled swatches, either wrapping or in a fixed number of columns.
 */
function renderSwatches (
  section: SwatchSection,
  defaults: ColorKeyDefaults,
  styles: ColorKeyStyles | undefined
) {
  const labelStyle = mergeStyle(
    DEFAULT_LABEL_STYLE,
    styles?.label,
    section.labelStyle
  )
  return (
    <ItemsContainer
      $columns={section.columns ?? defaults.columns}
      $itemGap={section.gap?.item ?? defaults.gap?.item ?? DEFAULT_ITEM_GAP}
      $rowGap={section.gap?.row ?? defaults.gap?.row ?? DEFAULT_ROW_GAP}
    >
      {section.swatches.map((swatch, i) => (
        <SwatchRow key={i}>
          <span aria-hidden='true'>
            {renderSwatch(swatch, {
              size:
                swatch.size ??
                section.swatchSize ??
                defaults.swatchSize ??
                DEFAULT_SWATCH_SIZE,
              shape: swatch.swatch
                ? 'custom'
                : swatch.shape ?? defaults.shape ?? DEFAULT_SWATCH_SHAPE,
              stroke: swatch.stroke ?? section.stroke ?? defaults.stroke
            })}
          </span>
          <Label style={mergeStyle(labelStyle, swatch.labelStyle)}>
            {swatch.label}
          </Label>
        </SwatchRow>
      ))}
    </ItemsContainer>
  )
}

/**
 * Renders a continuous gradient bar with each label sitting at its stop's true position.
 */
function renderGradient (
  section: GradientSection,
  defaults: ColorKeyDefaults,
  styles: ColorKeyStyles | undefined
) {
  const stops = resolveStops(section.stops, section.domain)
  const bar = resolveBar(section.bar, defaults.bar)
  const labelStyle = mergeStyle(
    DEFAULT_LABEL_STYLE,
    styles?.label,
    section.labelStyle
  )
  const labelled = stops.filter(stop => stop.label != null)
  const gradientCss =
    stops.length > 1
      ? stops.map(stop => `${stop.color} ${stop.percent}%`).join(', ')
      : `${stops[0].color} 0%, ${stops[0].color} 100%`

  return (
    <BarContainer $maxWidth={bar.width}>
      {renderEndLabels(section, styles)}
      <GradientBar
        $gradient={gradientCss}
        $height={bar.height}
        $borderRadius={bar.borderRadius}
      />
      {labelled.length > 0 && (
        <PositionedLabels>
          <LabelSpacer style={labelStyle} aria-hidden='true'>
            &nbsp;
          </LabelSpacer>
          {labelled.map((stop, i) => (
            <PositionedLabel key={i} $percent={stop.percent} style={labelStyle}>
              {stop.label}
            </PositionedLabel>
          ))}
        </PositionedLabels>
      )}
    </BarContainer>
  )
}

/**
 * Renders a bar of equally sized color segments with labels centered beneath them.
 */
function renderSteps (
  section: StepsSection,
  defaults: ColorKeyDefaults,
  styles: ColorKeyStyles | undefined
) {
  const bar = resolveBar(section.bar, defaults.bar)
  const labelStyle = mergeStyle(
    DEFAULT_LABEL_STYLE,
    styles?.label,
    section.labelStyle
  )
  const hasLabels = section.steps.some(step => step.label != null)

  return (
    <BarContainer $maxWidth={bar.width}>
      {renderEndLabels(section, styles)}
      <StepsBar $height={bar.height} $borderRadius={bar.borderRadius}>
        {section.steps.map((step, i) => (
          <StepSegment key={i} $color={step.color} />
        ))}
      </StepsBar>
      {hasLabels && (
        <StepLabels $columns={section.steps.length}>
          {section.steps.map((step, i) => (
            <Label key={i} style={labelStyle}>
              {step.label}
            </Label>
          ))}
        </StepLabels>
      )}
    </BarContainer>
  )
}

/**
 * Renders the pair of labels above a bar marking its start and end.
 */
function renderEndLabels (
  section: BarSectionBase,
  styles: ColorKeyStyles | undefined
) {
  const { endLabels } = section
  if (!endLabels) return null
  const style = mergeStyle(
    DEFAULT_END_LABEL_STYLE,
    styles?.endLabel,
    section.endLabelStyle
  )
  return (
    <EndLabels>
      <Label style={style}>{endLabels[0]}</Label>
      <Label style={style}>{endLabels[1]}</Label>
    </EndLabels>
  )
}

interface ResolvedSwatch {
  size: number
  shape: SwatchShape
  stroke?: Stroke
}

/**
 * Renders the swatch mark for the given shape.
 */
function renderSwatch (
  swatch: ColorKeySwatch,
  resolved: ResolvedSwatch
): ReactNode {
  const { size, shape, stroke } = resolved
  const color = swatch.color ?? 'transparent'
  const strokeProps =
    stroke?.width && stroke.width > 0
      ? { $strokeWidth: stroke.width, $strokeColor: stroke.color }
      : {}

  switch (shape) {
    case 'custom':
      return swatch.swatch ?? null
    case 'square':
      return <SquareSwatch $color={color} $size={size} {...strokeProps} />
    case 'line':
      return (
        <LineContainer $size={size}>
          <LineSwatch
            $color={color}
            $thickness={swatch.lineThickness ?? DEFAULT_LINE_THICKNESS}
            {...strokeProps}
          />
        </LineContainer>
      )
    default:
      return <CircleSwatch $color={color} $size={size} {...strokeProps} />
  }
}

interface ResolvedStop {
  color: string
  percent: number
  label?: ReactNode
}

/**
 * Places every stop on a 0-100 scale. Stops are spread evenly unless all of them
 * carry a value, in which case they are sorted and mapped onto the domain.
 */
function resolveStops (
  stops: ColorKeyStop[],
  domain?: [number, number]
): ResolvedStop[] {
  const values = stops.map(stop => stop.value)
  if (values.some(value => value === undefined)) {
    if (values.some(value => value !== undefined)) {
      console.warn(
        '[ColorKey] Gradient stops mix set and unset values. Spreading all stops evenly.'
      )
    }
    const lastIndex = stops.length - 1 || 1
    return stops.map((stop, i) => ({
      color: stop.color,
      label: stop.label,
      percent: (i / lastIndex) * 100
    }))
  }

  const sorted = [...stops].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
  const [min, max] = domain ?? [
    sorted[0].value ?? 0,
    sorted[sorted.length - 1].value ?? 0
  ]
  const range = max - min || 1
  return sorted.map(stop => ({
    color: stop.color,
    label: stop.label,
    percent: clampPercent((((stop.value ?? 0) - min) / range) * 100)
  }))
}

/**
 * Merges bar styling from a section over the root defaults.
 */
function resolveBar (bar?: BarStyle, defaults?: BarStyle) {
  return {
    width: bar?.width ?? defaults?.width,
    height: bar?.height ?? defaults?.height ?? DEFAULT_BAR_HEIGHT,
    borderRadius:
      bar?.borderRadius ?? defaults?.borderRadius ?? DEFAULT_BAR_BORDER_RADIUS
  }
}

/**
 * Merges style objects with later sources overriding earlier ones.
 */
function mergeStyle (
  ...styles: (React.CSSProperties | undefined)[]
): React.CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean))
}

const clampPercent = (percent: number) => Math.min(100, Math.max(0, percent))

/**
 * Warns about a section that would render nothing, so it is not silently dropped.
 */
function warnEmpty (type: ColorKeySection['type']) {
  console.warn(`[ColorKey] Section of type "${type}" has no entries.`)
  return null
}

const ColorKeyWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Title = styled.div``

const SectionsContainer = styled.div<{ $columns: number; $gap: number }>`
  display: ${props => (props.$columns > 1 ? 'grid' : 'flex')};
  flex-direction: column;
  grid-template-columns: ${props =>
    props.$columns > 1 ? `repeat(${props.$columns}, 1fr)` : 'unset'};
  gap: ${props => props.$gap}px;
`

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`

const SectionTitle = styled.span``

interface ItemsContainerProps {
  $columns?: number
  $itemGap: number
  $rowGap: number
}

const ItemsContainer = styled.div<ItemsContainerProps>`
  display: ${props => (props.$columns !== undefined ? 'grid' : 'flex')};
  flex-wrap: ${props => (props.$columns === undefined ? 'wrap' : 'unset')};
  grid-template-columns: ${props =>
    props.$columns !== undefined ? `repeat(${props.$columns}, 1fr)` : 'unset'};
  column-gap: ${props => props.$itemGap}px;
  row-gap: ${props => props.$rowGap}px;
  align-items: center;
`

const SwatchRow = styled.div`
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

const BarContainer = styled.div<{ $maxWidth?: number }>`
  display: flex;
  flex-direction: column;
  gap: 0px;
  max-width: ${props => (props.$maxWidth ? `${props.$maxWidth}px` : 'none')};
`

const EndLabels = styled.div`
  display: flex;
  justify-content: space-between;
  line-height: 1em;
`

const GradientBar = styled.div<{
  $gradient: string
  $height: number
  $borderRadius: number
}>`
  height: ${props => props.$height}px;
  border-radius: ${props => props.$borderRadius}px;
  background: linear-gradient(to right, ${props => props.$gradient});
`

const StepsBar = styled.div<{ $height: number; $borderRadius: number }>`
  display: flex;
  height: ${props => props.$height}px;
  border-radius: ${props => props.$borderRadius}px;
  overflow: hidden;
`

const StepSegment = styled.div<{ $color: string }>`
  flex: 1;
  background-color: ${props => props.$color};
`

const StepLabels = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.$columns}, 1fr)`};
  column-gap: 4px;
  text-align: center;
`

/** Holds the absolutely positioned gradient labels, which sit at their stop's percentage. */
const PositionedLabels = styled.div`
  position: relative;
`

/** Invisible single line of text that gives PositionedLabels its height. */
const LabelSpacer = styled.span`
  visibility: hidden;
  white-space: nowrap;
`

const PositionedLabel = styled.span<{ $percent: number }>`
  position: absolute;
  top: 0;
  left: ${props => props.$percent}%;
  white-space: nowrap;
  transform: translateX(
    ${props =>
      props.$percent <= 0 ? '0%' : props.$percent >= 100 ? '-100%' : '-50%'}
  );
`

export default ColorKey
