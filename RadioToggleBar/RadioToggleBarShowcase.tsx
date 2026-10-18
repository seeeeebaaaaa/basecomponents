import React, { useState, type CSSProperties, type ReactNode } from 'react'
import RadioToggleBar from './RadioToggleBar'

const YEARS = { '2023': '2023', '2019': '2019', '2015': '2015' }

const PARTIES = {
  all: 'Alle',
  svp: 'SVP',
  sp: 'SP',
  fdp: 'FDP',
  mitte: 'Mitte'
}

const MANY = {
  a: 'Aligator',
  b: 'Broccoli',
  c: 'Chameleon',
  d: 'Duck',
  e: 'Elephant',
  f: 'Fox',
  g: 'Giraffe',
  h: 'Hippo'
}

/** Showcase tokens so the bar is visible without the host's beige/yellow variables. */
const THEME = {
  '--toggle-bg': 'rgba(128, 128, 128, 0.12)',
  '--toggle-color': 'inherit',
  '--toggle-hover-bg': 'rgba(128, 128, 128, 0.2)',
  '--toggle-hover-color': 'inherit',
  '--toggle-selected-bg': '#1a1a1a',
  '--toggle-selected-color': '#fff',
  '--toggle-border-color': 'rgba(128, 128, 128, 0.35)'
} as CSSProperties

const ALIGNMENTS = ['center', 'flex-start', 'flex-end'] as const

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ outline: '1px dashed rgba(128, 128, 128, 0.45)', width: '100%' }}>
    {children}
  </div>
)

/** Holds selected so each example is clickable. */
const StatefulBar = ({
  initial,
  options,
  style,
  ...rest
}: {
  initial?: string
  options: Record<string, ReactNode>
  title?: string
  style?: CSSProperties
  align?: 'center' | 'flex-start' | 'flex-end'
}) => {
  const [selected, setSelected] = useState(initial ?? Object.keys(options)[0])
  return (
    <RadioToggleBar
      selected={selected}
      options={options}
      onChange={value => setSelected(String(value))}
      style={{ ...THEME, ...style }}
      {...rest}
    />
  )
}

const alignVariants = ALIGNMENTS.map(align => ({
  title: `align: ${align}`,
  element: (
    <Frame>
      <StatefulBar options={YEARS} align={align} />
    </Frame>
  )
}))

/** Every layout and theming option of RadioToggleBar, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description: 'align center, no title, showcase theme in place of host tokens',
    element: <StatefulBar options={YEARS} />
  },
  {
    title: 'Title',
    element: <StatefulBar options={YEARS} title='Wahljahr' />
  },
  ...alignVariants,
  {
    title: 'Two options',
    element: <StatefulBar options={{ de: 'Deutsch', fr: 'Français' }} />
  },
  {
    title: 'Many options (wraps)',
    element: <StatefulBar options={MANY} />
  },
  {
    title: 'ReactNode labels',
    element: (
      <StatefulBar
        options={{
          svp: (
            <>
              SVP <small style={{ fontWeight: 400, opacity: 0.7 }}>28%</small>
            </>
          ),
          sp: (
            <>
              SP <small style={{ fontWeight: 400, opacity: 0.7 }}>18%</small>
            </>
          ),
          fdp: (
            <>
              FDP <small style={{ fontWeight: 400, opacity: 0.7 }}>14%</small>
            </>
          )
        }}
      />
    )
  },
  {
    title: 'style',
    element: (
      <StatefulBar
        options={PARTIES}
        style={{ marginTop: 24, opacity: 0.85 }}
      />
    )
  },
  {
    title: 'CSS variables',
    description:
      '--toggle-bg, --toggle-color, --toggle-selected-bg, --toggle-selected-color, --toggle-border-color, --toggle-padding, --toggle-font-size',
    element: (
      <StatefulBar
        options={PARTIES}
        style={{
          '--toggle-bg': '#fdeaea',
          '--toggle-color': '#a32020',
          '--toggle-hover-bg': '#f8c9c9',
          '--toggle-hover-color': '#7a1818',
          '--toggle-selected-bg': '#e74c3c',
          '--toggle-selected-color': '#fff',
          '--toggle-border-color': '#e74c3c',
          '--toggle-padding': '10px 22px',
          '--toggle-font-size': '13px'
        } as CSSProperties}
      />
    )
  },
  {
    title: 'Host tokens (no showcase theme)',
    description:
      'Falls back to --beige-bright-*, --yellow-main, --gray-3 — unset here, so this is how it looks without a host',
    element: (
      <RadioToggleBar
        selected='2019'
        options={YEARS}
        onChange={() => undefined}
      />
    )
  },
  {
    title: 'All options',
    element: (
      <Frame>
        <StatefulBar
          title='Partei'
          options={PARTIES}
          align='flex-start'
          initial='sp'
          style={{
            '--toggle-padding': '8px 16px',
            '--toggle-font-size': '14px'
          } as CSSProperties}
        />
      </Frame>
    )
  }
]
