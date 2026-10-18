import React, { useState, type CSSProperties, type ReactNode } from 'react'
import RankTable, { type RankTableColumn } from './RankTable'

type Row = {
  rank: number
  name: string
  canton: string
  value: number
}

const NAMES = [
  'Zürich',
  'Genève',
  'Basel',
  'Lausanne',
  'Bern',
  'Winterthur',
  'Luzern',
  'St. Gallen',
  'Lugano',
  'Biel/Bienne',
  'Thun',
  'Köniz',
  'La Chaux-de-Fonds',
  'Fribourg',
  'Schaffhausen',
  'Chur',
  'Vernier',
  'Uster',
  'Sion',
  'Neuchâtel',
  'Lancy',
  'Emmen',
  'Yverdon',
  'Zug',
  'Kriens'
]

const CANTONS = [
  'ZH',
  'GE',
  'BS',
  'VD',
  'BE',
  'ZH',
  'LU',
  'SG',
  'TI',
  'BE',
  'BE',
  'BE',
  'NE',
  'FR',
  'SH',
  'GR',
  'GE',
  'ZH',
  'VS',
  'NE',
  'GE',
  'LU',
  'VD',
  'ZG',
  'LU'
]

const ROWS: Row[] = NAMES.map((name, index) => ({
  rank: index + 1,
  name,
  canton: CANTONS[index],
  value: 420000 - index * 14800
}))

const COLUMNS: RankTableColumn<Row>[] = [
  {
    id: 'rank',
    header: '#',
    cell: row => row.rank,
    align: 'right',
    width: '48px'
  },
  { id: 'name', header: 'Gemeinde', cell: row => row.name },
  {
    id: 'canton',
    header: 'Kanton',
    cell: row => row.canton,
    align: 'center',
    width: '80px'
  },
  {
    id: 'value',
    header: 'Einwohner',
    cell: row => row.value.toLocaleString('de-CH'),
    align: 'right',
    width: '110px'
  }
]

/** Showcase tokens so header, borders and the button are visible without host variables. */
const THEME = {
  '--rank-table-header-color': 'inherit',
  '--rank-table-header-border': 'currentColor',
  '--rank-table-highlight-bg': '#9b59b6',
  '--rank-table-highlight-text': '#fff',
  '--rank-table-button-bg': '#1a1a1a',
  '--rank-table-button-text': '#fff',
  '--rank-table-button-hover-bg': '#9b59b6',
  '--rank-table-pinned-border': 'currentColor',
  '--table-cell-border-color': 'rgba(128, 128, 128, 0.25)',
  '--table-gradient-border-color': 'rgba(128, 128, 128, 0.25)',
  '--table-gradient-2': 'linear-gradient(transparent, rgba(128, 128, 128, 0.12))',
  '--site-background': 'transparent'
} as CSSProperties

const Frame = ({
  children,
  style
}: {
  children: ReactNode
  style?: CSSProperties
}) => <div style={{ ...THEME, ...style }}>{children}</div>

const getRowKey = (row: Row) => row.rank

/** Increments resetKey so an expanded table collapses again. */
const ResettableTable = () => {
  const [resetKey, setResetKey] = useState(0)
  return (
    <Frame>
      <button
        type='button'
        onClick={() => setResetKey(key => key + 1)}
        style={{
          marginBottom: 12,
          padding: '6px 10px',
          fontSize: 13,
          cursor: 'pointer'
        }}
      >
        resetKey = {resetKey} (click to collapse)
      </button>
      <RankTable
        items={ROWS}
        columns={COLUMNS}
        getRowKey={getRowKey}
        collapsedLimit={5}
        expandedLimit={12}
        resetKey={resetKey}
        showMoreLabel='Mehr anzeigen'
        showLessLabel='Weniger anzeigen'
      />
    </Frame>
  )
}

/** Every slice, highlight and theming option of RankTable, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description: 'collapsedLimit 10, expandedLimit 100. Show more reveals the rest.',
    element: (
      <Frame>
        <RankTable items={ROWS} columns={COLUMNS} getRowKey={getRowKey} />
      </Frame>
    )
  },
  {
    title: 'Column align and width',
    description: 'Rank and value are right-aligned; canton is centered with a fixed width.',
    element: (
      <Frame>
        <RankTable
          items={ROWS.slice(0, 8)}
          columns={COLUMNS}
          getRowKey={getRowKey}
        />
      </Frame>
    )
  },
  {
    title: 'Highlighted row (in slice)',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          collapsedLimit={8}
          isHighlighted={row => row.name === 'Bern'}
        />
      </Frame>
    )
  },
  {
    title: 'Highlighted row outside slice',
    description: 'Zug is rank 24; collapsed to 6, so it pins below the table.',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          collapsedLimit={6}
          isHighlighted={row => row.name === 'Zug'}
        />
      </Frame>
    )
  },
  {
    title: 'mapHighlighted',
    description: 'The highlighted row is rewritten before render.',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          collapsedLimit={8}
          isHighlighted={row => row.name === 'Bern'}
          mapHighlighted={row => ({ ...row, name: `${row.name} (du)` })}
        />
      </Frame>
    )
  },
  {
    title: 'collapsedLimit 5 / expandedLimit 12',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          collapsedLimit={5}
          expandedLimit={12}
        />
      </Frame>
    )
  },
  {
    title: 'showMoreLabel / showLessLabel',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          collapsedLimit={5}
          showMoreLabel='Mehr anzeigen'
          showLessLabel='Weniger anzeigen'
        />
      </Frame>
    )
  },
  {
    title: 'ReactNode labels and cells',
    element: (
      <Frame>
        <RankTable
          items={ROWS.slice(0, 6)}
          columns={[
            {
              id: 'rank',
              header: <em>Rang</em>,
              cell: row => <strong>{row.rank}</strong>,
              align: 'right',
              width: '56px'
            },
            {
              id: 'name',
              header: 'Ort',
              cell: row => (
                <>
                  {row.name}{' '}
                  <small style={{ opacity: 0.55 }}>{row.canton}</small>
                </>
              )
            }
          ]}
          getRowKey={getRowKey}
        />
      </Frame>
    )
  },
  {
    title: 'loading',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          loading
        />
      </Frame>
    )
  },
  {
    title: 'loadingLabel as ReactNode',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          loading
          loadingLabel={<em>Tabelle wird geladen…</em>}
        />
      </Frame>
    )
  },
  {
    title: 'Empty items',
    description: 'Renders nothing.',
    element: (
      <div>
        <RankTable items={[]} columns={COLUMNS} getRowKey={getRowKey} />
        <span style={{ fontSize: 13, opacity: 0.55 }}>
          Nothing above this line.
        </span>
      </div>
    )
  },
  {
    title: 'resetKey',
    description: 'Expand the table, then click the button — it collapses again.',
    element: <ResettableTable />
  },
  {
    title: 'CSS variables',
    element: (
      <Frame
        style={{
          '--rank-table-max-width': '480px',
          '--rank-table-font-size': '15px',
          '--rank-table-header-size': '12px',
          '--rank-table-highlight-bg': '#e74c3c',
          '--rank-table-button-bg': '#e74c3c',
          '--rank-table-button-hover-bg': '#c0392b',
          '--rank-table-cell-padding': '8px'
        } as CSSProperties}
      >
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          collapsedLimit={6}
          isHighlighted={row => row.name === 'Basel'}
          showMoreLabel='Mehr'
          showLessLabel='Weniger'
        />
      </Frame>
    )
  },
  {
    title: 'All options',
    element: (
      <Frame>
        <RankTable
          items={ROWS}
          columns={COLUMNS}
          getRowKey={getRowKey}
          collapsedLimit={5}
          expandedLimit={15}
          isHighlighted={row => row.name === 'Zug'}
          mapHighlighted={row => ({ ...row, name: `${row.name} ★` })}
          showMoreLabel='Mehr anzeigen'
          showLessLabel='Weniger anzeigen'
        />
      </Frame>
    )
  }
]
