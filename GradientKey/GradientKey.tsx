import React from 'react'
import styled from 'styled-components'

export interface GradientStop {
  value: number
  color: string
  label?: string
}

export interface GradientKeyProps {
  min: number
  max: number
  stops: GradientStop[]
  unit?: string
  minLabel?: React.ReactNode
  maxLabel?: React.ReactNode
  height?: number
  maxWidth?: number | string
  labelGap?: number
  ariaLabel?: string
  style?: React.CSSProperties
}

/** Builds a CSS linear-gradient string from sorted color stops */
const buildGradient = (stops: GradientStop[], min: number, max: number): string => {
  const range = max - min
  if (range === 0) return `linear-gradient(to right, ${stops[0]?.color ?? 'transparent'})`

  const sorted = [...stops].sort((a, b) => a.value - b.value)
  const colorStops = sorted
    .map(s => {
      const pct = ((s.value - min) / range) * 100
      return `${s.color} ${pct}%`
    })
    .join(', ')

  return `linear-gradient(to right, ${colorStops})`
}

/** Calculates the percentage position of a value within [min, max] */
const toPercent = (value: number, min: number, max: number): number => {
  const range = max - min
  if (range === 0) return 0
  return ((value - min) / range) * 100
}

/**
 * GradientKey displays a continuous color gradient bar with labels
 * positioned at specific values along the scale.
 */
const GradientKey: React.FC<GradientKeyProps> = ({
  min,
  max,
  stops,
  unit = '',
  minLabel,
  maxLabel,
  height = 12,
  maxWidth,
  labelGap = 4,
  ariaLabel = 'Farbskala',
  style,
}) => {
  const gradient = buildGradient(stops, min, max)
  const labeledStops = stops.filter(s => s.label != null)
  const hasEndLabels = minLabel != null || maxLabel != null

  return (
    <Container style={{ maxWidth, ...style }} role="img" aria-label={ariaLabel}>
      {hasEndLabels && (
        <EndLabels $gap={labelGap}>
          <EndLabel>{minLabel}</EndLabel>
          <EndLabel>{maxLabel}</EndLabel>
        </EndLabels>
      )}
      <Bar $height={height} $gradient={gradient} />
      {labeledStops.length > 0 && (
        <Labels>
          {labeledStops.map((stop, i) => {
            const pct = toPercent(stop.value, min, max)
            const isFirst = i === 0
            const isLast = i === labeledStops.length - 1
            const align = isFirst ? 'left' : isLast ? 'right' : 'center'
            return (
              <LabelTick key={stop.label ?? i} $pct={pct} $align={align}>
                <Tick $height={Math.round(height * 0.4)} />
                <LabelText>
                  {stop.label}
                  {unit}
                </LabelText>
              </LabelTick>
            )
          })}
        </Labels>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

interface EndLabelsProps {
  $gap: number
}

const EndLabels = styled.div<EndLabelsProps>`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${p => p.$gap}px;
`

const EndLabel = styled.span`
  font-size: 11px;
  line-height: 1.2em;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`

interface BarProps {
  $height: number
  $gradient: string
}

const Bar = styled.div<BarProps>`
  width: 100%;
  height: ${p => p.$height}px;
  background: ${p => p.$gradient};
  border-radius: 1px;
`

const Labels = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
`

interface LabelTickProps {
  $pct: number
  $align: 'left' | 'center' | 'right'
}

const ALIGN_MAP = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const

const TRANSFORM_MAP = {
  left: 'translateX(0)',
  center: 'translateX(-50%)',
  right: 'translateX(-100%)',
} as const

const LabelTick = styled.div<LabelTickProps>`
  position: absolute;
  left: ${p => p.$pct}%;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: ${p => ALIGN_MAP[p.$align]};
  transform: ${p => TRANSFORM_MAP[p.$align]};
`

interface TickProps {
  $height: number
}

const Tick = styled.div<TickProps>`
  width: 1px;
  height: ${p => p.$height}px;
  background: currentColor;
  opacity: 0.4;
`

const LabelText = styled.span`
  font-size: 11px;
  white-space: nowrap;
  line-height: 1.2em;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`

export default GradientKey
