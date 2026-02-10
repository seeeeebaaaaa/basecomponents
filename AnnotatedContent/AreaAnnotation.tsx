import React, { ReactNode, useEffect, useId, useState } from 'react'
import styled from 'styled-components'
import { useIntersectionObserver } from 'usehooks-ts'

const defaultShapeStyle: Required<ShapeStyle> = {
  pattern: 'none',
  patternRotation: 45,
  patternWidth: 10,
  patternSpace: 5,
  fill: 'rgba(0,0,0,0.15)',
  stroke: 'gray',
  strokeWidth: 0.5,
  strokeDasharray: "none",
  cornerRadius: 10,
}

type TextStyle = {
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  color?: string
}

const defaultTextStyle: Required<TextStyle> = {
  fontSize: 15,
  fontWeight: 300,
  fontFamily: "var(--font-sansserif)",
  color: "var(--text-color)",
};

interface BaseAreaAnnotationProps {
  shapeType?: 'rect' | 'circle' | 'custom'
  children?: ReactNode
  pattern?: 'crossed' | 'hatched' | 'dotted' | 'none'
  textAnchor?: 'left' | 'center' | 'right'
  offset?: number | [number, number]
  fullSize?: [number, number]
  shapeStyle?: ShapeStyle
  textStyle?: TextStyle
  size?: number | [number, number]
  rotation?: number
  customShape?: { x: number; y: number }[]
  padding?: number
  animate?: boolean
  animationDelay?: number
  threshold?: number
}

export const AreaAnnotation = ({
  children,
  shapeType = 'circle',
  size = 5,
  rotation: rotationProp = 0,
  customShape,
  fullSize = [100, 100],
  textAnchor = 'center',
  offset = 0,
  textStyle = {},
  shapeStyle = {},
  padding = 0,
  animate = false,
  animationDelay = 200,
  threshold = 0.1,
}: BaseAreaAnnotationProps) => {
  const id = useId()
  const [h, v] = getOffset(offset)
  const [isVisible, setIsVisible] = useState(!animate)
  const [hasAnimated, setHasAnimated] = useState(!animate)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold,
    rootMargin: '50px',
    freezeOnceVisible: true,
  })

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      setHasAnimated(true)
      setShouldAnimate(true)
      setTimeout(() => setIsVisible(true), animationDelay)
    }
  }, [isIntersecting, animationDelay, hasAnimated])

  const currentShapeStyle = {
    ...defaultShapeStyle,
    ...shapeStyle,
  }

  const currentTextStyle = {
    ...defaultTextStyle,
    ...textStyle,
  }

  const { pattern, patternWidth, patternSpace, patternRotation, fill } =
    currentShapeStyle
  const hatchId = id.replace(/:/g, '')
  const resolvedShapeType =
    shapeType === 'custom' && !customShape ? 'circle' : shapeType
  if (shapeType === 'custom' && !customShape) {
    console.warn(
      '[AreaAnnotation] Custom shape type requires customShape prop. Falling back to circle.'
    )
  }

  const rotation = resolvedShapeType === 'custom' ? 0 : rotationProp
  const [sx, sy] =
    resolvedShapeType === 'custom'
      ? [0, 0]
      : getSize(size ?? 20, fullSize[0], fullSize[1])

  const getPatternFill = () => {
    switch (pattern) {
      case 'hatched':
        return `url(#hatched_${hatchId})`
      case 'dotted':
        return `url(#dotted_${hatchId})`
      case 'crossed':
        return `url(#crossed_${hatchId})`
      default:
        return fill
    }
  }

  const shapeProps = {
    style: {
      ...currentShapeStyle,
      fill: getPatternFill(),
    } as React.CSSProperties,
  }

  const shapeElement =
    resolvedShapeType === 'circle' ? (
      <ellipse
        rx={sx / 2}
        ry={sy / 2}
        transform={`rotate(${rotation})`}
        {...shapeProps}
      />
    ) : resolvedShapeType === 'rect' ? (
      <rect
        rx={currentShapeStyle.cornerRadius}
        ry={currentShapeStyle.cornerRadius}
        x={-sx / 2}
        y={-sy / 2}
        width={sx}
        height={sy}
        transform={`rotate(${rotation})`}
        {...shapeProps}
      />
    ) : customShape ? (
      <path
        d={customShapeToPath(customShape, fullSize[0], fullSize[1])}
        {...shapeProps}
      />
    ) : null

  return (
    <AnnotationContainer className="annoContainer" ref={ref}>
      <AreaSvg
        width={Math.max(sx, 4)}
        height={Math.max(sy, 4)}
        style={{ left: 0, top: 0 }}
        $isVisible={isVisible}
      >
        <defs>
          <pattern
            id={`dotted_${hatchId}`}
            patternUnits="userSpaceOnUse"
            x={-Math.round(patternSpace / 2)}
            y={-Math.round(patternWidth / 2)}
            patternTransform={`rotate(${patternRotation - rotation} 0 0)`}
            width={patternWidth + patternSpace}
            height={patternWidth + patternSpace}
          >
            <circle
              cx={Math.round(patternWidth / 2)}
              cy={Math.round(patternWidth / 2)}
              r={Math.round(patternWidth / 2)}
              style={{ stroke: 'none', fill }}
            />
          </pattern>
          <pattern
            id={`hatched_${hatchId}`}
            patternUnits="userSpaceOnUse"
            width={patternSpace + patternWidth}
            height={patternSpace + patternWidth}
            patternTransform={`rotate(${patternRotation - rotation} 0 0)`}
          >
            <line
              x1="0"
              y1="0"
              x2={0}
              y2={patternSpace + patternWidth}
              style={{ stroke: fill, strokeWidth: patternWidth }}
            />
          </pattern>
          <pattern
            id={`crossed_${hatchId}`}
            patternUnits="userSpaceOnUse"
            width={patternWidth + patternSpace}
            height={patternWidth + patternSpace}
            patternTransform={`rotate(${patternRotation - rotation} 0 0)`}
          >
            <path
              d={createCrosshatchPath(patternWidth, patternSpace)}
              stroke={fill}
              strokeWidth={patternWidth}
              strokeOpacity={0.5}
            />
          </pattern>
        </defs>
        {shapeElement}
      </AreaSvg>
      <ContentContainer
        style={{
          ...currentTextStyle,
          minWidth: 'max-content',
          left: h,
          top: v,
          transform: 'translate(-50%, -50%)',
          textAlign: textAnchor,
          padding: padding ? `${padding}px` : undefined,
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

const ContentContainer = styled.div<{
  $isVisible: boolean
  $shouldAnimate: boolean
}>`
  position: absolute;
  line-height: 1em;
  opacity: ${(p) => (p.$isVisible ? 1 : 0)};
  scale: ${(p) => (p.$isVisible ? 1 : 0)};
  transform-origin: center center;
  transition: opacity 0.3s ease-in-out;
  * {
    line-height: unset;
  }
  animation: ${(p) =>
    p.$isVisible && p.$shouldAnimate
      ? 'areaScaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      : 'none'};
  @keyframes areaScaleUp {
    0% { scale: 0; }
    70% { scale: 1.2; }
    100% { scale: 1; }
  }
`

const AreaSvg = styled.svg<{ $isVisible: boolean }>`
  position: absolute;
  overflow: visible;
  opacity: ${(p) => (p.$isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`

const createCrosshatchPath = (width: number, space: number) => {
  const tileSize = width + space

  return `M ${space / 2} 0 
          L ${space / 2} ${tileSize}
          M 0 ${space / 2} 
          L ${tileSize} ${space / 2}`
}

function percentageToPixel(percentage: number, total: number) {
  return (percentage * total) / 100
}

function customShapeToPath(
  customShape: {
    x: number
    y: number
  }[],
  width: number,
  height: number,
) {
  // use percentageToPixel
  return [
    customShape
      .map((point, index) => {
        const x = percentageToPixel(point.x, width)
        const y = percentageToPixel(point.y, height)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' '),
    'Z',
  ].join(' ')
}

function getOffset(offset: number | [number, number]) {
  if (Array.isArray(offset)) return offset
  return [offset, offset]
}

function getSize(
  size: number | [number, number],
  width: number,
  height: number,
) {
  if (Array.isArray(size)) {
    return [
      percentageToPixel(size[0], width),
      percentageToPixel(size[1], height),
    ]
  }
  return [percentageToPixel(size, width), percentageToPixel(size, width)]
}