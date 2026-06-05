import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'

export interface ScrollTransformPosition {
  scroll: number
  xOffset?: number
  xOffsetPercent?: number
  yOffset?: number
  yOffsetPercent?: number
  zoom?: number
  offset?: number
  offsetPercent?: number
}

interface ScrollTransformProps {
  children: ReactNode
  maxWidth: number | string
  positions: ScrollTransformPosition[]
  className?: string
  showDevScrollPosition?: boolean
}

const BASE_POSITION: ScrollTransformPosition = {
  scroll: 0,
  xOffset: 0,
  xOffsetPercent: 0,
  yOffset: 0,
  yOffsetPercent: 0,
  zoom: 1,
}

const POSITION_EPSILON = 0.01

/** Returns the rendered content width for the current zoom. */
const getScaledCssLength = (value: number | string, zoom: number) =>
  typeof value === 'number' ? `${value * zoom}px` : value

/** Returns the rendered content width in pixels when maxWidth is numeric. */
const getScaledPixelLength = (value: number | string, zoom: number) =>
  typeof value === 'number' ? value * zoom : null

/** Returns the x offset while supporting the old offset alias. */
const getPositionXOffset = (position: ScrollTransformPosition) =>
  position.xOffset ?? position.offset ?? 0

/** Returns the x offset percent while supporting the old offsetPercent alias. */
const getPositionXOffsetPercent = (position: ScrollTransformPosition) =>
  position.xOffsetPercent ?? position.offsetPercent ?? 0

/** Returns the y offset in pixels. */
const getPositionYOffset = (position: ScrollTransformPosition) =>
  position.yOffset ?? 0

/** Returns the y offset percent. */
const getPositionYOffsetPercent = (position: ScrollTransformPosition) =>
  position.yOffsetPercent ?? 0

/** Interpolates a numeric value between two keyframes. */
const interpolateValue = (from: number, to: number, progress: number) =>
  from + (to - from) * progress

/** Sorts scroll positions and adds a zero-offset start point when needed. */
const getSortedPositions = (positions: ScrollTransformPosition[]) => {
  const finitePositions = positions.filter(
    ({
      scroll,
      offset,
      offsetPercent,
      xOffset,
      xOffsetPercent,
      yOffset,
      yOffsetPercent,
      zoom,
    }) =>
      Number.isFinite(scroll) &&
      (offset === undefined || Number.isFinite(offset)) &&
      (offsetPercent === undefined || Number.isFinite(offsetPercent)) &&
      (xOffset === undefined || Number.isFinite(xOffset)) &&
      (xOffsetPercent === undefined || Number.isFinite(xOffsetPercent)) &&
      (yOffset === undefined || Number.isFinite(yOffset)) &&
      (yOffsetPercent === undefined || Number.isFinite(yOffsetPercent)) &&
      (zoom === undefined || Number.isFinite(zoom))
  )
  const hasInitialPosition = finitePositions.some(({ scroll }) => scroll === 0)
  const positionsWithInitial = hasInitialPosition
    ? finitePositions
    : [BASE_POSITION, ...finitePositions]

  return [...positionsWithInitial].sort((a, b) => a.scroll - b.scroll)
}

/** Calculates the maximum visual height needed without resizing during scroll. */
const getViewportHeight = (
  baseContentHeight: number,
  positions: ScrollTransformPosition[]
) => {
  if (baseContentHeight === 0) return 0

  return positions.reduce((maxHeight, position) => {
    const zoom = position.zoom ?? 1
    const renderedHeight = baseContentHeight * zoom
    const yOffset =
      getPositionYOffset(position) +
      (renderedHeight * getPositionYOffsetPercent(position)) / 100

    return Math.max(maxHeight, renderedHeight + Math.max(0, yOffset))
  }, baseContentHeight)
}

/** Prevents scroll noise from triggering extra layout writes. */
const hasSameScrollState = (
  previous: ReturnType<typeof getScrollTransform> & { scrollY: number },
  next: ReturnType<typeof getScrollTransform> & { scrollY: number }
) =>
  Math.abs(previous.scrollY - next.scrollY) < POSITION_EPSILON &&
  Math.abs(previous.xOffset - next.xOffset) < POSITION_EPSILON &&
  Math.abs(previous.yOffset - next.yOffset) < POSITION_EPSILON &&
  Math.abs(previous.zoom - next.zoom) < POSITION_EPSILON

/** Measures scroll from the wrapper's document start instead of page top. */
const getRelativeScrollY = (element: HTMLElement | null) => {
  if (!element) return window.scrollY

  const elementTop = element.getBoundingClientRect().top + window.scrollY

  return window.scrollY - elementTop
}

/** Interpolates the x offset, y offset, and zoom for the current scroll position. */
export const getScrollTransform = (
  scrollY: number,
  positions: ScrollTransformPosition[],
  relativeOffsetBase = {
    x: 0,
    y: 0,
  }
) => {
  const sortedPositions = getSortedPositions(positions)

  if (sortedPositions.length === 0) return { xOffset: 0, yOffset: 0, zoom: 1 }
  if (scrollY <= sortedPositions[0].scroll) {
    const position = sortedPositions[0]

    return {
      xOffset:
        getPositionXOffset(position) +
        (relativeOffsetBase.x * getPositionXOffsetPercent(position)) / 100,
      yOffset:
        getPositionYOffset(position) +
        (relativeOffsetBase.y * getPositionYOffsetPercent(position)) / 100,
      zoom: position.zoom ?? 1,
    }
  }

  for (let index = 1; index < sortedPositions.length; index += 1) {
    const previousPosition = sortedPositions[index - 1]
    const nextPosition = sortedPositions[index]

    if (scrollY > nextPosition.scroll) continue
    if (previousPosition.scroll === nextPosition.scroll) {
      return {
        xOffset:
          getPositionXOffset(nextPosition) +
          (relativeOffsetBase.x * getPositionXOffsetPercent(nextPosition)) / 100,
        yOffset:
          getPositionYOffset(nextPosition) +
          (relativeOffsetBase.y * getPositionYOffsetPercent(nextPosition)) / 100,
        zoom: nextPosition.zoom ?? 1,
      }
    }

    const progress =
      (scrollY - previousPosition.scroll) /
      (nextPosition.scroll - previousPosition.scroll)
    const previousZoom = previousPosition.zoom ?? 1
    const nextZoom = nextPosition.zoom ?? 1
    const xOffset = interpolateValue(
      getPositionXOffset(previousPosition),
      getPositionXOffset(nextPosition),
      progress
    )
    const xOffsetPercent = interpolateValue(
      getPositionXOffsetPercent(previousPosition),
      getPositionXOffsetPercent(nextPosition),
      progress
    )
    const yOffset = interpolateValue(
      getPositionYOffset(previousPosition),
      getPositionYOffset(nextPosition),
      progress
    )
    const yOffsetPercent = interpolateValue(
      getPositionYOffsetPercent(previousPosition),
      getPositionYOffsetPercent(nextPosition),
      progress
    )

    return {
      xOffset: xOffset + (relativeOffsetBase.x * xOffsetPercent) / 100,
      yOffset: yOffset + (relativeOffsetBase.y * yOffsetPercent) / 100,
      zoom: interpolateValue(previousZoom, nextZoom, progress),
    }
  }

  const lastPosition = sortedPositions[sortedPositions.length - 1]

  return {
    xOffset:
      getPositionXOffset(lastPosition) +
      (relativeOffsetBase.x * getPositionXOffsetPercent(lastPosition)) / 100,
    yOffset:
      getPositionYOffset(lastPosition) +
      (relativeOffsetBase.y * getPositionYOffsetPercent(lastPosition)) / 100,
    zoom: lastPosition.zoom ?? 1,
  }
}

/** Interpolates the x offset for the current scroll position. */
export const getScrollTransformXOffset = (
  scrollY: number,
  positions: ScrollTransformPosition[]
) => getScrollTransform(scrollY, positions).xOffset

/** Transforms oversized content based on scroll-relative keyframes. */
const ScrollTransform = ({
  children,
  maxWidth,
  positions,
  className,
  showDevScrollPosition = false,
}: ScrollTransformProps) => {
  const [scrollState, setScrollState] = useState({
    scrollY: 0,
    xOffset: 0,
    yOffset: 0,
    zoom: 1,
  })
  const viewportRef = useRef<HTMLDivElement>(null)
  const movingContentRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(scrollState.zoom)
  const [baseContentHeight, setBaseContentHeight] = useState(0)
  const [layoutSize, setLayoutSize] = useState({
    contentWidth: 0,
    viewportWidth: 0,
  })
  const sortedPositions = useMemo(() => getSortedPositions(positions), [positions])
  const viewportHeight = getViewportHeight(baseContentHeight, sortedPositions)
  const contentWidth = getScaledCssLength(maxWidth, scrollState.zoom)

  zoomRef.current = scrollState.zoom

  const getOverflowWidth = (zoom: number) => {
    const scaledPixelLength = getScaledPixelLength(maxWidth, zoom)
    const measuredContentWidth = scaledPixelLength ?? layoutSize.contentWidth

    return Math.max(0, measuredContentWidth - layoutSize.viewportWidth)
  }

  const getRelativeOffsetBase = (zoom: number) => ({
    x: getOverflowWidth(zoom),
    y: baseContentHeight * zoom,
  })

  useEffect(() => {
    const element = movingContentRef.current
    const viewport = viewportRef.current

    if (!element || !viewport) return

    const updateLayoutMeasurements = () => {
      const contentRect = element.getBoundingClientRect()
      const viewportRect = viewport.getBoundingClientRect()
      const measuredBaseHeight = contentRect.height / zoomRef.current

      setBaseContentHeight((previousHeight) =>
        Math.max(previousHeight, measuredBaseHeight)
      )
      setLayoutSize((previousSize) => {
        const nextSize = {
          contentWidth: contentRect.width,
          viewportWidth: viewportRect.width,
        }

        if (
          Math.abs(previousSize.contentWidth - nextSize.contentWidth) <
            POSITION_EPSILON &&
          Math.abs(previousSize.viewportWidth - nextSize.viewportWidth) <
            POSITION_EPSILON
        ) {
          return previousSize
        }

        return nextSize
      })
    }

    updateLayoutMeasurements()

    const observer = new ResizeObserver(updateLayoutMeasurements)
    observer.observe(element)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let animationFrame = 0

    const handleScroll = () => {
      if (animationFrame) return

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        const scrollY = getRelativeScrollY(viewportRef.current)
        const nextTransform = getScrollTransform(scrollY, sortedPositions)
        const relativeOffsetBase = getRelativeOffsetBase(nextTransform.zoom)
        const nextScrollState = {
          scrollY,
          ...getScrollTransform(scrollY, sortedPositions, relativeOffsetBase),
        }

        setScrollState((previousScrollState) =>
          hasSameScrollState(previousScrollState, nextScrollState)
            ? previousScrollState
            : nextScrollState
        )
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [
    baseContentHeight,
    layoutSize.contentWidth,
    layoutSize.viewportWidth,
    maxWidth,
    sortedPositions,
  ])

  return (
    <ScrollViewport
      ref={viewportRef}
      $height={viewportHeight}
      className={`${className ?? ''} scroll-transform`.trim()}
    >
      {showDevScrollPosition && (
        <DevScrollPosition>
          scrollY: {Math.round(scrollState.scrollY)}px
          <br />
          x: {Math.round(scrollState.xOffset)}px
          <br />
          y: {Math.round(scrollState.yOffset)}px
          <br />
          zoom: {scrollState.zoom.toFixed(2)}
          <br />
          height: {Math.round(viewportHeight)}px
        </DevScrollPosition>
      )}
      <MovingContent
        ref={movingContentRef}
        $width={contentWidth}
        $xOffset={scrollState.xOffset}
        $yOffset={scrollState.yOffset}
        $zoom={scrollState.zoom}
        className="scroll-transform-content"
      >
        {children}
      </MovingContent>
    </ScrollViewport>
  )
}

const ScrollViewport = styled.div<{
  $height: number
}>`
  width: 100%;
  height: ${({ $height }) => ($height > 0 ? `${$height}px` : 'auto')};
  overflow: hidden;
  overflow-anchor: none;
`

const MovingContent = styled.div<{
  $width: string
  $xOffset: number
  $yOffset: number
  $zoom: number
}>`
  --scroll-content-zoom: ${({ $zoom }) => $zoom};
  width: ${({ $width }) => $width};
  max-width: ${({ $width }) => $width};
  contain: layout;
  overflow: visible;
  transform: translate(
    ${({ $xOffset }) => $xOffset}px,
    ${({ $yOffset }) => $yOffset}px
  );
  will-change: transform;
`

const DevScrollPosition = styled.div`
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 2147483647;
  padding: 6px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.78);
  color: white;
  font-family: monospace;
  font-size: 12px;
  line-height: 1;
  pointer-events: none;
`

export default ScrollTransform
