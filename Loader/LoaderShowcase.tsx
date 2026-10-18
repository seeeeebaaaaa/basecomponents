import React, { type ReactNode } from 'react'
import Loader, { type LoaderVariant } from './Loader'

const VARIANTS: LoaderVariant[] = ['default', 'dataviz', 'map', 'radar']

/** Keeps most examples short so the default 300px height is not repeated. */
const compact = { height: 96 }

const variantExamples = VARIANTS.map(variant => ({
  title: `variant: ${variant}`,
  element: <Loader variant={variant} {...compact} />
}))

/** Every visual and layout option of Loader, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description:
      'variant default, size 32, speed 1.2, color currentColor, width 100%, height 300',
    element: <Loader />
  },
  ...variantExamples,
  {
    title: 'size 16',
    element: <Loader size={16} {...compact} />
  },
  {
    title: 'size 64',
    element: <Loader size={64} {...compact} />
  },
  {
    title: 'speed 0.5 (fast)',
    element: <Loader speed={0.5} {...compact} />
  },
  {
    title: 'speed 2.4 (slow)',
    element: <Loader speed={2.4} {...compact} />
  },
  {
    title: 'color',
    element: <Loader color='#e74c3c' {...compact} />
  },
  {
    title: 'map background (pin hole)',
    description: 'background fills the hole in the map pin; default is #fff',
    element: (
      <Loader variant='map' background='#2ecc71' color='#2c3e50' {...compact} />
    )
  },
  {
    title: 'width and height',
    element: (
      <Loader
        width={220}
        height={140}
        style={{ outline: '1px dashed rgba(128, 128, 128, 0.45)' }}
      />
    )
  },
  {
    title: 'width as CSS string',
    element: (
      <Loader
        width='50%'
        height='80px'
        style={{ outline: '1px dashed rgba(128, 128, 128, 0.45)' }}
      />
    )
  },
  {
    title: 'message',
    element: <Loader message='Daten werden geladen…' {...compact} />
  },
  {
    title: 'label (aria-label when there is no message)',
    description: 'Visible output is unchanged; the status role reads this label.',
    element: <Loader label='Karte wird geladen' {...compact} />
  },
  {
    title: 'loading={false}',
    description: 'Renders nothing — reserved space is released.',
    element: (
      <div>
        <Loader loading={false} />
        <span style={{ fontSize: 13, opacity: 0.55 }}>
          Nothing above this line.
        </span>
      </div>
    )
  },
  {
    title: 'All options',
    element: (
      <Loader
        variant='dataviz'
        size={48}
        speed={0.8}
        color='#3498db'
        width={280}
        height={160}
        message='Grafik wird vorbereitet…'
        label='Dataviz loader'
        style={{ outline: '1px dashed rgba(128, 128, 128, 0.45)' }}
      />
    )
  }
]
