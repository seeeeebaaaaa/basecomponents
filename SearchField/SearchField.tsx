import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'
import styled from 'styled-components'

const DEFAULT_MAX_RESULTS = 8
const DEFAULT_MIN_QUERY_LENGTH = 1
const DEFAULT_LOCALE = 'de-CH'

export interface SearchFieldProps<T> {
  items: T[]
  getItemLabel: (item: T) => string
  getItemKey?: (item: T, index: number) => string | number
  getItemScore?: (item: T, query: string) => number
  renderItem?: (
    item: T,
    context: { query: string; isActive: boolean; label: string }
  ) => ReactNode
  maxResults?: number
  minQueryLength?: number
  placeholder?: string
  emptyMessage?: string | ReactNode
  clearLabel?: string
  locale?: string
  value?: string
  onChange?: (query: string) => void
  onSelect?: (item: T) => void
  className?: string
  disabled?: boolean
  id?: string
}

/**
 * Reusable search field with a ranked, length-capped results list.
 * Style via CSS variables on this component or a parent (`--search-radius`, `--search-bg`, …).
 */
function SearchField<T> ({
  items,
  getItemLabel,
  getItemKey,
  getItemScore,
  renderItem,
  maxResults = DEFAULT_MAX_RESULTS,
  minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
  placeholder = 'Search…',
  emptyMessage = 'No results',
  clearLabel = 'Clear search',
  locale = DEFAULT_LOCALE,
  value,
  onChange,
  onSelect,
  className,
  disabled = false,
  id
}: SearchFieldProps<T>) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listboxId = `${inputId}-results`
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalQuery, setInternalQuery] = useState(value ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const isControlled = value !== undefined
  const query = isControlled ? value : internalQuery
  const trimmedQuery = query.trim()
  const canSearch = trimmedQuery.length >= minQueryLength
  const searchIndex = useMemo(
    (): SearchIndexEntry<T>[] =>
      items.map(item => ({
        item,
        normalizedLabel: normalizeSearchText(getItemLabel(item), locale)
      })),
    [items, getItemLabel, locale]
  )
  const results = useMemo((): T[] => {
    if (!canSearch) return []
    return getRankedResults<T>({
      items,
      searchIndex,
      query: trimmedQuery,
      maxResults,
      getItemScore,
      locale
    })
  }, [
    canSearch,
    items,
    searchIndex,
    trimmedQuery,
    maxResults,
    getItemScore,
    locale
  ])
  const showList = isOpen && canSearch && !disabled
  const activeItem: T | undefined = results[activeIndex]
  const activeOptionId =
    showList && activeItem !== undefined
      ? getOptionId(
          listboxId,
          getItemKey?.(activeItem, activeIndex) ?? activeIndex
        )
      : undefined

  useEffect(() => {
    setActiveIndex(0)
  }, [trimmedQuery])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleQueryChange = (nextQuery: string) => {
    if (!isControlled) setInternalQuery(nextQuery)
    onChange?.(nextQuery)
    setIsOpen(true)
  }

  const handleClear = () => {
    handleQueryChange('')
    setIsOpen(false)
  }

  const handleSelect = (item: T) => {
    const label = getItemLabel(item)
    if (!isControlled) setInternalQuery(label)
    onChange?.(label)
    onSelect?.(item)
    setIsOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!showList) {
        setIsOpen(true)
        return
      }
      setActiveIndex(index =>
        results.length === 0 ? 0 : (index + 1) % results.length
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!showList) {
        setIsOpen(true)
        return
      }
      setActiveIndex(index =>
        results.length === 0 ? 0 : (index - 1 + results.length) % results.length
      )
      return
    }

    if (event.key === 'Enter' && showList && activeItem !== undefined) {
      event.preventDefault()
      handleSelect(activeItem)
    }
  }

  return (
    <SearchFieldRoot ref={rootRef} className={className}>
      <SearchInputRow>
        <SearchIcon aria-hidden='true'>
          <SearchIconSvg />
        </SearchIcon>
        <SearchInput
          id={inputId}
          type='text'
          role='combobox'
          aria-autocomplete='list'
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          value={query}
          onChange={event => handleQueryChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete='off'
          spellCheck={false}
        />
        {query && !disabled && (
          <ClearButton onClick={handleClear} aria-label={clearLabel}>
            <ClearIconSvg />
          </ClearButton>
        )}
      </SearchInputRow>
      {showList && (
        <ResultsList id={listboxId} role='listbox'>
          {results.length === 0 ? (
            <EmptyMessage>{emptyMessage}</EmptyMessage>
          ) : (
            results.map((item, index) => {
              const label = getItemLabel(item)
              const key = getItemKey?.(item, index) ?? `${label}-${index}`
              const isActive = index === activeIndex
              return (
                <ResultItem
                  id={getOptionId(listboxId, key)}
                  key={key}
                  role='option'
                  aria-selected={isActive}
                  $isActive={isActive}
                  onPointerDown={event => {
                    event.preventDefault()
                    handleSelect(item)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {renderItem
                    ? renderItem(item, { query: trimmedQuery, isActive, label })
                    : highlightMatch(label, trimmedQuery, locale)}
                </ResultItem>
              )
            })
          )}
        </ResultsList>
      )}
    </SearchFieldRoot>
  )
}

const SearchFieldRoot = styled.div`
  position: relative;
  width: 100%;
  z-index: var(--search-z-index, 1010);
`

const SearchInputRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`

const SearchIcon = styled.div`
  position: absolute;
  left: var(--search-icon-inset, 12px);
  color: var(--search-icon, var(--search-muted, var(--gray-3)));
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SearchInput = styled.input`
  width: 100%;
  padding: var(--search-padding-y, 10px) 40px;
  font-size: var(--search-font-size, 18px);
  border: 1px solid var(--search-border, transparent);
  border-radius: var(--search-radius, 4px);
  outline: none;
  background-color: var(--search-bg, var(--site-background));
  color: var(--search-text, var(--text-color));

  &::placeholder {
    color: var(--search-placeholder, var(--search-muted, var(--gray-3)));
  }

  &:focus {
    border-color: var(--search-border-focus, var(--blue-main));
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const ClearButton = styled.button`
  position: absolute;
  right: var(--search-icon-inset, 12px);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--search-muted, var(--gray-3));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: var(--search-text, var(--text-color));
  }

  &:focus {
    outline: 2px solid var(--search-border-focus, var(--blue-main));
    outline-offset: 2px;
    border-radius: 2px;
  }
`

const ResultsList = styled.ul`
  position: absolute;
  z-index: 2;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(
    --search-results-bg,
    var(--search-bg, var(--site-background))
  );
  border: 1px solid var(--search-results-border, var(--gray-4));
  border-radius: var(--search-radius, 4px);
  box-shadow: var(--search-results-shadow, 0 8px 24px rgba(0, 0, 0, 0.12));
  max-height: var(--search-results-max-height, 420px);
  overflow-y: auto;
`

const ResultItem = styled.li<{ $isActive: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  color: var(--search-text, var(--text-color));
  background: ${props =>
    props.$isActive
      ? `var(
          --search-result-active-bg,
          color-mix(in srgb, var(--text-color) 8%, var(--site-background))
        )`
      : 'transparent'};
`

const EmptyMessage = styled.li`
  font-size: 14px;
  line-height: 1.3em;
  padding: 8px 12px;
  color: var(--search-muted, var(--gray-3));
  
`

const Mark = styled.mark`
  background: none;
  color: var(--search-highlight, var(--blue-main));
  font-weight: 600;
`

function SearchIconSvg () {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14 14L10.5 10.5'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function ClearIconSvg () {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M1 1L13 13M1 13L13 1'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  )
}

/**
 * Returns a stable option id for aria-activedescendant.
 */
function getOptionId (listboxId: string, key: string | number) {
  return `${listboxId}-option-${key}`
}

/**
 * Normalizes text for accent-insensitive matching (Müller → muller).
 */
function normalizeSearchText (value: string, locale: string) {
  return value
    .toLocaleLowerCase(locale)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

interface SearchIndexEntry<T> {
  item: T
  normalizedLabel: string
}

interface RankedResultsArgs<T> {
  items: T[]
  searchIndex: SearchIndexEntry<T>[]
  query: string
  maxResults: number
  getItemScore?: (item: T, query: string) => number
  locale: string
}

/**
 * Filters and ranks items, keeping original order for equal scores.
 */
function getRankedResults<T> ({
  items,
  searchIndex,
  query,
  maxResults,
  getItemScore,
  locale
}: RankedResultsArgs<T>) {
  if (getItemScore) {
    return getTopScoredItems(items, query, maxResults, getItemScore)
  }

  const normalizedQuery = normalizeSearchText(query, locale)
  if (!normalizedQuery) return []

  const exact: T[] = []
  const prefix: T[] = []
  const substring: T[] = []

  for (const { item, normalizedLabel } of searchIndex) {
    if (normalizedLabel === normalizedQuery) {
      exact.push(item)
      if (exact.length === maxResults) break
      continue
    }

    if (exact.length + prefix.length >= maxResults) continue

    if (normalizedLabel.startsWith(normalizedQuery)) {
      prefix.push(item)
      continue
    }

    if (
      exact.length + prefix.length + substring.length < maxResults &&
      normalizedLabel.includes(normalizedQuery)
    ) {
      substring.push(item)
    }
  }

  return exact.concat(prefix, substring).slice(0, maxResults)
}

/**
 * Keeps only the highest-scoring items without sorting the full list.
 */
function getTopScoredItems<T> (
  items: T[],
  query: string,
  maxResults: number,
  getItemScore: (item: T, query: string) => number
) {
  const top: { item: T; score: number; index: number }[] = []

  for (let index = 0; index < items.length; index++) {
    const score = getItemScore(items[index], query)
    if (score <= 0) continue

    if (top.length < maxResults) {
      top.push({ item: items[index], score, index })
      top.sort((a, b) => b.score - a.score || a.index - b.index)
      continue
    }

    const worst = top[top.length - 1]
    if (score > worst.score) {
      top[top.length - 1] = { item: items[index], score, index }
      top.sort((a, b) => b.score - a.score || a.index - b.index)
    }
  }

  return top.map(entry => entry.item)
}

/**
 * Wraps the first case-insensitive query match in the label.
 */
function highlightMatch (label: string, query: string, locale: string) {
  if (!query) return label
  const lowerLabel = label.toLocaleLowerCase(locale)
  const lowerQuery = query.toLocaleLowerCase(locale)
  const matchIndex = lowerLabel.indexOf(lowerQuery)
  if (matchIndex === -1) return label
  return (
    <>
      {label.slice(0, matchIndex)}
      <Mark>{label.slice(matchIndex, matchIndex + query.length)}</Mark>
      {label.slice(matchIndex + query.length)}
    </>
  )
}

export default SearchField
