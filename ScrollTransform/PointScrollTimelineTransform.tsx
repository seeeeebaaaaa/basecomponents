import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import ScrollTimelineTransform from './ScrollTimelineTransform'
import {
  getPointScrollTransformPositions,
  type ScrollTransformPointPosition
} from './PointScrollTransform'

interface PointScrollTimelineTransformProps {
  children: ReactNode
  maxWidth: number | string
  positions: ScrollTransformPointPosition[]
  className?: string
  showDevScrollPosition?: boolean
}

interface PointScrollTransformLayout {
  baseContentHeight: number
  baseContentWidth: number
  viewportWidth: number
  windowHeight: number
}

const POSITION_EPSILON = 0.01

/** Reads the current scroll zoom value inherited from ScrollTimelineTransform. */
const getContentZoom = (element: HTMLElement) => {
  const zoom = Number.parseFloat(
    window.getComputedStyle(element).getPropertyValue('--scroll-content-zoom')
  )

  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
}

/** Checks whether layout measurements changed enough to update state. */
const hasSameLayout = (
  previousLayout: PointScrollTransformLayout,
  nextLayout: PointScrollTransformLayout
) =>
  Math.abs(previousLayout.baseContentHeight - nextLayout.baseContentHeight) <
    POSITION_EPSILON &&
  Math.abs(previousLayout.baseContentWidth - nextLayout.baseContentWidth) <
    POSITION_EPSILON &&
  Math.abs(previousLayout.viewportWidth - nextLayout.viewportWidth) <
    POSITION_EPSILON &&
  Math.abs(previousLayout.windowHeight - nextLayout.windowHeight) < POSITION_EPSILON

/** Transforms oversized content by centering image-relative points at scroll keyframes. */
const PointScrollTimelineTransform = ({
  children,
  maxWidth,
  positions,
  className,
  showDevScrollPosition = false
}: PointScrollTimelineTransformProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const acceptedViewportRef = useRef({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  })
  const [layout, setLayout] = useState<PointScrollTransformLayout>({
    baseContentHeight: 0,
    baseContentWidth: typeof maxWidth === 'number' ? maxWidth : 0,
    viewportWidth: 0,
    windowHeight: acceptedViewportRef.current.height
  })
  const offsetPositions = useMemo(
    () => getPointScrollTransformPositions(positions, layout),
    [layout, positions]
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current

    if (!wrapper || !content) return

    /*
     * Collapsing the iOS Safari toolbar fires resize while the user scrolls. Recomputing the
     * keyframes with the taller viewport moves every point mid-scroll, so a new height is only
     * accepted when the width changed too (a real resize) or when the device was rotated.
     */
    const getStableWindowHeight = (acceptCurrentHeight: boolean) => {
      const accepted = acceptedViewportRef.current
      const currentWidth = document.documentElement.clientWidth

      if (acceptCurrentHeight || currentWidth !== accepted.width) {
        accepted.width = currentWidth
        accepted.height = document.documentElement.clientHeight
      }

      return accepted.height
    }

    const updateLayout = (acceptCurrentHeight = false) => {
      const zoom = getContentZoom(content)
      const contentRect = content.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()
      const nextLayout = {
        baseContentHeight: contentRect.height / zoom,
        baseContentWidth:
          typeof maxWidth === 'number' ? maxWidth : contentRect.width / zoom,
        viewportWidth: wrapperRect.width,
        windowHeight: getStableWindowHeight(acceptCurrentHeight)
      }

      setLayout((previousLayout) =>
        hasSameLayout(previousLayout, nextLayout) ? previousLayout : nextLayout
      )
    }

    const handleResize = () => updateLayout()
    const handleOrientationChange = () => updateLayout(true)

    updateLayout()

    const observer = new ResizeObserver(handleResize)
    observer.observe(wrapper)
    observer.observe(content)
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [maxWidth])

  return (
    <div ref={wrapperRef}>
      <ScrollTimelineTransform
        maxWidth={maxWidth}
        positions={offsetPositions}
        className={className}
        showDevScrollPosition={showDevScrollPosition}
      >
        <div ref={contentRef}>{children}</div>
      </ScrollTimelineTransform>
    </div>
  )
}

export default PointScrollTimelineTransform
