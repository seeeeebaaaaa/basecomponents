import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import ScrollTransform, {
  getScrollTransform,
  type ScrollTransformPosition,
} from './ScrollTransform'

export interface ScrollTransformPointPosition {
  scroll: number
  point: {
    x: number
    y: number
  }
  zoom?: number
}

interface PointScrollTransformProps {
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

/** Checks whether a point position can be converted into an offset position. */
const isValidPointPosition = ({
  scroll,
  point,
  zoom,
}: ScrollTransformPointPosition) =>
  Number.isFinite(scroll) &&
  Number.isFinite(point.x) &&
  Number.isFinite(point.y) &&
  (zoom === undefined || Number.isFinite(zoom))

/** Reads the current scroll zoom value inherited from ScrollTransform. */
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
  Math.abs(previousLayout.windowHeight - nextLayout.windowHeight) <
    POSITION_EPSILON

/** Converts point-centered positions into the offset positions ScrollTransform uses. */
export const getPointScrollTransformPositions = (
  positions: ScrollTransformPointPosition[],
  layout: PointScrollTransformLayout
): ScrollTransformPosition[] =>
  positions.filter(isValidPointPosition).map(({ scroll, point, zoom = 1 }) => ({
    scroll,
    xOffset: layout.viewportWidth / 2 - (layout.baseContentWidth * zoom * point.x) / 100,
    yOffset: scroll + layout.windowHeight / 2 - (layout.baseContentHeight * zoom * point.y) / 100,
    zoom,
  }))

/** Interpolates a point-centered transform for the current scroll position. */
export const getPointScrollTransform = (
  scrollY: number,
  positions: ScrollTransformPointPosition[],
  layout: PointScrollTransformLayout
) => getScrollTransform(scrollY, getPointScrollTransformPositions(positions, layout))

/** Transforms oversized content by centering image-relative points at scroll keyframes. */
const PointScrollTransform = ({
  children,
  maxWidth,
  positions,
  className,
  showDevScrollPosition = false,
}: PointScrollTransformProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<PointScrollTransformLayout>({
    baseContentHeight: 0,
    baseContentWidth: typeof maxWidth === 'number' ? maxWidth : 0,
    viewportWidth: 0,
    windowHeight: window.innerHeight,
  })
  const offsetPositions = useMemo(
    () => getPointScrollTransformPositions(positions, layout),
    [layout, positions]
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current

    if (!wrapper || !content) return

    const updateLayout = () => {
      const zoom = getContentZoom(content)
      const contentRect = content.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()
      const nextLayout = {
        baseContentHeight: contentRect.height / zoom,
        baseContentWidth:
          typeof maxWidth === 'number' ? maxWidth : contentRect.width / zoom,
        viewportWidth: wrapperRect.width,
        windowHeight: window.innerHeight,
      }

      setLayout((previousLayout) =>
        hasSameLayout(previousLayout, nextLayout) ? previousLayout : nextLayout
      )
    }

    updateLayout()

    const observer = new ResizeObserver(updateLayout)
    observer.observe(wrapper)
    observer.observe(content)
    window.addEventListener('resize', updateLayout)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateLayout)
    }
  }, [maxWidth])

  return (
    <div ref={wrapperRef}>
      <ScrollTransform
        maxWidth={maxWidth}
        positions={offsetPositions}
        className={className}
        showDevScrollPosition={showDevScrollPosition}
      >
        <div ref={contentRef}>{children}</div>
      </ScrollTransform>
    </div>
  )
}

export default PointScrollTransform
