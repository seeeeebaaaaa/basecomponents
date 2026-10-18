import React, { useState, type CSSProperties, type ReactNode } from 'react'
import { Carousel } from './Carousel'

const SLIDE_COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12']

const SLIDE_LABELS = ['Zürich', 'Bern', 'Genève', 'Basel', 'Luzern']

/** Coloured slide so free-scroll vs snap is obvious. */
const Slide = ({ label, color }: { label: string; color: string }) => (
  <div
    style={{
      width: 220,
      height: '100%',
      marginRight: 12,
      display: 'flex',
      alignItems: 'flex-end',
      padding: 16,
      background: color,
      color: '#fff',
      fontSize: 20,
      fontWeight: 700,
      boxSizing: 'border-box'
    }}
  >
    {label}
  </div>
)

const SNAP_SLIDES = SLIDE_LABELS.map((label, index) => (
  <div
    key={label}
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 20,
      background: SLIDE_COLORS[index],
      color: '#fff',
      fontSize: 24,
      fontWeight: 700,
      boxSizing: 'border-box'
    }}
  >
    {label}
  </div>
))

const FREE_SLIDES = SLIDE_LABELS.map((label, index) => (
  <Slide key={label} label={label} color={SLIDE_COLORS[index]} />
))

const THEME = {
  '--brandblue-main': '#3498db'
} as CSSProperties

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={THEME}>{children}</div>
)

/** Buttons drive the same index Carousel reports back. */
const ControlledCarousel = () => {
  const [index, setIndex] = useState(0)
  return (
    <Frame>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {SLIDE_LABELS.map((label, i) => (
          <button
            key={label}
            type='button'
            onClick={() => setIndex(i)}
            style={{
              padding: '4px 10px',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: i === index ? 700 : 400
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <Carousel
        snap
        height={180}
        index={index}
        onIndexChange={setIndex}
        elements={SNAP_SLIDES}
      />
      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.6 }}>index: {index}</div>
    </Frame>
  )
}

/** Every scroll and control option of Carousel, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default (free scroll)',
    description: 'Horizontal overflow, no snap. Drag or swipe the track.',
    element: (
      <Frame>
        <Carousel elements={FREE_SLIDES} />
      </Frame>
    )
  },
  {
    title: 'height 160',
    element: (
      <Frame>
        <Carousel elements={FREE_SLIDES} height={160} />
      </Frame>
    )
  },
  {
    title: 'snap',
    description: 'One slide per page, with arrows and dots (uncontrolled).',
    element: (
      <Frame>
        <Carousel snap elements={SNAP_SLIDES} height={200} />
      </Frame>
    )
  },
  {
    title: 'Controlled index',
    description: 'index + onIndexChange. The buttons and the track stay in sync.',
    element: <ControlledCarousel />
  },
  {
    title: 'className',
    element: (
      <Frame>
        <Carousel
          className='showcase-carousel'
          elements={FREE_SLIDES}
          height={140}
        />
      </Frame>
    )
  }
]
