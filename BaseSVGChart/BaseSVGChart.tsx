import { FrequencyType } from 'components/Calculator/Calculator'
import { scaleLinear, max, extent } from 'd3'
import { useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useResizeObserver } from 'usehooks-ts'
import { DrawMultiple, useTicks, WrapInGroup } from './ChartHelpers'

const X_Ticks = DrawMultiple('x-ticks')
const Y_Ticks = DrawMultiple('y-ticks')
const Y_AxisLabel = WrapInGroup('y-axis-label')

const TickCount = 5
const MinStep = 1
const BaseSVGChart = ({
  data = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8]
  ],
  svgHeight = 300
}: {
  data?: number[][]
  svgHeight?: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { width = 0 } = useResizeObserver({
    ref,
    box: 'border-box'
  })
  const plotArea = useMemo(
    () => ({
      left: 10,
      top: 10,
      right: width - 10,
      bottom: svgHeight - 10
    }),
    [width]
  )

  const yDomain = useMemo(() => extent(data, d => d[1] || 0), [data]) as [
    number,
    number
  ]

  const xDomain = useMemo(() => extent(data, d => d[0] || 0), [data]) as [
    number,
    number
  ]

  const xScale = useMemo(() => {
    return scaleLinear<number>()
      .domain(xDomain)
      .range([plotArea.left, plotArea.right])
  }, [plotArea.left, plotArea.right, xDomain])

  const yScale = useMemo(() => {
    return scaleLinear()
      .domain(yDomain)
      .range([0, plotArea.bottom - plotArea.top])
  }, [plotArea.top, plotArea.bottom, yDomain])

  const yStep = useMemo(() => {
    return Math.max(Math.ceil(yDomain[1] / TickCount), MinStep)
  }, [yDomain])
  const xStep = useMemo(() => {
    return Math.max(Math.ceil(xDomain[1] / TickCount), MinStep)
  }, [xDomain])

  const yTicks = useTicks({ min: 0, max: yDomain[1] + yStep, step: yStep })
  const xTicks = useTicks({ min: xDomain[0], max: xDomain[1], step: xStep })
  const columnWidth = (plotArea.right - plotArea.left) / 8 - 1
  return (
    <ChartContainer ref={ref} $svgHeight={svgHeight}>aaaaa
      <ChartSVG>
        <defs>
          <marker
            id='arrow'
            viewBox='0 0 10 10'
            markerWidth='5'
            markerHeight='5'
            refX='8'
            refY='5'
            orient='auto'
            fill='var(--text-color)'
          >
            <polygon points='0 0 10 5 0 10' />
          </marker>
        </defs>
        <g className='columns'>
          {data.map(([x, y], i) => {
            return (
              <g key={i}>
                <ChartBar
                  x={xScale(x)}
                  y={plotArea.bottom - yScale(y)}
                  width={columnWidth}
                  height={yScale(y)}
                  fill='var(--gray-1)'
                />
              </g>
            )
          })}
        </g>

        <Axis
          x1={plotArea.left}
          y1={plotArea.bottom}
          x2={plotArea.right}
          y2={plotArea.bottom}
        />

        <Y_AxisLabel
          element={
            <>
              <Axis
                x1={plotArea.left}
                y1={plotArea.top - 20}
                x2={plotArea.left}
                y2={plotArea.top - 50}
                stroke='var(--gray-2)'
                stroke-width='1.5'
                marker-end='url(#arrow)'
              />
              <AxisLabel
                x={plotArea.left + 15}
                y={plotArea.top - 40}
                textAnchor='start'
              >
                <tspan>Anzahl</tspan>
                <tspan x={plotArea.left + 15} dy='1.2em'>
                  Teilnehmende
                </tspan>
              </AxisLabel>
            </>
          }
        />

        <Y_Ticks
          data={yTicks}
          element={(y: number) => (
            <g key={y}>
              <TickText
                x={plotArea.left - 10}
                y={plotArea.bottom - yScale(y)}
                textAnchor='end'
              >
                {y}
              </TickText>
              <TickLine
                x1={plotArea.left}
                x2={plotArea.right}
                y1={plotArea.bottom - yScale(y)}
                y2={plotArea.bottom - yScale(y)}
              />
            </g>
          )}
        />

        <AxisLabel
          x={plotArea.left}
          y={plotArea.bottom + 40}
          textAnchor='start'
        >
          Trinktage pro Woche
        </AxisLabel>
        <X_Ticks
          data={xTicks}
          element={(x: number) => (
            <g key={x}>
              <TickText
                x={xScale(x) + columnWidth / 2}
                y={plotArea.bottom + 20}
                textAnchor='middle'
              >
                {x}
              </TickText>
            </g>
          )}
        />
      </ChartSVG>
    </ChartContainer>
  )
}
const ChartContainer = styled.div<{ $svgHeight: number }>`
  width: 100%;
  height: ${({ $svgHeight }) => $svgHeight}px;
`
const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`

const ChartBar = styled.rect`
  fill: var(--brandblue-bright-4);
  transition: y 0.4s ease-in-out, height 0.4s ease-in-out;
`

const Axis = styled.line`
  stroke: var(--text-color);
  stroke-width: 2;
`

const TickText = styled.text`
  font-size: 12px;
  fill: var(--text-color);
`

const TickLine = styled.line`
  stroke: var(--brandblue-bright-3);
  stroke-width: 0.5;
`
const AxisLabel = styled.text`
  font-size: 15px;
  fill: var(--text-color);
`
export default BaseSVGChart
