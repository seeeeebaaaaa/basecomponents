import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import ScrollTransform from './ScrollTransform'
import PointScrollTransform from './PointScrollTransform'
import ScrollTimelineTransform from './ScrollTimelineTransform'
import PointScrollTimelineTransform from './PointScrollTimelineTransform'

const CELLS = [
  ['ZH', 'SH', 'TG', 'SG'],
  ['AG', 'ZH', 'AR', 'AI'],
  ['SO', 'LU', 'ZG', 'SZ'],
  ['BE', 'NW', 'OW', 'GL']
]

const CELL_COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12', '#1abc9c']

const ZOOM_POSITIONS = [
  { scroll: 0, zoom: 1 },
  { scroll: 320, zoom: 1.7 }
]

const PAN_POSITIONS = [
  { scroll: 0, xOffset: 0, yOffset: 0, zoom: 1.25 },
  { scroll: 360, xOffset: -220, yOffset: 40, zoom: 1.25 }
]

const PERCENT_POSITIONS = [
  { scroll: 0, xOffsetPercent: 0, yOffsetPercent: 0, zoom: 1.5 },
  { scroll: 360, xOffsetPercent: -70, yOffsetPercent: 8, zoom: 1.5 }
]

const ALIAS_POSITIONS = [
  { scroll: 0, offset: 0, offsetPercent: 0, zoom: 1.2 },
  { scroll: 320, offset: -160, offsetPercent: -20, zoom: 1.2 }
]

const COMBINED_POSITIONS = [
  { scroll: 0, zoom: 1, xOffset: 0, yOffset: 0 },
  { scroll: 180, zoom: 1.55, xOffset: -80, yOffset: 16 },
  { scroll: 400, zoom: 1.2, xOffset: -200, yOffset: 36 }
]

const POINT_POSITIONS = [
  { scroll: 0, point: { x: 50, y: 50 }, zoom: 1 },
  { scroll: 360, point: { x: 20, y: 28 }, zoom: 2.1 }
]

/**
 * Shifts keyframes so the motion plays while the scene is mid-viewport.
 * ScrollTransform treats scroll: 0 as “element top hits the top of the screen”;
 * without this, variants further down the page never reach their range.
 */
const CenteredPlay = <T extends { scroll: number }>({
  positions,
  children
}: {
  positions: T[]
  children: (positions: T[]) => ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const update = () => {
      const viewport = root.querySelector('.scroll-transform') as HTMLElement | null
      const rawHeight = viewport?.offsetHeight ?? 280
      const height = Math.min(Math.max(rawHeight, 280), window.innerHeight * 0.6)
      const centerScroll = (height - window.innerHeight) / 2
      const scrolls = positions.map(position => position.scroll)
      const mid = (Math.min(...scrolls) + Math.max(...scrolls)) / 2
      setOffset(centerScroll - mid)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(root)
    const viewport = root.querySelector('.scroll-transform')
    if (viewport) observer.observe(viewport)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [positions])

  const shifted = useMemo(
    () => positions.map(position => ({ ...position, scroll: position.scroll + offset })),
    [offset, positions]
  )

  return (
    <div
      ref={ref}
      style={{
        padding: '18vh 0',
        outline: '1px dashed rgba(128, 128, 128, 0.4)',
        background: 'rgba(128, 128, 128, 0.06)'
      }}
    >
      {children(shifted)}
    </div>
  )
}

/** Oversized labelled grid so pan and zoom read immediately. */
const Scene = ({ pin }: { pin?: boolean }) => (
  <div style={{ position: 'relative', height: 280, userSelect: 'none' }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        height: '100%'
      }}
    >
      {CELLS.flat().map((label, index) => (
        <div
          key={`${label}-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: CELL_COLORS[index % CELL_COLORS.length],
            color: '#fff',
            fontSize: 22,
            fontWeight: 700,
            opacity: 0.88
          }}
        >
          {label}
        </div>
      ))}
    </div>
    {pin && (
      <div
        style={{
          position: 'absolute',
          left: '20%',
          top: '28%',
          padding: '4px 8px',
          borderRadius: 4,
          background: '#1a1a1a',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}
      >
        Pin · 20% / 28%
      </div>
    )}
  </div>
)

/** Every transform flavour in this folder, one labelled scroll scene each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Zoom',
    description:
      'Scroll while the scene is mid-screen — zoom goes from 1 to 1.7. maxWidth is wider than the frame so the crop is visible.',
    element: (
      <CenteredPlay positions={ZOOM_POSITIONS}>
        {positions => (
          <ScrollTransform maxWidth={900} positions={positions}>
            <Scene />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'xOffset and yOffset',
    description: 'Pixel pan at a fixed 1.25 zoom.',
    element: (
      <CenteredPlay positions={PAN_POSITIONS}>
        {positions => (
          <ScrollTransform maxWidth={900} positions={positions}>
            <Scene />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'xOffsetPercent and yOffsetPercent',
    description: 'Percent offsets are relative to overflow width and zoomed content height.',
    element: (
      <CenteredPlay positions={PERCENT_POSITIONS}>
        {positions => (
          <ScrollTransform maxWidth={900} positions={positions}>
            <Scene />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'offset / offsetPercent aliases',
    description: 'Older x-axis names still resolve to xOffset / xOffsetPercent.',
    element: (
      <CenteredPlay positions={ALIAS_POSITIONS}>
        {positions => (
          <ScrollTransform maxWidth={900} positions={positions}>
            <Scene />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'Combined keyframes',
    description: 'Three stops: zoom in, then ease back while panning.',
    element: (
      <CenteredPlay positions={COMBINED_POSITIONS}>
        {positions => (
          <ScrollTransform maxWidth={900} positions={positions}>
            <Scene />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'Percentage overlay',
    description:
      'The pin uses position:absolute with % left/top, so it stays screen-sized while the grid zooms.',
    element: (
      <CenteredPlay positions={ZOOM_POSITIONS}>
        {positions => (
          <ScrollTransform maxWidth={900} positions={positions}>
            <Scene pin />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'showDevScrollPosition',
    description: 'Fixed HUD with the live scrollY, offsets, zoom and reserved height.',
    element: (
      <CenteredPlay positions={COMBINED_POSITIONS}>
        {positions => (
          <ScrollTransform
            maxWidth={900}
            positions={positions}
            showDevScrollPosition
          >
            <Scene />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'maxWidth as CSS string',
    element: (
      <CenteredPlay positions={ZOOM_POSITIONS}>
        {positions => (
          <ScrollTransform maxWidth='720px' positions={positions}>
            <Scene />
          </ScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'PointScrollTransform',
    description:
      'Centers image-relative points. Scroll to move from the middle (50/50) into ZH at 20/28.',
    element: (
      <CenteredPlay positions={POINT_POSITIONS}>
        {positions => (
          <PointScrollTransform maxWidth={900} positions={positions}>
            <Scene pin />
          </PointScrollTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'ScrollTimelineTransform',
    description:
      'Drop-in for ScrollTransform. Uses ViewTimeline on Chromium/Safari, rAF fallback on Firefox.',
    element: (
      <CenteredPlay positions={COMBINED_POSITIONS}>
        {positions => (
          <ScrollTimelineTransform maxWidth={900} positions={positions}>
            <Scene />
          </ScrollTimelineTransform>
        )}
      </CenteredPlay>
    )
  },
  {
    title: 'PointScrollTimelineTransform',
    description: 'Point-centered keyframes on the timeline implementation.',
    element: (
      <CenteredPlay positions={POINT_POSITIONS}>
        {positions => (
          <PointScrollTimelineTransform maxWidth={900} positions={positions}>
            <Scene pin />
          </PointScrollTimelineTransform>
        )}
      </CenteredPlay>
    )
  }
]
