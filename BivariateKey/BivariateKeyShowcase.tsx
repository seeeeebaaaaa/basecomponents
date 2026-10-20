import React, { type ReactNode } from 'react'
import BivariateKey, { type ColorScale } from './BivariateKey'

const SHOWCASE_COLORS: string[][] = [
  ['#f4f4f4', '#f7f1d5', '#f9edb3', '#fce98f', '#ffe462'],
  ['#d2e2eb', '#d0dbcb', '#cfd4aa', '#cdcd87', '#ccc55e'],
  ['#b0cfe1', '#aac6c1', '#a4bca0', '#9fb27e', '#9aa758'],
  ['#8dbdd7', '#83b0b6', '#7aa495', '#719774', '#698a51'],
  ['#69aacd', '#5b9bab', '#4e8c8a', '#417c69', '#356d48']
]

const SHOWCASE_SCALE: ColorScale = {
  mode: 'gradient',
  x: {
    label: 'Sunshine',
    unit: '%',
    edges: [30, 40, 50, 60, 70, 80]
  },
  y: {
    label: 'Precipitation',
    unit: 'mm',
    edges: [500, 1000, 1500, 2000, 2500, 3000]
  },
  colors: SHOWCASE_COLORS
}

const SHOWCASE_CELLS: ColorScale = {
  ...SHOWCASE_SCALE,
  mode: 'cells'
}

const SPARSE_X_LABELS = ['30', '', '55', '', '80']
const SPARSE_Y_LABELS = ['3000', '', '1750', '', '500']

/** Every visual and layout option of BivariateKey, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Gradient',
    element: <BivariateKey colorscale={SHOWCASE_SCALE} />
  },
  {
    title: 'Cells',
    element: <BivariateKey colorscale={SHOWCASE_CELLS} />
  },
  {
    title: 'Custom axis titles',
    element: (
      <BivariateKey
        colorscale={SHOWCASE_SCALE}
        xAxisTitle={
          <>
            <b>Sunshine</b>
            <br />% of possible
          </>
        }
        yAxisTitle={
          <>
            <b>Rain</b>
            <br />
            mm / year
          </>
        }
      />
    )
  },
  {
    title: 'Sparse edge labels',
    element: (
      <BivariateKey
        colorscale={SHOWCASE_SCALE}
        xAxisLabels={SPARSE_X_LABELS}
        yAxisLabels={SPARSE_Y_LABELS}
      />
    )
  },
  {
    title: 'rampSize 80',
    element: <BivariateKey colorscale={SHOWCASE_SCALE} rampSize={80} />
  },
  {
    title: 'Overlay children',
    description: 'Percent positions map to the color grid.',
    element: (
      <BivariateKey colorscale={SHOWCASE_SCALE} rampSize={120}>
        <svg viewBox='0 0 100 100' aria-hidden='true'>
          <circle
            cx='72'
            cy='28'
            r='4'
            fill='currentColor'
            stroke='#fff'
            strokeWidth='1.5'
          />
        </svg>
      </BivariateKey>
    )
  }
]
