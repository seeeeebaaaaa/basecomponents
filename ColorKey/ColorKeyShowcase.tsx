import React from 'react'
import ColorKey, {
  type ColorKeySection,
  type ColorKeyStep,
  type ColorKeyStop,
  type ColorKeySwatch
} from './ColorKey'

const CUSTOM_SWATCH = (
  <span style={{ display: 'block', width: 14, height: 14, flexShrink: 0 }}>
    <svg
      width='14'
      height='14'
      viewBox='0 0 14 14'
      preserveAspectRatio='xMidYMid meet'
      style={{ display: 'block' }}
    >
      <path d='M7 1 L13 7 L7 13 L1 7 Z' fill='#9b59b6' />
    </svg>
  </span>
)

const SHOWCASE_SWATCHES: ColorKeySwatch[] = [
  { color: '#e74c3c', label: 'Circle' },
  { color: '#3498db', label: 'Square', shape: 'square' },
  { color: '#2ecc71', label: '45° Line', shape: 'line' },
  { label: 'Custom', swatch: CUSTOM_SWATCH }
]

const SHOWCASE_SWATCHES_MIXED_SIZE: ColorKeySwatch[] = [
  { color: '#e74c3c', label: 'Small', size: 10 },
  { color: '#3498db', label: 'Default' },
  { color: '#2ecc71', label: 'Large', size: 24 }
]

const SHOWCASE_SWATCHES_OUTLINE: ColorKeySwatch[] = [
  {
    color: '#e74c3c',
    label: 'Circle outline',
    stroke: { width: 2, color: '#333' }
  },
  {
    color: '#3498db',
    label: 'Square outline',
    shape: 'square',
    stroke: { width: 1, color: '#000' }
  }
]

const SHOWCASE_STOPS: ColorKeyStop[] = [
  { color: '#e74c3c', value: 0, label: 'Low' },
  { color: '#f39c12', value: 25 },
  { color: '#2ecc71', value: 50, label: 'Mid' },
  { color: '#3498db', value: 75 },
  { color: '#9b59b6', value: 100, label: 'High' }
]

/** Stops that are not evenly spaced. Labels must line up with their own color. */
const SHOWCASE_STOPS_UNEVEN: ColorKeyStop[] = [
  { color: '#e74c3c', value: 0, label: '0' },
  { color: '#f39c12', value: 10, label: '10' },
  { color: '#2ecc71', value: 80, label: '80' },
  { color: '#9b59b6', value: 100, label: '100' }
]

/** Stops without values, spread evenly. */
const SHOWCASE_STOPS_UNVALUED: ColorKeyStop[] = [
  { color: '#e74c3c' },
  { color: '#f39c12' },
  { color: '#2ecc71' },
  { color: '#3498db' }
]

const SHOWCASE_STEPS: ColorKeyStep[] = [
  { color: '#e74c3c' },
  { color: '#f39c12' },
  { color: '#2ecc71' },
  { color: '#3498db' },
  { color: '#9b59b6' }
]

const SHOWCASE_STEPS_WITH_LABELS: ColorKeyStep[] = [
  { color: '#e74c3c', label: 'Low' },
  { color: '#f39c12' },
  { color: '#2ecc71', label: 'Mid' },
  { color: '#3498db' },
  { color: '#9b59b6', label: 'High' }
]

const SHOWCASE_ANIMALS: ColorKeySwatch[] = [
  { color: '#e74c3c', label: 'Aligator' },
  { color: '#3498db', label: 'Brocolli' },
  { color: '#2ecc71', label: 'Chameleon' },
  { color: '#9b59b6', label: 'Duck' },
  { color: '#f39c12', label: 'Elephant' },
  { color: '#e74c3c', label: 'Fox' },
  { color: '#3498db', label: 'Giraffe' },
  { color: '#2ecc71', label: 'Hippo' }
]

const SHOWCASE_SECTIONS: ColorKeySection[] = [
  {
    type: 'swatches',
    title: 'Group A',
    swatches: [
      { color: '#e74c3c', label: 'Circle' },
      { color: '#3498db', label: 'Square', shape: 'square' }
    ]
  },
  {
    type: 'swatches',
    title: 'Group B',
    columns: 3,
    swatches: [
      { color: 'none', label: 'Line', stroke: { width: 2, color: '#000' } },
      { label: 'Custom', swatch: CUSTOM_SWATCH },
      { color: 'none', label: 'Line', stroke: { width: 2, color: '#000' } },
      { label: 'Custom', swatch: CUSTOM_SWATCH },
      { color: 'none', label: 'Line', stroke: { width: 2, color: '#000' } },
      { label: 'Custom', swatch: CUSTOM_SWATCH }
    ]
  }
]

/** Every section type and layout option of ColorKey, one labelled variant each. */
export const showcaseVariants = [
  {
    title: 'Gradient',
    element: <ColorKey sections={{ type: 'gradient', stops: SHOWCASE_STOPS }} />
  },
  {
    title: 'Gradient (bar width, height, endLabels)',
    element: (
      <ColorKey
        sections={{
          type: 'gradient',
          stops: SHOWCASE_STOPS,
          endLabels: ['Min', 'Max'],
          bar: { width: 300, height: 20 }
        }}
      />
    )
  },
  {
    title: 'Gradient with unevenly spaced stops',
    element: (
      <ColorKey
        sections={{
          type: 'gradient',
          stops: SHOWCASE_STOPS_UNEVEN,
          bar: { width: 300 }
        }}
      />
    )
  },
  {
    title: 'Gradient with explicit domain (0 - 200)',
    element: (
      <ColorKey
        sections={{
          type: 'gradient',
          stops: SHOWCASE_STOPS_UNEVEN,
          domain: [0, 200],
          endLabels: ['0', '200'],
          bar: { width: 300 }
        }}
      />
    )
  },
  {
    title: 'Gradient without values (spread evenly)',
    element: (
      <ColorKey
        sections={{
          type: 'gradient',
          stops: SHOWCASE_STOPS_UNVALUED,
          bar: { width: 300 }
        }}
      />
    )
  },
  {
    title: 'Steps',
    element: (
      <ColorKey
        sections={{
          type: 'steps',
          steps: SHOWCASE_STEPS,
          endLabels: ['Low', 'High']
        }}
      />
    )
  },
  {
    title: 'Steps (bar width, height)',
    element: (
      <ColorKey
        sections={{
          type: 'steps',
          steps: SHOWCASE_STEPS,
          endLabels: ['Min', 'Max'],
          bar: { width: 200, height: 16 }
        }}
      />
    )
  },
  {
    title: 'Steps with labels below',
    element: (
      <ColorKey
        sections={{
          type: 'steps',
          steps: SHOWCASE_STEPS_WITH_LABELS,
          endLabels: ['Min', 'Max'],
          bar: { width: 200 }
        }}
      />
    )
  },
  {
    element: (
      <ColorKey
        title='Mixed Gradient, Steps and Categories'
        columns={2}
        gap={30}
        sections={[
          {
            type: 'gradient',
            title: 'Gradient',
            stops: SHOWCASE_STOPS,
            endLabels: ['Low', 'High']
          },
          {
            type: 'steps',
            title: 'Steps',
            steps: SHOWCASE_STEPS_WITH_LABELS,
            endLabels: ['Min', 'Max']
          },
          { type: 'swatches', title: 'Categories', swatches: SHOWCASE_ANIMALS },
          {
            type: 'swatches',
            title: 'Categories',
            columns: 2,
            swatches: SHOWCASE_ANIMALS
          },
          {
            type: 'gradient',
            title: 'Gradient',
            stops: SHOWCASE_STOPS,
            endLabels: ['Low', 'High']
          }
        ]}
      />
    )
  },
  {
    title: 'Swatches',
    element: <ColorKey sections={{ type: 'swatches', swatches: SHOWCASE_SWATCHES }} />
  },
  {
    title: 'Grid (2 columns)',
    element: (
      <ColorKey
        sections={{
          type: 'swatches',
          columns: 2,
          swatches: SHOWCASE_SWATCHES
        }}
      />
    )
  },
  {
    title: 'swatchSize (8px)',
    element: (
      <ColorKey
        sections={{ type: 'swatches', swatches: SHOWCASE_SWATCHES }}
        defaults={{ swatchSize: 8 }}
      />
    )
  },
  {
    title: 'Per-swatch size',
    element: (
      <ColorKey
        sections={{ type: 'swatches', swatches: SHOWCASE_SWATCHES_MIXED_SIZE }}
      />
    )
  },
  {
    title: 'Outline (stroke)',
    element: (
      <ColorKey
        sections={{ type: 'swatches', swatches: SHOWCASE_SWATCHES_OUTLINE }}
      />
    )
  },
  {
    title: 'Sections (per-section layout)',
    element: <ColorKey sections={SHOWCASE_SECTIONS} />
  },
  {
    title: 'Sections in 2 columns',
    element: <ColorKey sections={SHOWCASE_SECTIONS} columns={2} />
  },
  {
    title: 'Sections in 2 columns with gap',
    element: <ColorKey sections={SHOWCASE_SECTIONS} columns={2} gap={24} />
  },
  {
    title: 'Color key with title',
    element: (
      <ColorKey
        title='Legend'
        sections={{ type: 'swatches', swatches: SHOWCASE_SWATCHES }}
      />
    )
  },
  {
    title: 'Color key with styles.title',
    element: (
      <ColorKey
        title='Custom Styled Title'
        styles={{ title: { fontSize: 18, color: '#e74c3c' } }}
        sections={{ type: 'swatches', swatches: SHOWCASE_SWATCHES }}
      />
    )
  },
  {
    title: 'Sections with gap and item gap',
    element: (
      <ColorKey
        sections={SHOWCASE_SECTIONS}
        gap={10}
        defaults={{ gap: { item: 10 } }}
      />
    )
  },
  {
    title: 'Section titles (global and per-section)',
    element: (
      <ColorKey
        styles={{ sectionTitle: { fontWeight: 400 } }}
        sections={[
          {
            type: 'swatches',
            title: 'Group A',
            titleStyle: { color: '#e74c3c', fontSize: 14 },
            swatches: [
              { color: '#e74c3c', label: 'Circle' },
              { color: '#3498db', label: 'Square', shape: 'square' }
            ]
          },
          {
            type: 'swatches',
            title: 'Group B (default)',
            swatches: [{ color: '#2ecc71', label: 'Line', shape: 'line' }]
          }
        ]}
      />
    )
  },
  {
    title: 'Labels (global and per-swatch)',
    element: (
      <ColorKey
        styles={{ label: { color: 'red', fontSize: 32 } }}
        sections={[
          {
            type: 'swatches',
            title: 'Group A',
            swatches: [
              { color: '#e74c3c', label: 'Inherited' },
              {
                color: '#3498db',
                label: 'Small',
                labelStyle: { fontSize: 12 }
              }
            ]
          },
          {
            type: 'swatches',
            swatches: [{ color: '#2ecc71', label: 'Inherited' }]
          }
        ]}
      />
    )
  }
]
