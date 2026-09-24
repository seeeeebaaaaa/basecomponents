import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { PointAnnotation } from './PointAnnotation'
import { ContentContainer, getOffset, useAnimateOnIntersect } from './shared'

type TargetPos = { x: number; y: number }

/**
 * Label-first annotation: `pos` is the content, `targets` are the points.
 * Draws a connector from the label to each target.
 */
export const MultiPointAnnotation = ({
  children,
  targets = [],
  pos = { x: 0, y: 0 },
  fullSize = [100, 100],
  offset = 0,
  connectorStyle,
  markerStyle,
  endMarker = 'none',
  startMarker = 'none',
  customMarkers,
  padding = 0,
  textAnchor = 'left',
  animate = false,
  animationDelay = 200,
  threshold = 0.1
}: {
  children?: ReactNode
  /** Target positions in the same percent space as the annotation `pos`. */
  targets?: TargetPos[]
  /** Origin in percent; injected by AnnotatedContent from the annotation `pos`. */
  pos?: TargetPos
  fullSize?: [number, number]
  /** Pixel nudge for the label only; connectors still start at `pos`. */
  offset?: number | [number, number]
  connectorStyle?: ConnectorSpecs
  markerStyle?: MarkerStyle
  endMarker?: 'arrow' | 'circle' | 'triangle' | 'none' | string
  startMarker?: 'arrow' | 'circle' | 'triangle' | 'none' | string
  customMarkers?: Record<string, ReactNode>
  textAnchor?: 'left' | 'center' | 'right'
  padding?: number
  animate?: boolean
  animationDelay?: number
  threshold?: number
}) => {
  const { isVisible, shouldAnimate, ref } = useAnimateOnIntersect(
    animate,
    animationDelay,
    threshold
  )
  const [width, height] = fullSize
  const [labelH, labelV] = getOffset(offset)

  let shiftLabelHorizontal = 0
  if (textAnchor === 'center') shiftLabelHorizontal = -50
  if (textAnchor === 'right') shiftLabelHorizontal = -100

  return (
    <AnnotationContainer className='annoContainer' ref={ref}>
      {targets.map((target, index) => (
        <PointAnnotation
          key={index}
          offset={[
            ((target.x - pos.x) / 100) * width,
            ((target.y - pos.y) / 100) * height
          ]}
          connectorStyle={connectorStyle}
          markerStyle={markerStyle}
          endMarker={endMarker}
          startMarker={startMarker}
          customMarkers={customMarkers}
          padding={padding}
          animate={animate}
          animationDelay={animationDelay}
          threshold={threshold}
        />
      ))}
      <ContentContainer
        style={{
          minWidth: 'max-content',
          left: labelH,
          top: labelV,
          transform: `translate(${shiftLabelHorizontal}%, -50%)`
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
