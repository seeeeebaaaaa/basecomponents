import React, { useState, type CSSProperties, type ReactNode } from 'react'
import SearchField from './SearchField'

type Place = {
  id: string
  name: string
  canton: string
  population: number
}

const PLACES: Place[] = [
  { id: 'zh', name: 'Zürich', canton: 'ZH', population: 420217 },
  { id: 'ge', name: 'Genève', canton: 'GE', population: 203856 },
  { id: 'bs', name: 'Basel', canton: 'BS', population: 178322 },
  { id: 'lausanne', name: 'Lausanne', canton: 'VD', population: 140202 },
  { id: 'be', name: 'Bern', canton: 'BE', population: 133883 },
  { id: 'winterthur', name: 'Winterthur', canton: 'ZH', population: 114220 },
  { id: 'lu', name: 'Luzern', canton: 'LU', population: 82257 },
  { id: 'sg', name: 'St. Gallen', canton: 'SG', population: 76213 },
  { id: 'lugano', name: 'Lugano', canton: 'TI', population: 63185 },
  { id: 'biel', name: 'Biel/Bienne', canton: 'BE', population: 55217 },
  { id: 'thun', name: 'Thun', canton: 'BE', population: 43532 },
  { id: 'koeniz', name: 'Köniz', canton: 'BE', population: 41784 },
  { id: 'fribourg', name: 'Fribourg', canton: 'FR', population: 38365 },
  { id: 'chur', name: 'Chur', canton: 'GR', population: 37936 },
  { id: 'neuchatel', name: 'Neuchâtel', canton: 'NE', population: 33448 },
  { id: 'sion', name: 'Sion', canton: 'VS', population: 34710 },
  { id: 'muensingen', name: 'Münsingen', canton: 'BE', population: 12540 },
  { id: 'zug', name: 'Zug', canton: 'ZG', population: 30954 }
]

const NAMES = PLACES.map(place => place.name)

/** Showcase tokens so the field is visible without the host's site variables. */
const THEME = {
  '--search-bg': 'rgba(128, 128, 128, 0.08)',
  '--search-text': 'inherit',
  '--search-border': 'rgba(128, 128, 128, 0.35)',
  '--search-border-focus': '#3498db',
  '--search-placeholder': 'rgba(128, 128, 128, 0.65)',
  '--search-icon': 'inherit',
  '--search-muted': 'rgba(128, 128, 128, 0.65)',
  '--search-results-bg': 'color-mix(in srgb, currentColor 8%, Canvas)',
  '--search-results-border': 'rgba(128, 128, 128, 0.35)',
  '--search-highlight': '#3498db',
  '--search-result-active-bg': 'rgba(52, 152, 219, 0.12)'
} as CSSProperties

const Frame = ({
  children,
  style
}: {
  children: ReactNode
  style?: CSSProperties
}) => (
  <div style={{ maxWidth: 400, ...THEME, ...style }}>{children}</div>
)

const getName = (place: Place) => place.name

/** Shows the current query and last selected item. */
const SelectableSearch = () => {
  const [selected, setSelected] = useState<Place | null>(null)
  return (
    <Frame>
      <SearchField
        items={PLACES}
        getItemLabel={getName}
        getItemKey={place => place.id}
        onSelect={setSelected}
        placeholder='Gemeinde suchen…'
      />
      <SelectedLine>
        {selected
          ? `Selected: ${selected.name} (${selected.canton})`
          : 'Select a result to see onSelect.'}
      </SelectedLine>
    </Frame>
  )
}

/** Controlled query so onChange is visible. */
const ControlledSearch = () => {
  const [query, setQuery] = useState('zü')
  return (
    <Frame>
      <SearchField
        items={NAMES}
        getItemLabel={name => name}
        value={query}
        onChange={setQuery}
        placeholder='Controlled value'
      />
      <SelectedLine>value: {query || '(empty)'}</SelectedLine>
    </Frame>
  )
}

const SelectedLine = ({ children }: { children: ReactNode }) => (
  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.6 }}>{children}</div>
)

/** Every search, ranking and theming option of SearchField, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description: 'Uncontrolled. Focus and type — try “zü”, “kon” or “geneve”.',
    element: (
      <Frame>
        <SearchField items={NAMES} getItemLabel={name => name} />
      </Frame>
    )
  },
  {
    title: 'placeholder, emptyMessage, clearLabel',
    element: (
      <Frame>
        <SearchField
          items={NAMES}
          getItemLabel={name => name}
          placeholder='Gemeinde suchen…'
          emptyMessage='Keine Treffer'
          clearLabel='Suche löschen'
        />
      </Frame>
    )
  },
  {
    title: 'minQueryLength 3',
    description: 'The list stays closed until three characters are typed.',
    element: (
      <Frame>
        <SearchField
          items={NAMES}
          getItemLabel={name => name}
          minQueryLength={3}
          placeholder='Type at least 3 characters'
        />
      </Frame>
    )
  },
  {
    title: 'maxResults 3',
    description: 'Type “e” — only the top three ranked matches appear.',
    element: (
      <Frame>
        <SearchField
          items={NAMES}
          getItemLabel={name => name}
          maxResults={3}
        />
      </Frame>
    )
  },
  {
    title: 'locale de-CH (accents)',
    description: '“kon” matches Köniz, “muns” matches Münsingen, “geneve” matches Genève.',
    element: (
      <Frame>
        <SearchField
          items={NAMES}
          getItemLabel={name => name}
          locale='de-CH'
          placeholder='Try kon, muns, geneve'
        />
      </Frame>
    )
  },
  {
    title: 'getItemKey and onSelect',
    element: <SelectableSearch />
  },
  {
    title: 'getItemScore (population)',
    description: 'Type “z” — Zürich outranks Zug because the custom score uses population.',
    element: (
      <Frame>
        <SearchField
          items={PLACES}
          getItemLabel={getName}
          getItemKey={place => place.id}
          getItemScore={(place, query) => {
            const haystack = place.name.toLocaleLowerCase('de-CH')
            const needle = query.trim().toLocaleLowerCase('de-CH')
            return haystack.includes(needle) ? place.population : 0
          }}
        />
      </Frame>
    )
  },
  {
    title: 'renderItem',
    element: (
      <Frame>
        <SearchField
          items={PLACES}
          getItemLabel={getName}
          getItemKey={place => place.id}
          renderItem={(place, { isActive }) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                fontWeight: isActive ? 600 : 400
              }}
            >
              <span>{place.name}</span>
              <span style={{ opacity: 0.55, fontSize: 13 }}>
                {place.canton} · {place.population.toLocaleString('de-CH')}
              </span>
            </div>
          )}
        />
      </Frame>
    )
  },
  {
    title: 'emptyMessage as ReactNode',
    description: 'Type something that matches nothing, e.g. “xyz”.',
    element: (
      <Frame>
        <SearchField
          items={NAMES}
          getItemLabel={name => name}
          emptyMessage={
            <em style={{ opacity: 0.7 }}>Keine Gemeinde gefunden.</em>
          }
        />
      </Frame>
    )
  },
  {
    title: 'Controlled value',
    element: <ControlledSearch />
  },
  {
    title: 'disabled',
    element: (
      <Frame>
        <SearchField
          items={NAMES}
          getItemLabel={name => name}
          value='Zürich'
          disabled
        />
      </Frame>
    )
  },
  {
    title: 'CSS variables',
    element: (
      <Frame
        style={{
          '--search-bg': '#fdeaea',
          '--search-text': '#a32020',
          '--search-border': '#e74c3c',
          '--search-border-focus': '#c0392b',
          '--search-radius': '12px',
          '--search-font-size': '15px',
          '--search-padding-y': '14px',
          '--search-highlight': '#c0392b',
          '--search-results-bg': '#fff5f5'
        } as CSSProperties}
      >
        <SearchField
          items={NAMES}
          getItemLabel={name => name}
          placeholder='Themed search'
        />
      </Frame>
    )
  },
  {
    title: 'All options',
    element: (
      <Frame>
        <SearchField
          items={PLACES}
          getItemLabel={getName}
          getItemKey={place => place.id}
          maxResults={5}
          minQueryLength={1}
          placeholder='Gemeinde…'
          emptyMessage='Nichts gefunden'
          clearLabel='Leeren'
          locale='de-CH'
          renderItem={(place, { label }) => (
            <>
              {label}{' '}
              <small style={{ opacity: 0.55 }}>{place.canton}</small>
            </>
          )}
        />
      </Frame>
    )
  }
]
