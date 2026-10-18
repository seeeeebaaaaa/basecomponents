import React, { type ReactNode } from 'react'
import Chart from './Chart'

const WIDTHS = [
  'TextWidth',
  'TextWidthExtended',
  'ContentWidth',
  'ArticleWidth',
  'TextWidthExtendedFullMobile',
  'FullWidth'
] as const

const SAMPLE_META = {
  title: 'Anteil der Stimmen nach Partei',
  subtitle: 'Nationalratswahlen 2023, in Prozent',
  source: 'Quelle: Bundesamt für Statistik'
}

const BARS = [
  { label: 'A', value: 80, color: '#e74c3c' },
  { label: 'B', value: 62, color: '#3498db' },
  { label: 'C', value: 45, color: '#2ecc71' },
  { label: 'D', value: 28, color: '#9b59b6' }
]

/** Placeholder body so meta and spacing read like a real chart. */
const SampleChart = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 12,
      height: 140,
      padding: '8px 0'
    }}
  >
    {BARS.map(bar => (
      <div
        key={bar.label}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6
        }}
      >
        <div
          style={{
            width: '100%',
            height: bar.value,
            background: bar.color,
            borderRadius: 3
          }}
        />
        <span style={{ fontSize: 11, opacity: 0.6 }}>{bar.label}</span>
      </div>
    ))}
  </div>
)

/** Full-width block so disco-grid columns are visible. */
const WidthProbe = ({ label }: { label: string }) => (
  <div
    style={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(52, 152, 219, 0.16)',
      border: '1px dashed #3498db',
      fontSize: 12,
      fontWeight: 600
    }}
  >
    {label}
  </div>
)

/** Stands in for a year toggle or color key passed as addToHead. */
const HeadControl = () => (
  <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
    {['2023', '2019', '2015'].map(year => (
      <span
        key={year}
        style={{
          padding: '4px 10px',
          border: '1px solid currentColor',
          borderRadius: 4
        }}
      >
        {year}
      </span>
    ))}
  </div>
)

/** Tight spacing so width/meta variants do not stack the default 30/60px gaps. */
const tight = {
  spaceBefore: 0 as const,
  spaceAfter: 0 as const,
  innerSpace: '12px' as const
}

const widthVariants = WIDTHS.flatMap(width => [
  {
    title: `frameWidth: ${width}`,
    element: (
      <Chart
        meta={SAMPLE_META}
        frameWidth={width}
        addToHead={<WidthProbe label={`frame · ${width}`} />}
        {...tight}
      >
        <WidthProbe label='content (default TextWidthExtendedFullMobile)' />
      </Chart>
    )
  },
  {
    title: `contentWidth: ${width}`,
    element: (
      <Chart
        meta={SAMPLE_META}
        contentWidth={width}
        addToHead={<WidthProbe label='frame (default TextWidth)' />}
        {...tight}
      >
        <WidthProbe label={`content · ${width}`} />
      </Chart>
    )
  }
])

/** Every layout option of Chart, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description:
      'frameWidth TextWidth, contentWidth TextWidthExtendedFullMobile, spaceBefore 30px, innerSpace 30px, spaceAfter 60px',
    element: (
      <Chart meta={SAMPLE_META}>
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'Title only',
    element: (
      <Chart meta={{ title: SAMPLE_META.title }} {...tight}>
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'Subtitle only',
    element: (
      <Chart meta={{ subtitle: SAMPLE_META.subtitle }} {...tight}>
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'Source only',
    element: (
      <Chart meta={{ source: SAMPLE_META.source }} {...tight}>
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'No meta (children only)',
    element: (
      <Chart meta={{}} {...tight}>
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'ReactNode meta',
    element: (
      <Chart
        meta={{
          title: (
            <>
              Anteil der Stimmen <em>nach Partei</em>
            </>
          ),
          subtitle: (
            <>
              Nationalratswahlen 2023, <strong>in Prozent</strong>
            </>
          ),
          source: (
            <>
              Quelle:{' '}
              <a href='https://www.bfs.admin.ch' target='_blank' rel='noreferrer'>
                Bundesamt für Statistik
              </a>
            </>
          )
        }}
        {...tight}
      >
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'titleStyle',
    element: (
      <Chart
        meta={SAMPLE_META}
        titleStyle={{ color: '#e74c3c', fontSize: 28, maxWidth: 720 }}
        {...tight}
      >
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'addToHead',
    element: (
      <Chart meta={SAMPLE_META} addToHead={<HeadControl />} {...tight}>
        <SampleChart />
      </Chart>
    )
  },
  ...widthVariants,
  {
    title: 'Tight spacing (0 / 0 / 0)',
    element: (
      <Chart
        meta={SAMPLE_META}
        spaceBefore={0}
        innerSpace={0}
        spaceAfter={0}
      >
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'Custom spacing (spaceBefore, innerSpace, spaceAfter)',
    element: (
      <Chart
        meta={SAMPLE_META}
        spaceBefore='8px'
        innerSpace='48px'
        spaceAfter='8px'
      >
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'Numeric spacing',
    element: (
      <Chart
        meta={SAMPLE_META}
        spaceBefore={16}
        innerSpace={24}
        spaceAfter={16}
      >
        <SampleChart />
      </Chart>
    )
  },
  {
    title: 'All options',
    element: (
      <Chart
        meta={SAMPLE_META}
        frameWidth='TextWidth'
        contentWidth='TextWidthExtended'
        spaceBefore='8px'
        innerSpace='16px'
        spaceAfter='8px'
        addToHead={<HeadControl />}
        titleStyle={{ letterSpacing: '-0.02em' }}
      >
        <SampleChart />
      </Chart>
    )
  }
]
