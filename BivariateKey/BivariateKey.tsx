import React, { ReactNode, useId } from 'react'
import styled from 'styled-components'

const DEFAULT_RAMP_SIZE = 160
const LABEL_OFFSET = 5
const LABEL_GAP = 3
const FONT_SIZE = 12
const CHAR_WIDTH = FONT_SIZE * 0.62
const ARROW_HEAD = 6
const ARROW_CROSS = 8
const AXIS_GAP = 6

export type ColorScaleMode = 'gradient' | 'cells'

export type AxisScale = {
  label: string
  unit: string
  edges: number[]
}

export type ColorScale = {
  mode: ColorScaleMode
  colors: string[][]
  x: AxisScale
  y: AxisScale
}

export interface BivariateKeyProps {
  colorscale: ColorScale
  rampSize?: number
  xAxisLabels?: string[]
  yAxisLabels?: string[]
  xAxisTitle?: string | ReactNode
  yAxisTitle?: string | ReactNode
  /** Overrides the generated aria-label. */
  ariaLabel?: string
  /** Overlay aligned to the color grid; percent positions map to the bins. */
  children?: ReactNode
}

/**
 * Renders a bivariate color key with value edges on the left and bottom,
 * and optional axis titles with direction arrows.
 */
const BivariateKey = ({
  colorscale,
  rampSize = DEFAULT_RAMP_SIZE,
  xAxisLabels = [],
  yAxisLabels = [],
  xAxisTitle = '',
  yAxisTitle = '',
  ariaLabel,
  children
}: BivariateKeyProps) => {
  const { colors, mode, x, y } = colorscale
  const yTopToBottom = [...y.edges].reverse()
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const yLabels = yTopToBottom.map((edge, index) =>
    tickText(yAxisLabels, index, edge)
  )
  const xLabels = x.edges.map((edge, index) =>
    tickText(xAxisLabels, index, edge)
  )
  const yChars = Math.max(0, ...yLabels.map(label => label.length))
  const padLeft = Math.ceil(yChars * CHAR_WIDTH + (yChars ? LABEL_GAP : 0) + 1)
  const padBottom = Math.ceil(LABEL_OFFSET + LABEL_GAP + FONT_SIZE)
  const svgWidth = padLeft + rampSize
  const svgHeight = rampSize + padBottom
  const resolvedAriaLabel =
    ariaLabel ??
    `${y.label} (${y.unit}), ${y.edges[0]} to ${
      y.edges[y.edges.length - 1]
    }. ${x.label} (${x.unit}), ${x.edges[0]} to ${
      x.edges[x.edges.length - 1]
    }.`

  return (
    <Wrapper
      $rampSize={rampSize}
      role='img'
      aria-label={resolvedAriaLabel}
    >
      <YAxis>
        <YTitle>{yAxisTitle ? yAxisTitle : `${y.label} (${y.unit})`}</YTitle>
        <AxisArrow direction='up' length={30} />
      </YAxis>
      <Plot>
        {children != null && (
          <PlotOverlay $padLeft={padLeft}>{children}</PlotOverlay>
        )}
        <Ramp
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width={svgWidth}
          height={svgHeight}
          aria-hidden='true'
        >
          <g transform={`translate(${padLeft}, 0)`}>
            {mode === 'gradient' ? (
              <GradientFill
                colors={colors}
                id={gradientId}
                rampSize={rampSize}
              />
            ) : (
              <CellFill colors={colors} rampSize={rampSize} />
            )}
            <AxisTicks
              edges={x.edges}
              labels={xLabels}
              axis='x'
              rampSize={rampSize}
            />
          </g>
          <AxisTicks
            edges={yTopToBottom}
            labels={yLabels}
            axis='y'
            rampSize={rampSize}
          />
        </Ramp>
      </Plot>
      <XAxis>
        <AxisArrow direction='right' length={30} />
        <XTitle>{xAxisTitle ? xAxisTitle : `${x.label} (${x.unit})`}</XTitle>
      </XAxis>
    </Wrapper>
  )
}

/** Draws a line-and-head arrow along one axis. */
function AxisArrow ({
  direction,
  length
}: {
  direction: 'up' | 'right'
  length: number
}) {
  const isUp = direction === 'up'
  const width = isUp ? ARROW_CROSS : length
  const height = isUp ? length : ARROW_CROSS
  const mid = ARROW_CROSS / 2

  return (
    <ArrowSvg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden='true'
    >
      {isUp ? (
        <>
          <line x1={mid} y1={height} x2={mid} y2={ARROW_HEAD} />
          <polygon
            points={`${mid},0 ${mid - ARROW_HEAD / 2},${ARROW_HEAD} ${
              mid + ARROW_HEAD / 2
            },${ARROW_HEAD}`}
          />
        </>
      ) : (
        <>
          <line x1={0} y1={mid} x2={width - ARROW_HEAD} y2={mid} />
          <polygon
            points={`${width},${mid} ${width - ARROW_HEAD},${
              mid - ARROW_HEAD / 2
            } ${width - ARROW_HEAD},${mid + ARROW_HEAD / 2}`}
          />
        </>
      )}
    </ArrowSvg>
  )
}

/** Percent position of an edge label along its side. */
function edgePercent (index: number, edgeCount: number) {
  const steps = Math.max(edgeCount - 1, 1)
  return (index / steps) * 100
}

/** Label for one tick: custom text when provided, otherwise the edge value. */
function tickText (labels: string[], index: number, edge: number) {
  return labels[index] !== undefined ? labels[index] : String(edge)
}

/** Labels along one ramp axis. */
function AxisTicks ({
  edges,
  labels,
  axis,
  rampSize
}: {
  edges: number[]
  labels: string[]
  axis: 'x' | 'y'
  rampSize: number
}) {
  const last = edges.length - 1

  return (
    <g>
      {edges.map((edge, index) => {
        const at = (edgePercent(index, edges.length) / 100) * rampSize
        const label = labels[index]
        const isY = axis === 'y'
        const isFirst = index === 0
        const isLast = index === last

        return (
          <g key={`${axis}-${edge}`}>
            {label !== '' && (
              <AxisText
                x={isY ? 0 : at}
                y={isY ? at : rampSize + LABEL_OFFSET + LABEL_GAP}
                textAnchor={
                  isY ? 'start' : isFirst ? 'start' : isLast ? 'end' : 'middle'
                }
                dominantBaseline={
                  isY
                    ? isFirst
                      ? 'text-before-edge'
                      : isLast
                      ? 'text-after-edge'
                      : 'central'
                    : 'hanging'
                }
              >
                {label}
              </AxisText>
            )}
          </g>
        )
      })}
    </g>
  )
}

/** Fills the ramp by blending the color matrix. Low y sits at the bottom. */
function GradientFill ({
  colors,
  id,
  rampSize
}: {
  colors: string[][]
  id: string
  rampSize: number
}) {
  const gradientStrips = rampSize
  const stripHeight = rampSize / gradientStrips

  return (
    <g shapeRendering='crispEdges'>
      <defs>
        {Array.from({ length: gradientStrips }, (_, index) => (
          <linearGradient key={index} id={`${id}-${index}`}>
            {stopsAt(colors, (index + 0.5) / gradientStrips).map(stop => (
              <stop
                key={stop.offset}
                offset={`${stop.offset * 100}%`}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        ))}
      </defs>
      {Array.from({ length: gradientStrips }, (_, index) => (
        <rect
          key={index}
          y={index * stripHeight}
          width={rampSize}
          height={stripHeight}
          fill={`url(#${id}-${index})`}
        />
      ))}
    </g>
  )
}

/** Fills one solid rectangle per cell. Low y sits at the bottom. */
function CellFill ({
  colors,
  rampSize
}: {
  colors: string[][]
  rampSize: number
}) {
  const rows = colors.length
  const cols = colors[0]?.length ?? 0
  if (!rows || !cols) return null

  const cellWidth = rampSize / cols
  const cellHeight = rampSize / rows

  return (
    <g shapeRendering='crispEdges'>
      {colors.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <rect
            key={`${rowIndex}-${colIndex}`}
            x={colIndex * cellWidth}
            y={rampSize - (rowIndex + 1) * cellHeight}
            width={cellWidth}
            height={cellHeight}
            fill={color}
          />
        ))
      )}
    </g>
  )
}

/** Stop list for one horizontal slice. Samples sit at cell centers. */
function stopsAt (colors: string[][], fyFromTop: number) {
  const rows = colors.length
  const cols = colors[0]?.length ?? 0
  if (!rows || !cols) return []

  const sy = clamp((1 - fyFromTop) * rows - 0.5, 0, rows - 1)
  const y0 = Math.floor(sy)
  const y1 = Math.min(y0 + 1, rows - 1)
  const ty = sy - y0
  const at = (col: number) => mixHex(colors[y0][col], colors[y1][col], ty)
  const stops = [{ offset: 0, color: at(0) }]

  for (let col = 0; col < cols; col++) {
    stops.push({ offset: (col + 0.5) / cols, color: at(col) })
  }
  stops.push({ offset: 1, color: at(cols - 1) })
  return stops
}

/** Mixes two #rrggbb colors. t is the weight of the second color. */
function mixHex (a: string, b: string, t: number) {
  if (t === 0) return a
  if (t === 1) return b
  const from = parseHex(a)
  const to = parseHex(b)
  const channels = [0, 1, 2].map(channel =>
    Math.round(mix(from[channel], to[channel], t))
  )
  return `#${channels
    .map(channel => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

/** Linear mix of two channel values. */
function mix (a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Clamps a number to a range. */
function clamp (value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

type Rgb = [number, number, number]

/** Parses a #rrggbb color into RGB channels. */
function parseHex (hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const Wrapper = styled.div<{ $rampSize: number }>`
  --ramp-size: ${props => props.$rampSize}px;
  display: inline-grid;
  width: fit-content;
  grid-template-columns: auto auto auto;
  grid-template-rows: var(--ramp-size) auto;
  column-gap: ${AXIS_GAP}px;
  align-items: start;
`

const YAxis = styled.div`
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: flex-start;
  gap: ${AXIS_GAP}px;
  height: var(--ramp-size);
`

const XAxis = styled.div`
  grid-column: 3;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: ${AXIS_GAP}px;
  height: var(--ramp-size);
  padding-left: 5px;
`

const AxisText = styled.text`
  font-size: ${FONT_SIZE}px;
`

const AxisTitle = styled.div`
  font-size: ${FONT_SIZE}px;
  line-height: 1.2;
  b {
    font-size: 1.1em;
  }
`

const YTitle = styled(AxisTitle)`
  text-align: right;
`

const XTitle = styled(AxisTitle)`
  text-align: left;
`

const ArrowSvg = styled.svg`
  display: block;
  flex-shrink: 0;
  overflow: visible;

  line,
  polygon {
    stroke: currentColor;
    fill: currentColor;
    stroke-width: 1.25;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`

const Plot = styled.div`
  grid-column: 2;
  grid-row: 1 / 3;
  position: relative;
  width: fit-content;
`

const PlotOverlay = styled.div<{ $padLeft: number }>`
  position: absolute;
  top: 0;
  left: ${({ $padLeft }) => $padLeft}px;
  width: var(--ramp-size);
  height: var(--ramp-size);
  overflow: visible;
  z-index: 1;

  > * {
    width: 100%;
    height: 100%;
    display: block;
  }
`

const Ramp = styled.svg`
  display: block;
  overflow: visible;
  font-size: ${FONT_SIZE}px;
  font-variant-numeric: tabular-nums;

  text {
    fill: currentColor;
  }
`

export default BivariateKey
