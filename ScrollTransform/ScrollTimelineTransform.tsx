/*
 * Drop-in replacement for ScrollTransform with two ways to drive the same transform:
 *
 * 1. ViewTimeline path (Chromium, Safari 26+): the keyframes are handed to the Web Animations
 *    API once per layout change and interpolated by the compositor. Scrolling never needs the main
 *    thread, so iOS momentum scrolling and long tasks cannot desync the transform from the page.
 *    The timeline is driven by the wrapper's own position in the scrollport, which keeps the
 *    mapping correct on hosts whose article height keeps changing while it loads.
 * 2. rAF fallback (Firefox stable): the original per-frame sampling, but with the layout reads
 *    hoisted out of the frame — the wrapper's document offset and the fully resolved pixel
 *    keyframes are cached, so a frame is a binary search plus a lerp into a reused object.
 *
 * Keyframe resolution itself is shared with ScrollTransform via getScrollTransform, so both
 * components stay pixel-identical.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import styled from 'styled-components'
import { getScrollTransform, type ScrollTransformPosition } from './ScrollTransform'

interface ScrollTimelineTransformProps {
  children: ReactNode
  maxWidth: number | string
  positions: ScrollTransformPosition[]
  className?: string
  showDevScrollPosition?: boolean
}

export interface ResolvedScrollKeyframe {
  scroll: number
  xOffset: number
  yOffset: number
  zoom: number
}

type RelativeOffsetBase = (zoom: number) => { x: number; y: number }

interface MutableScrollState {
  scrollY: number
  xOffset: number
  yOffset: number
  zoom: number
}

const POSITION_EPSILON = 0.01
const ZOOM_EPSILON = 0.001
const DUPLICATE_SAMPLE_EPSILON = 0.001
const KEYFRAME_OFFSET_EPSILON = 1e-6
const OVERLAY_CLASS = 'scroll-transform-overlay'
const INLINE_POSITIONED_SELECTOR =
  '[style*="position: absolute"],[style*="position:absolute"],[style*="position: fixed"],[style*="position:fixed"]'
const OPTIONAL_POSITION_KEYS = [
  'offset',
  'offsetPercent',
  'xOffset',
  'xOffsetPercent',
  'yOffset',
  'yOffsetPercent',
  'zoom'
] as const
const SUPPORTS_VIEW_TIMELINE = typeof ViewTimeline !== 'undefined'

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

/** Checks whether the mutation observer actually found a different overlay set. */
const hasSameOverlays = (previous: HTMLElement[], next: HTMLElement[]) =>
  previous.length === next.length &&
  previous.every((overlay, index) => overlay === next[index])

/** Returns the unscaled CSS width for the moving content. */
const getCssLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value

/** Mirrors the original's finite-value guard for a single keyframe. */
const isFinitePosition = (position: ScrollTransformPosition) =>
  Number.isFinite(position.scroll) &&
  OPTIONAL_POSITION_KEYS.every((key) => {
    const value = position[key]

    return value === undefined || Number.isFinite(value)
  })

/** Mirrors getSortedPositions on the scroll axis, including the injected zero base point. */
const getSortedScrollValues = (positions: ScrollTransformPosition[]) => {
  const scrollValues = positions.filter(isFinitePosition).map(({ scroll }) => scroll)

  if (!scrollValues.includes(0)) scrollValues.push(0)

  return scrollValues.sort((a, b) => a - b)
}

/** Resolves every keyframe into absolute pixel values using the shared interpolation. */
export const getResolvedScrollKeyframes = (
  positions: ScrollTransformPosition[],
  relativeOffsetBase: RelativeOffsetBase
): ResolvedScrollKeyframe[] => {
  const scrollValues = getSortedScrollValues(positions)

  return scrollValues.map((scroll, index) => {
    // Duplicate scroll values would all resolve to the first of the pair, so later duplicates are
    // sampled just past the shared position to keep the original's stepped behaviour.
    const sampleScroll =
      index > 0 && scrollValues[index - 1] === scroll
        ? scroll + DUPLICATE_SAMPLE_EPSILON
        : scroll

    return {
      scroll,
      ...getScrollTransform(sampleScroll, positions, relativeOffsetBase)
    }
  })
}

/** Calculates the maximum visual height needed without resizing during scroll. */
const getViewportHeight = (
  baseContentHeight: number,
  keyframes: ResolvedScrollKeyframe[]
) => {
  if (baseContentHeight === 0) return 0

  return keyframes.reduce((maxHeight, { yOffset, zoom }) => {
    const renderedHeight = baseContentHeight * zoom

    return Math.max(maxHeight, renderedHeight + Math.max(0, yOffset))
  }, baseContentHeight)
}

/**
 * Maps the keyframe scroll values onto non-decreasing WAAPI offsets between 0 and 1.
 *
 * The offsets are expressed in the ViewTimeline's cover range, which starts when the wrapper's
 * top edge enters the bottom of the scrollport and ends when its bottom edge leaves the top, so
 * it spans scrollportHeight + subjectHeight px. A keyframe's scroll value is measured from the
 * moment the wrapper's top reaches the top of the scrollport, which sits scrollportHeight px into
 * that range — hence (scroll + scrollportHeight) / (scrollportHeight + subjectHeight).
 *
 * Nothing here depends on the document's height or on the wrapper's absolute offset: the browser
 * derives progress from the wrapper's live position, so content loading above or below it cannot
 * invalidate the mapping. Ranges are deliberately not used, since Chromium ignores a px
 * rangeStart/rangeEnd (measured in 144, for CSSUnitValue, CSS.px and percentages alike).
 *
 * Keyframes beyond subjectHeight would sit past the end of the range and are clamped; the wrapper
 * has fully left the screen at that point, so they were never observable anyway.
 */
const getKeyframeOffsets = (
  keyframes: ResolvedScrollKeyframe[],
  scrollportHeight: number,
  subjectHeight: number
) => {
  const coverSpan = scrollportHeight + subjectHeight
  let previousOffset = Number.NEGATIVE_INFINITY

  return keyframes.map(({ scroll }) => {
    const offset = Math.min(
      1,
      Math.max(0, (scroll + scrollportHeight) / coverSpan)
    )

    previousOffset = Math.min(
      1,
      offset > previousOffset ? offset : previousOffset + KEYFRAME_OFFSET_EPSILON
    )

    return previousOffset
  })
}

/**
 * Repeats the edge values at offset 0 and 1 so they stay flat outside the scroll window.
 * Without them the browser synthesises the missing boundary keyframes from the element's
 * underlying value, which makes the content drift back to untransformed above and below the
 * keyframes instead of holding.
 */
const withHoldKeyframes = <T extends Keyframe>(keyframes: T[]) => [
  { ...keyframes[0], offset: 0 },
  ...keyframes,
  { ...keyframes[keyframes.length - 1], offset: 1 }
]

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
  state: MutableScrollState,
  viewportHeight: number
) => {
  if (!element) return

  element.textContent = [
    `scrollY: ${Math.round(state.scrollY)}px`,
    `x: ${Math.round(state.xOffset)}px`,
    `y: ${Math.round(state.yOffset)}px`,
    `zoom: ${state.zoom.toFixed(2)}`,
    `height: ${Math.round(viewportHeight)}px`
  ].join('\n')
}

/** Prevents scroll noise from triggering extra compositor writes. */
const hasSameScrollState = (
  previous: MutableScrollState,
  next: MutableScrollState
) =>
  Math.abs(previous.scrollY - next.scrollY) < POSITION_EPSILON &&
  Math.abs(previous.xOffset - next.xOffset) < POSITION_EPSILON &&
  Math.abs(previous.yOffset - next.yOffset) < POSITION_EPSILON &&
  Math.abs(previous.zoom - next.zoom) < POSITION_EPSILON

/** Interpolates the cached keyframes into a reused object so a frame allocates nothing. */
const sampleResolvedKeyframes = (
  keyframes: ResolvedScrollKeyframe[],
  scrollY: number,
  target: MutableScrollState
) => {
  const lastIndex = keyframes.length - 1

  if (lastIndex < 0) return

  let lowIndex = 0
  let highIndex = lastIndex

  while (highIndex - lowIndex > 1) {
    const middleIndex = (lowIndex + highIndex) >> 1

    if (keyframes[middleIndex].scroll <= scrollY) lowIndex = middleIndex
    else highIndex = middleIndex
  }

  const from = keyframes[lowIndex]
  const to = keyframes[highIndex]
  const scrollSpan = to.scroll - from.scroll
  const progress =
    scrollSpan <= 0 ? 1 : Math.min(1, Math.max(0, (scrollY - from.scroll) / scrollSpan))

  target.xOffset = from.xOffset + (to.xOffset - from.xOffset) * progress
  target.yOffset = from.yOffset + (to.yOffset - from.yOffset) * progress
  target.zoom = from.zoom + (to.zoom - from.zoom) * progress
}

/** Transforms oversized content based on scroll-relative keyframes, driven by ScrollTimeline. */
const ScrollTimelineTransform = ({
  children,
  maxWidth,
  positions,
  className,
  showDevScrollPosition = false
}: ScrollTimelineTransformProps) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const movingContentRef = useRef<HTMLDivElement>(null)
  const devOverlayRef = useRef<HTMLDivElement>(null)
  const overlaysRef = useRef<HTMLElement[]>([])
  const appliedOverlayZoomRef = useRef(Number.POSITIVE_INFINITY)
  const appliedScrollStateRef = useRef<MutableScrollState>({
    scrollY: 0,
    xOffset: 0,
    yOffset: 0,
    zoom: 1
  })
  const frameScrollStateRef = useRef<MutableScrollState>({
    scrollY: 0,
    xOffset: 0,
    yOffset: 0,
    zoom: 1
  })
  const [baseContentHeight, setBaseContentHeight] = useState(0)
  const [documentTop, setDocumentTop] = useState(0)
  const [scrollportHeight, setScrollportHeight] = useState(0)
  const [overlayVersion, setOverlayVersion] = useState(0)
  const [timelineVersion, setTimelineVersion] = useState(0)
  const [layoutSize, setLayoutSize] = useState({
    contentWidth: 0,
    viewportWidth: 0
  })
  const resolvedKeyframes = useMemo(() => {
    const baseWidth = typeof maxWidth === 'number' ? maxWidth : layoutSize.contentWidth

    return getResolvedScrollKeyframes(positions, (zoom) => ({
      x: Math.max(0, baseWidth * zoom - layoutSize.viewportWidth),
      y: baseContentHeight * zoom
    }))
  }, [baseContentHeight, layoutSize, maxWidth, positions])
  const viewportHeight = getViewportHeight(baseContentHeight, resolvedKeyframes)
  const contentWidth = getCssLength(maxWidth)
  const initialZoom = resolvedKeyframes[0]?.zoom ?? 1

  useLayoutEffect(() => {
    const element = movingContentRef.current
    const viewport = viewportRef.current

    if (!element || !viewport) return

    const updateLayoutMeasurements = () => {
      const measuredBaseHeight = element.offsetHeight
      const measuredDocumentTop =
        viewport.getBoundingClientRect().top + window.scrollY
      const measuredScrollportHeight = document.documentElement.clientHeight
      const nextSize = {
        contentWidth: element.offsetWidth,
        viewportWidth: viewport.offsetWidth
      }

      setBaseContentHeight((previousHeight) =>
        Math.abs(previousHeight - measuredBaseHeight) < POSITION_EPSILON
          ? previousHeight
          : measuredBaseHeight
      )
      setDocumentTop((previousTop) =>
        Math.abs(previousTop - measuredDocumentTop) < POSITION_EPSILON
          ? previousTop
          : measuredDocumentTop
      )
      setScrollportHeight((previousHeight) =>
        Math.abs(previousHeight - measuredScrollportHeight) < POSITION_EPSILON
          ? previousHeight
          : measuredScrollportHeight
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
      const nextOverlays = findScrollTransformOverlays(element)

      if (hasSameOverlays(overlaysRef.current, nextOverlays)) return

      const { zoom } = appliedScrollStateRef.current

      overlaysRef.current = nextOverlays
      appliedOverlayZoomRef.current = zoom
      applyOverlayScale(nextOverlays, zoom)
      setOverlayVersion((previousVersion) => previousVersion + 1)
    }

    updateLayoutMeasurements()
    collectOverlays()

    // Body is observed for the fallback path's document offset: content growing above the wrapper
    // moves it without resizing the wrapper itself. Note that this misses hosts that keep body at
    // viewport height and let the article overflow it — one more reason the timeline path derives
    // its mapping from the wrapper instead.
    const resizeObserver = new ResizeObserver(updateLayoutMeasurements)
    resizeObserver.observe(element)
    resizeObserver.observe(viewport)
    resizeObserver.observe(document.body)

    const mutationObserver = new MutationObserver(collectOverlays)
    mutationObserver.observe(element, { childList: true, subtree: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  // Compositor path: the whole scroll range is described once, then the browser interpolates it
  // off the main thread. Nothing here runs while the user scrolls.
  useEffect(() => {
    const element = movingContentRef.current
    const viewport = viewportRef.current
    const firstKeyframe = resolvedKeyframes[0]
    const lastKeyframe = resolvedKeyframes[resolvedKeyframes.length - 1]

    if (!SUPPORTS_VIEW_TIMELINE || !element || !viewport || !firstKeyframe) return

    const overlays = overlaysRef.current
    const scrollSpan = lastKeyframe.scroll - firstKeyframe.scroll

    if (scrollSpan <= 0) {
      applyContentTransform(
        element,
        lastKeyframe.xOffset,
        lastKeyframe.yOffset,
        lastKeyframe.zoom
      )
      applyOverlayScale(overlays, lastKeyframe.zoom)

      return
    }

    // Before the first measurement there is no range to map into; the effect re-runs as soon as
    // the scrollport has been measured.
    if (scrollportHeight <= 0 || viewportHeight <= 0) {
      applyContentTransform(
        element,
        firstKeyframe.xOffset,
        firstKeyframe.yOffset,
        firstKeyframe.zoom
      )
      applyOverlayScale(overlays, firstKeyframe.zoom)

      return
    }

    // The wrapper drives its own timeline: progress comes from where it sits in the scrollport,
    // which the browser tracks live. An absolute mapping (document offset, document height) would
    // instead be frozen at mount, and hosts commonly keep body at viewport height with the content
    // overflowing it, so the ResizeObserver never sees the article grow around the graphic.
    const keyframeOffsets = getKeyframeOffsets(
      resolvedKeyframes,
      scrollportHeight,
      viewportHeight
    )
    const animationOptions: KeyframeAnimationOptions = {
      timeline: new ViewTimeline({ subject: viewport, axis: 'block' }),
      fill: 'both'
    }
    const animations = [
      element.animate(
        withHoldKeyframes(
          resolvedKeyframes.map(({ xOffset, yOffset, zoom }, index) => ({
            offset: keyframeOffsets[index],
            transform: `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${zoom})`,
            easing: 'linear'
          }))
        ),
        animationOptions
      ),
      ...overlays.map((overlay) =>
        overlay.animate(
          withHoldKeyframes(
            resolvedKeyframes.map(({ zoom }, index) => ({
              offset: keyframeOffsets[index],
              scale: String(1 / zoom),
              easing: 'linear'
            }))
          ),
          animationOptions
        )
      )
    ]

    // Auto-removal of a filling animation produces the same "stuck after scrolling past" symptom,
    // so the animations are kept explicitly as well.
    animations.forEach((animation) => {
      if (typeof animation.persist === 'function') animation.persist()
    })

    // WebKit does not reliably bring a finished scroll-driven animation back to 'running' when the
    // scroll moves backwards (csswg-drafts#11270), which freezes the content at the last keyframe.
    // The animation finishes exactly when the wrapper has left the top of the screen, so watching
    // for it to come back is both precise and free: rebuilding against a fresh timeline is what
    // actually unsticks it, and the observer only exists while the wrapper is gone.
    const [contentAnimation] = animations
    let recoveryObserver: IntersectionObserver | null = null

    const handleFinish = () => {
      if (recoveryObserver) return

      recoveryObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return

        recoveryObserver?.disconnect()
        recoveryObserver = null
        setTimelineVersion((previousVersion) => previousVersion + 1)
      })
      recoveryObserver.observe(viewport)
    }

    contentAnimation.addEventListener('finish', handleFinish)

    // An animation created while already finished (a page restored below the graphic) may never
    // fire the event, so the recovery is armed up front in that case.
    if (contentAnimation.playState === 'finished') handleFinish()

    return () => {
      contentAnimation.removeEventListener('finish', handleFinish)
      recoveryObserver?.disconnect()
      animations.forEach((animation) => animation.cancel())
    }
  }, [
    overlayVersion,
    resolvedKeyframes,
    scrollportHeight,
    timelineVersion,
    viewportHeight
  ])

  // Fallback path: sampling once per frame while in view keeps the transform locked to the
  // compositor. Scroll events are coalesced and delivered late during iOS momentum scrolling,
  // which is what makes an event-driven transform stutter on mobile.
  useEffect(() => {
    const viewport = viewportRef.current

    if (SUPPORTS_VIEW_TIMELINE || !viewport) return

    let animationFrame = 0
    let lastWindowScrollY = Number.NaN
    // Kept local and refreshed whenever the wrapper comes back into view: the measured state is
    // only as fresh as the ResizeObserver, which stays silent on hosts that keep body at viewport
    // height while the article overflows it. One rect read per entry, never inside a frame.
    let measuredDocumentTop = documentTop

    const measureDocumentTop = () => {
      measuredDocumentTop = viewport.getBoundingClientRect().top + window.scrollY
    }

    const applyScrollTransform = (windowScrollY: number) => {
      const appliedState = appliedScrollStateRef.current
      const nextState = frameScrollStateRef.current

      nextState.scrollY = windowScrollY - measuredDocumentTop
      sampleResolvedKeyframes(resolvedKeyframes, nextState.scrollY, nextState)

      if (hasSameScrollState(appliedState, nextState)) return

      appliedState.scrollY = nextState.scrollY
      appliedState.xOffset = nextState.xOffset
      appliedState.yOffset = nextState.yOffset
      appliedState.zoom = nextState.zoom
      applyContentTransform(
        movingContentRef.current,
        appliedState.xOffset,
        appliedState.yOffset,
        appliedState.zoom
      )

      // Overlays only need a write when the zoom itself moved, so panning stays a single
      // compositor-only transform write. The applied zoom is tracked separately so slow
      // zoom ramps accumulate instead of being swallowed by the epsilon check.
      if (Math.abs(appliedOverlayZoomRef.current - appliedState.zoom) >= ZOOM_EPSILON) {
        appliedOverlayZoomRef.current = appliedState.zoom
        applyOverlayScale(overlaysRef.current, appliedState.zoom)
      }

      if (showDevScrollPosition) {
        applyDevOverlay(devOverlayRef.current, appliedState, viewportHeight)
      }
    }

    const runFrame = () => {
      animationFrame = window.requestAnimationFrame(runFrame)

      const windowScrollY = window.scrollY

      if (windowScrollY === lastWindowScrollY) return

      lastWindowScrollY = windowScrollY
      applyScrollTransform(windowScrollY)
    }

    const stopLoop = () => {
      if (!animationFrame) return

      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return stopLoop()

        measureDocumentTop()
        lastWindowScrollY = Number.NaN

        if (!animationFrame) runFrame()
      },
      { rootMargin: '20% 0px' }
    )

    measureDocumentTop()
    applyScrollTransform(window.scrollY)
    intersectionObserver.observe(viewport)

    return () => {
      intersectionObserver.disconnect()
      stopLoop()
    }
  }, [documentTop, resolvedKeyframes, showDevScrollPosition, viewportHeight])

  // The compositor path never touches the main thread, so the debug readout needs its own
  // sampler. It only exists while the debug prop is on.
  useEffect(() => {
    if (!SUPPORTS_VIEW_TIMELINE || !showDevScrollPosition) return

    let animationFrame = 0

    const runFrame = () => {
      animationFrame = window.requestAnimationFrame(runFrame)

      const devState = frameScrollStateRef.current

      devState.scrollY = window.scrollY - documentTop
      sampleResolvedKeyframes(resolvedKeyframes, devState.scrollY, devState)
      applyDevOverlay(devOverlayRef.current, devState, viewportHeight)
    }

    runFrame()

    return () => window.cancelAnimationFrame(animationFrame)
  }, [documentTop, resolvedKeyframes, showDevScrollPosition, viewportHeight])

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
   * This is the first-paint value only; afterwards the overlay animation (or applyOverlayScale
   * in the fallback) writes the scale on the collected overlays, which avoids invalidating
   * the whole subtree.
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

export default ScrollTimelineTransform
