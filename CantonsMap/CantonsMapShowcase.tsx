import React, { type ReactNode } from 'react'
import CantonsMap, { type CantonStyles } from './CantonsMap'

const FILLED: CantonStyles = {
  ZH: { fill: '#3498db', value: 1559604 },
  BE: { fill: '#2ecc71', value: 1043132 },
  VD: { fill: '#e74c3c', value: 822968 },
  AG: { fill: '#9b59b6', value: 703772 },
  SG: { fill: '#f39c12', value: 519245 },
  GE: { fill: '#1abc9c', value: 506343 }
}

const HATCHED: CantonStyles = {
  ZH: { fill: '#3498db', hatch: true, value: 12 },
  BE: { fill: '#2ecc71', hatch: { direction: 'back' }, value: 8 },
  GE: { fill: '#e74c3c', hatch: { direction: 'horizontal', width: 2 }, value: 5 },
  TI: { fill: '#9b59b6', hatch: { direction: 'vertical' }, value: 3 },
  GR: {
    fill: '#f39c12',
    hatch: { direction: 'cross', color: 'rgba(0,0,0,0.45)', spacing: 6 },
    value: 2
  }
}

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ maxWidth: 560 }}>{children}</div>
)

/** Every colour, hatch and tooltip option of CantonsMap, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description: 'Hover a canton for its name. No fills — the default grey paths.',
    element: (
      <Frame>
        <CantonsMap />
      </Frame>
    )
  },
  {
    title: 'Fills and values',
    description: 'Tooltip shows the formatted value. Cantons without data use noDataText.',
    element: (
      <Frame>
        <CantonsMap cantons={FILLED} />
      </Frame>
    )
  },
  {
    title: 'Hatch',
    description: 'true (45°), back, horizontal, vertical, and cross with a custom spec.',
    element: (
      <Frame>
        <CantonsMap cantons={HATCHED} />
      </Frame>
    )
  },
  {
    title: 'lang fr',
    element: (
      <Frame>
        <CantonsMap cantons={FILLED} lang='fr' />
      </Frame>
    )
  },
  {
    title: 'formatValue and noDataText',
    element: (
      <Frame>
        <CantonsMap
          cantons={FILLED}
          formatValue={value =>
            typeof value === 'number' ? `${(value / 1000).toFixed(0)}k` : value
          }
          noDataText='pas de données'
        />
      </Frame>
    )
  },
  {
    title: 'colors',
    description: 'Default fill/stroke plus the hover stroke.',
    element: (
      <Frame>
        <CantonsMap
          cantons={FILLED}
          colors={{
            fill: '#e8eef4',
            stroke: '#5a6a7a',
            hoveredStroke: '#e74c3c'
          }}
        />
      </Frame>
    )
  }
]
