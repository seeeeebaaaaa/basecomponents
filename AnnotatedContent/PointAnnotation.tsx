import React, { ReactNode, useId } from 'react'
import styled from 'styled-components'
import { ContentContainer, getOffset, useAnimateOnIntersect } from './shared'

const defaultConnectorStyle: Required<ConnectorSpecs> = {
  type: 'straight',
  stroke: 'var(--anno-connector-stroke)',
  direction: 'cw',
  cornerRadius: 100,
  strokeWidth: 1,
  strokeOpacity: 1,
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
  strokeMiterlimit: 4,
  strokeDasharray: 'none',
  strokeDashoffset: 0
}

const defaultMarkerStyle: Required<MarkerStyle> = {
  size: 13,
  fill: 'white',
  stroke: 'var(--anno-connector-stroke)',
  strokeWidth: 1
}

export const PointAnnotation = ({
  children,
  offset = 0,

  connectorStyle,
  markerStyle,

  endMarker = 'none',
  startMarker = 'none',
  customMarkers,

  padding = 0,
  textAnchor,
  animate = false,
  animationDelay = 200,
  threshold = 0.1
}: {
  children?: ReactNode
  connectorStyle?: ConnectorSpecs
  markerStyle?: MarkerStyle
  endMarker?: 'arrow' | 'circle' | 'triangle' | 'none' | string
  startMarker?: 'arrow' | 'circle' | 'triangle' | 'none' | string
  customMarkers?: Record<string, ReactNode>
  textAnchor?: 'left' | 'center' | 'right'
  padding?: number
  offset?: number | [number, number]
  animate?: boolean
  animationDelay?: number
  threshold?: number
}) => {
  const id = useId()
  const { isVisible, shouldAnimate, ref } = useAnimateOnIntersect(
    animate,
    animationDelay,
    threshold
  )

  const [h, v] = getOffset(offset)
  const connectorSettings = {
    ...defaultConnectorStyle,
    ...connectorStyle
  }
  const markerSettings: Required<MarkerStyle> = {
    ...defaultMarkerStyle,
    ...markerStyle,
    ...(markerStyle?.strokeWidth == null && {
      strokeWidth: Number(connectorSettings.strokeWidth) || 1
    })
  }
  const connectorDirection = connectorSettings.direction
  const direction: Direction = getDirection([h, v])
  let shiftToTop =
    direction === 'top' ||
    (direction === 'top-left' && connectorDirection === 'ccw') ||
    (direction === 'top-right' && connectorDirection === 'cw')

  let shiftToBottom =
    direction === 'bottom' ||
    (direction === 'bottom-left' && connectorDirection === 'cw') ||
    (direction === 'bottom-right' && connectorDirection === 'ccw') ||
    (direction === 'top-left' && connectorDirection === 'cw')

  let shiftToRight =
    direction === 'right' ||
    (direction === 'top-right' && connectorDirection === 'ccw') ||
    (direction === 'bottom-right' && connectorDirection === 'cw')

  let shiftToLeft =
    direction === 'left' ||
    (direction === 'top-left' && connectorDirection === 'cw') ||
    (direction === 'bottom-left' && connectorDirection === 'ccw')

  const noshift = !shiftToTop && !shiftToBottom && !shiftToRight && !shiftToLeft

  if (noshift && padding) {
    shiftToRight = true
    shiftToBottom = true
  }

  const { size: markerSize } = markerSettings

  const hasPaddingOnPathEnd =
    padding > 0 && (shiftToLeft || shiftToRight || shiftToTop || shiftToBottom)
  const markerRadius = markerSize / 2
  const startInset =
    (startMarker !== 'none' ? markerRadius : 0) +
    (startMarker !== 'none' && hasPaddingOnPathEnd ? padding : 0)
  const endInset =
    (endMarker !== 'none' ? markerRadius : 0) +
    (hasPaddingOnPathEnd ? padding : 0)

  // Helper function to get marker URL based on marker type
  const getMarkerUrl = (markerType: string) => {
    if (markerType === 'none') return ''
    if (markerType === 'arrow') return `url(#arrow-${id})`
    if (markerType === 'circle') return `url(#circle-${id})`
    if (markerType === 'triangle') return `url(#triangle-${id})`
    // Check if it's a custom marker
    if (customMarkers && customMarkers[markerType]) {
      return `url(#${markerType}-${id})`
    }
    return ''
  }

  let shiftLabelHorizontal = h >= 0 ? 0 : -100
  if (textAnchor === 'center') shiftLabelHorizontal = -50
  if (textAnchor === 'right') shiftLabelHorizontal = -100
  if (textAnchor === 'left') shiftLabelHorizontal = 0

  return (
    <AnnotationContainer className='annoContainer' ref={ref}>
      <LineSvg
        width={Math.max(4, Math.abs(h))}
        height={Math.max(4, Math.abs(v))}
        style={{
          left: h >= 0 ? 0 : h,
          top: v >= 0 ? 0 : v
        }}
        $isVisible={isVisible}
      >
        <defs>
          <marker
            id={`arrow-${id}`}
            markerUnits='userSpaceOnUse'
            viewBox={`0 0 ${markerSize} ${markerSize}`}
            refX={markerSize}
            refY={markerSize / 2}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient='auto-start-reverse'
            overflow='visible'
          >
            <path
              d={`M 0 0 L ${markerSize} ${markerSize / 2} L 0 ${markerSize} z`}
              fill={markerSettings.fill}
              stroke={markerSettings.stroke}
              strokeWidth={markerSettings.strokeWidth}
            />
          </marker>
          <marker
            id={`circle-${id}`}
            markerUnits='userSpaceOnUse'
            viewBox={`0 0 ${markerSize} ${markerSize}`}
            refX={markerSize / 2}
            refY={markerSize / 2}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient='auto-start-reverse'
            overflow='visible'
          >
            <circle
              cx={markerSize / 2}
              cy={markerSize / 2}
              r={markerSize / 2}
              fill={markerSettings.fill}
              stroke={markerSettings.stroke}
              strokeWidth={markerSettings.strokeWidth}
            />
          </marker>
          <marker
            id={`triangle-${id}`}
            markerUnits='userSpaceOnUse'
            viewBox={`0 0 ${markerSize} ${markerSize}`}
            refX={markerSize / 2}
            refY={markerSize}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient='auto-start-reverse'
            overflow='visible'
          >
            <path
              d={`M ${
                markerSize / 2
              } 0 L ${markerSize} ${markerSize} L 0 ${markerSize} z`}
              fill={markerSettings.fill}
              stroke={markerSettings.stroke}
              strokeWidth={markerSettings.strokeWidth}
            />
          </marker>
          {customMarkers &&
            Object.entries(customMarkers).map(([key, markerContent]) => (
              <marker
                key={key}
                id={`${key}-${id}`}
                markerUnits='userSpaceOnUse'
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={markerSize / 2}
                refY={markerSize / 2}
                markerWidth={markerSize}
                markerHeight={markerSize}
                orient='auto-start-reverse'
                overflow='visible'
              >
                {markerContent}
              </marker>
            ))}
        </defs>
        {/* Marker path: full length so markers stay at original positions */}
        <Path
          d={getLinePath(
            v,
            h,
            direction,
            connectorDirection,
            connectorSettings.type,
            connectorSettings.cornerRadius
          )}
          style={{ stroke: 'none' }}
          fill='none'
          markerStart={getMarkerUrl(startMarker)}
          markerEnd={getMarkerUrl(endMarker)}
          $animate={animate}
          $isVisible={isVisible}
        />
        {/* Line path: shortened to respect markerSize and padding */}
        <Path
          d={getLinePath(
            v,
            h,
            direction,
            connectorDirection,
            connectorSettings.type,
            connectorSettings.cornerRadius,
            startInset,
            endInset
          )}
          style={{
            stroke: connectorSettings.stroke,
            strokeWidth: connectorSettings.strokeWidth,
            strokeLinecap: connectorSettings.strokeLinecap,
            strokeLinejoin: connectorSettings.strokeLinejoin,
            strokeDasharray: connectorSettings.strokeDasharray,
            strokeDashoffset: connectorSettings.strokeDashoffset,
            strokeMiterlimit: connectorSettings.strokeMiterlimit,
            strokeOpacity: connectorSettings.strokeOpacity
          }}
          fill='none'
          $animate={animate}
          $isVisible={isVisible}
        />
      </LineSvg>
      <ContentContainer
        style={{
          minWidth: 'max-content',
          left: h,
          top: v,
          transform: `translate(${shiftLabelHorizontal}%,${
            v >= 0 ? 0 : 'calc(-100%)'
          })`,
          marginTop:
            direction === 'left' || direction === 'right' ? '-0.75em' : 0,
          paddingRight: shiftToLeft ? padding + 'px' : 0,
          paddingLeft: shiftToRight ? padding + 'px' : 0,
          paddingBottom: shiftToTop ? padding + 'px' : 0,
          paddingTop: shiftToBottom ? padding + 'px' : 0
        }}
        $isVisible={isVisible}
        $shouldAnimate={shouldAnimate}
      >
        {children}
      </ContentContainer>
    </AnnotationContainer>
  )
}

const AnnotationContainer = styled.div`
  display: inline-block;
  line-height: 1em;
  position: absolute;
`

const LineSvg = styled.svg<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`

const Path = styled.path<{ $animate: boolean; $isVisible: boolean }>`
  ${p =>
    p.$animate
      ? `stroke-dasharray: 1000; stroke-dashoffset: ${
          p.$isVisible ? 0 : 1000
        }; transition: stroke-dashoffset 0.6s ease-in-out;`
      : ''}
`

function getDirection (offset: [number, number]) {
  const [h, v] = offset

  if (h === 0 && v === 0) return 'center'
  if (h === 0) return v > 0 ? 'bottom' : 'top'
  if (v === 0) return h > 0 ? 'right' : 'left'

  if (h > 0) {
    return v > 0 ? 'bottom-right' : 'top-right'
  } else {
    return v > 0 ? 'bottom-left' : 'top-left'
  }
}

function getLinePoints (v: number, h: number) {
  const sx = h >= 0 ? 0 : Math.abs(h)
  const sy = v >= 0 ? 0 : Math.abs(v)
  const ex = h >= 0 ? h : 0
  const ey = v >= 0 ? v : 0
  return { sx, sy, ex, ey }
}

/** Shortens a line segment by moving endpoints inward along the segment direction. */
function shortenSegment (
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  startInset: number,
  endInset: number
) {
  const dx = ex - sx
  const dy = ey - sy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { sx, sy, ex, ey }
  const ux = dx / len
  const uy = dy / len
  const newSx = sx + ux * Math.min(startInset, len / 2)
  const newSy = sy + uy * Math.min(startInset, len / 2)
  const newEx = ex - ux * Math.min(endInset, len / 2)
  const newEy = ey - uy * Math.min(endInset, len / 2)
  return { sx: newSx, sy: newSy, ex: newEx, ey: newEy }
}

/** Returns the corner point for an L-shaped path based on direction. */
function getCornerPoint (
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  direction: Direction,
  curveDirection: 'cw' | 'ccw'
): { cx: number; cy: number } {
  switch (direction) {
    case 'top':
    case 'top-right':
      return curveDirection === 'cw' ? { cx: ex, cy: sy } : { cx: sx, cy: ey }
    case 'right':
    case 'bottom-right':
      return curveDirection === 'cw' ? { cx: sx, cy: ey } : { cx: ex, cy: sy }
    case 'bottom':
    case 'bottom-left':
      return curveDirection === 'cw' ? { cx: ex, cy: sy } : { cx: sx, cy: ey }
    case 'left':
    case 'top-left':
      return curveDirection === 'cw' ? { cx: sx, cy: ey } : { cx: ex, cy: sy }
    default:
      return curveDirection === 'cw' ? { cx: ex, cy: sy } : { cx: sx, cy: ey }
  }
}

/** Shortens curved path endpoints using tangent direction at each end. */
function shortenCurvedEndpoints (
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  startInset: number,
  endInset: number
) {
  let nsx = sx,
    nsy = sy,
    nex = ex,
    ney = ey
  if (startInset > 0) {
    const tx = c1x - sx
    const ty = c1y - sy
    const len = Math.sqrt(tx * tx + ty * ty) || 1
    nsx = sx + (tx / len) * startInset
    nsy = sy + (ty / len) * startInset
  }
  if (endInset > 0) {
    const tx = ex - c2x
    const ty = ey - c2y
    const len = Math.sqrt(tx * tx + ty * ty) || 1
    nex = ex - (tx / len) * endInset
    ney = ey - (ty / len) * endInset
  }
  return { sx: nsx, sy: nsy, ex: nex, ey: ney }
}

/** Builds the cubic bezier control points for the 'curved' (quarter-ellipse) connector. */
function getCurvedControlPoints (
  linePoints: { sx: number; sy: number; ex: number; ey: number },
  h: number,
  v: number,
  direction: Direction,
  curveDirection: 'cw' | 'ccw'
) {
  const halfH = Math.abs(h / 2)
  const halfV = Math.abs(v / 2)

  switch (direction) {
    case 'top':
    case 'top-right':
      return curveDirection === 'cw'
        ? { c1x: linePoints.sx + halfH, c1y: linePoints.sy, c2x: linePoints.ex, c2y: linePoints.sy - halfV }
        : { c1x: linePoints.sx, c1y: linePoints.sy - halfV, c2x: linePoints.sx + halfH, c2y: linePoints.ey }
    case 'right':
    case 'bottom-right':
      return curveDirection === 'cw'
        ? { c1x: linePoints.sx, c1y: linePoints.sy + halfV, c2x: linePoints.sx + halfH, c2y: linePoints.ey }
        : { c1x: linePoints.sx + halfH, c1y: linePoints.sy, c2x: linePoints.ex, c2y: linePoints.sy + halfV }
    case 'bottom':
    case 'bottom-left':
      return curveDirection === 'cw'
        ? { c1x: linePoints.sx - halfH, c1y: linePoints.sy, c2x: linePoints.ex, c2y: linePoints.sy + halfV }
        : { c1x: linePoints.sx, c1y: linePoints.sy + halfV, c2x: linePoints.sx - halfH, c2y: linePoints.ey }
    case 'left':
    case 'top-left':
      return curveDirection === 'cw'
        ? { c1x: linePoints.sx, c1y: linePoints.sy - halfV, c2x: linePoints.sx - halfH, c2y: linePoints.ey }
        : { c1x: linePoints.sx - halfH, c1y: linePoints.sy, c2x: linePoints.ex, c2y: linePoints.sy - halfV }
    default:
      return curveDirection === 'cw'
        ? { c1x: halfH, c1y: linePoints.sy, c2x: linePoints.ex, c2y: halfV }
        : { c1x: linePoints.sx, c1y: halfV, c2x: halfH, c2y: linePoints.ey }
  }
}

/**
 * Builds an SVG path for the connector line.
 * - 'straight': direct diagonal line
 * - 'curved': quarter-ellipse cubic bezier
 * - 'corner': L-shaped path with variable rounding via cornerRadius (0–100)
 */
function getLinePath (
  v: number,
  h: number,
  direction: Direction,
  curveDirection: 'cw' | 'ccw',
  connectorStyle: 'straight' | 'curved' | 'corner',
  cornerRadius = 100,
  startInset = 0,
  endInset = 0
) {
  const linePoints = getLinePoints(v, h)
  let { sx, sy, ex, ey } = linePoints

  if (connectorStyle === 'straight') {
    if (startInset > 0 || endInset > 0) {
      ;({ sx, sy, ex, ey } = shortenSegment(sx, sy, ex, ey, startInset, endInset))
    }
    return `M ${sx} ${sy} L ${ex} ${ey}`
  }

  if (connectorStyle === 'curved') {
    const { c1x, c1y, c2x, c2y } = getCurvedControlPoints(
      linePoints, h, v, direction, curveDirection
    )
    if (startInset > 0 || endInset > 0) {
      ;({ sx, sy, ex, ey } = shortenCurvedEndpoints(
        linePoints.sx, linePoints.sy, linePoints.ex, linePoints.ey,
        c1x, c1y, c2x, c2y, startInset, endInset
      ))
    }
    return `M ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`
  }

  // 'corner' type: L-shaped path with variable rounding
  const { cx, cy } = getCornerPoint(sx, sy, ex, ey, direction, curveDirection)

  const leg1 = Math.sqrt((cx - sx) ** 2 + (cy - sy) ** 2)
  const leg2 = Math.sqrt((ex - cx) ** 2 + (ey - cy) ** 2)
  const maxR = Math.min(leg1, leg2)
  const r = Math.max(0, Math.min(1, cornerRadius / 100)) * maxR

  if (startInset > 0) {
    const dx = cx - linePoints.sx
    const dy = cy - linePoints.sy
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    sx = linePoints.sx + (dx / len) * startInset
    sy = linePoints.sy + (dy / len) * startInset
  }
  if (endInset > 0) {
    const dx = ex - cx
    const dy = ey - cy
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    ex = linePoints.ex - (dx / len) * endInset
    ey = linePoints.ey - (dy / len) * endInset
  }

  if (r === 0) {
    return `M ${sx} ${sy} L ${cx} ${cy} L ${ex} ${ey}`
  }

  const d1x = cx - linePoints.sx
  const d1y = cy - linePoints.sy
  const d1Len = leg1 || 1
  const p1x = cx - (d1x / d1Len) * r
  const p1y = cy - (d1y / d1Len) * r

  const d2x = linePoints.ex - cx
  const d2y = linePoints.ey - cy
  const d2Len = leg2 || 1
  const p2x = cx + (d2x / d2Len) * r
  const p2y = cy + (d2y / d2Len) * r

  return `M ${sx} ${sy} L ${p1x} ${p1y} Q ${cx} ${cy} ${p2x} ${p2y} L ${ex} ${ey}`
}
