import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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

type RelativeOffsetBase =
  | { x: number; y: number }
  | ((zoom: number) => { x: number; y: number })

interface AppliedScrollState {
  scrollY: number
  xOffset: number
  yOffset: number
  zoom: number
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
const ZOOM_EPSILON = 0.001
const OVERLAY_CLASS = 'scroll-transform-overlay'
const INLINE_POSITIONED_SELECTOR =
  '[style*="position: absolute"],[style*="position:absolute"],[style*="position: fixed"],[style*="position:fixed"]'

/** Collects percentage-anchored overlays so they keep a constant screen size while zooming. */
const findScrollTransformOverlays = (root: HTMLElement) => {
  const overlays = Array.from(
    root.querySelectorAll<HTMLElement>(INLINE_POSITIONED_SELECTOR)
  ).filter(({ style: { position, left, top } }) => {
    if (position !== 'absolute' && position !== 'fixed') return false

    return left.includes('%') || top.includes('%')
  })

  overlays.forEach((overlay) => overlay.classList.add(OVERLAY_CLASS))

  return overlays
}

/** Counter-scales the overlays so their anchor stays put while their content keeps its size. */
const applyOverlayScale = (overlays: HTMLElement[], zoom: number) => {
  const overlayScale = String(1 / zoom)

  overlays.forEach((overlay) => overlay.style.setProperty('scale', overlayScale))
}

/** Returns the unscaled CSS width for the moving content. */
const getCssLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value

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

/** Resolves a percent offset base for a specific zoom value. */
const getOffsetBase = (relativeOffsetBase: RelativeOffsetBase, zoom: number) =>
  typeof relativeOffsetBase === 'function'
    ? relativeOffsetBase(zoom)
    : relativeOffsetBase

/** Converts a keyframe into pixel offsets using that keyframe's own zoom. */
const resolvePositionTransform = (
  position: ScrollTransformPosition,
  relativeOffsetBase: RelativeOffsetBase
) => {
  const zoom = position.zoom ?? 1
  const offsetBase = getOffsetBase(relativeOffsetBase, zoom)

  return {
    xOffset:
      getPositionXOffset(position) +
      (offsetBase.x * getPositionXOffsetPercent(position)) / 100,
    yOffset:
      getPositionYOffset(position) +
      (offsetBase.y * getPositionYOffsetPercent(position)) / 100,
    zoom,
  }
}

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

/** Prevents scroll noise from triggering extra compositor writes. */
const hasSameScrollState = (
  previous: AppliedScrollState,
  next: AppliedScrollState
) =>
  Math.abs(previous.scrollY - next.scrollY) < POSITION_EPSILON &&
  Math.abs(previous.xOffset - next.xOffset) < POSITION_EPSILON &&
  Math.abs(previous.yOffset - next.yOffset) < POSITION_EPSILON &&
  Math.abs(previous.zoom - next.zoom) < POSITION_EPSILON

/** Measures scroll from the wrapper's document start instead of page top. */
const getRelativeScrollY = (element: HTMLElement | null) => {
  if (!element) return window.scrollY

  return -element.getBoundingClientRect().top
}

/** Writes the GPU transform without going through React. */
const applyContentTransform = (
  element: HTMLElement | null,
  xOffset: number,
  yOffset: number,
  zoom: number
) => {
  if (!element) return

  element.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${zoom})`
}

/** Updates the fixed debug overlay without scheduling a React render. */
const applyDevOverlay = (
  element: HTMLElement | null,
  state: AppliedScrollState,
  viewportHeight: number
) => {
  if (!element) return

  element.textContent = [
    `scrollY: ${Math.round(state.scrollY)}px`,
    `x: ${Math.round(state.xOffset)}px`,
    `y: ${Math.round(state.yOffset)}px`,
    `zoom: ${state.zoom.toFixed(2)}`,
    `height: ${Math.round(viewportHeight)}px`,
  ].join('\n')
}

/** Interpolates the x offset, y offset, and zoom for the current scroll position. */
export const getScrollTransform = (
  scrollY: number,
  positions: ScrollTransformPosition[],
  relativeOffsetBase: RelativeOffsetBase = {
    x: 0,
    y: 0,
  }
) => {
  const sortedPositions = getSortedPositions(positions)

  if (sortedPositions.length === 0) return { xOffset: 0, yOffset: 0, zoom: 1 }
  if (scrollY <= sortedPositions[0].scroll) {
    return resolvePositionTransform(sortedPositions[0], relativeOffsetBase)
  }

  for (let index = 1; index < sortedPositions.length; index += 1) {
    const previousPosition = sortedPositions[index - 1]
    const nextPosition = sortedPositions[index]

    if (scrollY > nextPosition.scroll) continue
    if (previousPosition.scroll === nextPosition.scroll) {
      return resolvePositionTransform(nextPosition, relativeOffsetBase)
    }

    const progress =
      (scrollY - previousPosition.scroll) /
      (nextPosition.scroll - previousPosition.scroll)
    const previousTransform = resolvePositionTransform(
      previousPosition,
      relativeOffsetBase
    )
    const nextTransform = resolvePositionTransform(
      nextPosition,
      relativeOffsetBase
    )

    return {
      xOffset: interpolateValue(
        previousTransform.xOffset,
        nextTransform.xOffset,
        progress
      ),
      yOffset: interpolateValue(
        previousTransform.yOffset,
        nextTransform.yOffset,
        progress
      ),
      zoom: interpolateValue(previousTransform.zoom, nextTransform.zoom, progress),
    }
  }

  return resolvePositionTransform(
    sortedPositions[sortedPositions.length - 1],
    relativeOffsetBase
  )
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
  const viewportRef = useRef<HTMLDivElement>(null)
  const movingContentRef = useRef<HTMLDivElement>(null)
  const devOverlayRef = useRef<HTMLDivElement>(null)
  const overlaysRef = useRef<HTMLElement[]>([])
  const appliedOverlayZoomRef = useRef(Number.POSITIVE_INFINITY)
  const appliedScrollStateRef = useRef<AppliedScrollState>({
    scrollY: 0,
    xOffset: 0,
    yOffset: 0,
    zoom: 1,
  })
  const [baseContentHeight, setBaseContentHeight] = useState(0)
  const [layoutSize, setLayoutSize] = useState({
    contentWidth: 0,
    viewportWidth: 0,
  })
  const sortedPositions = useMemo(() => getSortedPositions(positions), [positions])
  const viewportHeight = getViewportHeight(baseContentHeight, sortedPositions)
  const contentWidth = getCssLength(maxWidth)
  const initialZoom = sortedPositions[0]?.zoom ?? 1
  const layoutRef = useRef({
    baseContentHeight,
    contentWidth: layoutSize.contentWidth,
    viewportWidth: layoutSize.viewportWidth,
    maxWidth,
    sortedPositions,
    viewportHeight,
    showDevScrollPosition,
  })

  layoutRef.current = {
    baseContentHeight,
    contentWidth: layoutSize.contentWidth,
    viewportWidth: layoutSize.viewportWidth,
    maxWidth,
    sortedPositions,
    viewportHeight,
    showDevScrollPosition,
  }

  const getRelativeOffsetBase = (zoom: number) => {
    const layout = layoutRef.current
    const baseWidth =
      typeof layout.maxWidth === 'number' ? layout.maxWidth : layout.contentWidth

    return {
      x: Math.max(0, baseWidth * zoom - layout.viewportWidth),
      y: layout.baseContentHeight * zoom,
    }
  }

  const applyScrollTransform = () => {
    const layout = layoutRef.current
    const scrollY = getRelativeScrollY(viewportRef.current)
    const nextScrollState = {
      scrollY,
      ...getScrollTransform(scrollY, layout.sortedPositions, getRelativeOffsetBase),
    }

    if (hasSameScrollState(appliedScrollStateRef.current, nextScrollState)) return

    appliedScrollStateRef.current = nextScrollState
    applyContentTransform(
      movingContentRef.current,
      nextScrollState.xOffset,
      nextScrollState.yOffset,
      nextScrollState.zoom
    )

    // Overlays only need a write when the zoom itself moved, so panning stays a single
    // compositor-only transform write. The applied zoom is tracked separately so slow
    // zoom ramps accumulate instead of being swallowed by the epsilon check.
    if (Math.abs(appliedOverlayZoomRef.current - nextScrollState.zoom) >= ZOOM_EPSILON) {
      appliedOverlayZoomRef.current = nextScrollState.zoom
      applyOverlayScale(overlaysRef.current, nextScrollState.zoom)
    }

    if (layout.showDevScrollPosition) {
      applyDevOverlay(devOverlayRef.current, nextScrollState, layout.viewportHeight)
    }
  }

  const applyScrollTransformRef = useRef(applyScrollTransform)
  applyScrollTransformRef.current = applyScrollTransform

  useLayoutEffect(() => {
    const element = movingContentRef.current
    const viewport = viewportRef.current

    if (!element || !viewport) return

    const updateLayoutMeasurements = () => {
      const measuredBaseHeight = element.offsetHeight
      const nextSize = {
        contentWidth: element.offsetWidth,
        viewportWidth: viewport.offsetWidth,
      }

      setBaseContentHeight((previousHeight) =>
        Math.abs(previousHeight - measuredBaseHeight) < POSITION_EPSILON
          ? previousHeight
          : measuredBaseHeight
      )
      setLayoutSize((previousSize) => {
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

    /** Rebuilds the overlay list and brings newly mounted overlays to the current zoom. */
    const collectOverlays = () => {
      const { zoom } = appliedScrollStateRef.current

      overlaysRef.current = findScrollTransformOverlays(element)
      appliedOverlayZoomRef.current = zoom
      applyOverlayScale(overlaysRef.current, zoom)
    }

    updateLayoutMeasurements()
    collectOverlays()

    const resizeObserver = new ResizeObserver(updateLayoutMeasurements)
    resizeObserver.observe(element)
    resizeObserver.observe(viewport)

    const mutationObserver = new MutationObserver(collectOverlays)
    mutationObserver.observe(element, { childList: true, subtree: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    applyScrollTransformRef.current()
  }, [baseContentHeight, layoutSize, maxWidth, sortedPositions])

  // Sampling the scroll offset once per frame while in view keeps the transform locked to the
  // compositor. Scroll events are coalesced and delivered late during iOS momentum scrolling,
  // which is what makes an event-driven transform stutter on mobile.
  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    let animationFrame = 0

    const runFrame = () => {
      animationFrame = window.requestAnimationFrame(runFrame)
      applyScrollTransformRef.current()
    }

    const stopLoop = () => {
      if (!animationFrame) return

      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return stopLoop()
        if (!animationFrame) runFrame()
      },
      { rootMargin: '20% 0px' }
    )

    applyScrollTransformRef.current()
    intersectionObserver.observe(viewport)

    return () => {
      intersectionObserver.disconnect()
      stopLoop()
    }
  }, [])

  return (
    <ScrollViewport
      ref={viewportRef}
      $height={viewportHeight}
      className={`${className ?? ''} scroll-transform`.trim()}
    >
      {showDevScrollPosition && <DevScrollPosition ref={devOverlayRef} />}
      <MovingContent
        ref={movingContentRef}
        $width={contentWidth}
        $initialZoom={initialZoom}
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
  $initialZoom: number
}>`
  --scroll-content-zoom: ${({ $initialZoom }) => $initialZoom};
  --scroll-content-overlay-scale: calc(1 / var(--scroll-content-zoom));
  width: ${({ $width }) => $width};
  max-width: ${({ $width }) => $width};
  contain: layout;
  overflow: visible;
  transform: translate3d(0, 0, 0) scale(${({ $initialZoom }) => $initialZoom});
  transform-origin: 0 0;
  backface-visibility: hidden;
  will-change: transform;

  /*
   * Percentage-anchored overlays keep a constant screen size while the content zooms.
   * This is the first-paint value only; afterwards applyOverlayScale writes the scale
   * inline on the collected overlays, which avoids invalidating the whole subtree.
   */
  .scroll-transform-overlay,
  [style*='position: absolute'][style*='%'] {
    transform-origin: 0 0;
    scale: var(--scroll-content-overlay-scale);
  }
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
  line-height: 1.35;
  white-space: pre;
  pointer-events: none;
`

export default ScrollTransform
