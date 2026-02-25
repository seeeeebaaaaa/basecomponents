import { Fragment, type ReactNode } from 'react'

type ReplacementMap = Record<string, ReactNode>
type Delimiters = [open: string, close: string]
type KeyRef = { current: number }
type RangeEntry = [[min: number, max: number], string]
type FormatKind = 'bold-italic' | 'bold' | 'italic' | null

const DEFAULT_DELIMITERS: Delimiters = ['{{', '}}']

/** Returns the text from the first range that matches the value. */
export function byRange (value: number, ranges: RangeEntry[]): string {
  for (const [[min, max], text] of ranges) {
    if (value >= min && value <= max) return text
  }
  return ''
}

/** Returns singular or plural form based on the value. */
export function plural (value: number, singular: string, pluralForm: string): string {
  return value === 1 ? singular : pluralForm
}

/** Tagged template that collapses multi-line text into a single line. */
export function t (strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '')
  return raw.replace(/\s+/g, ' ').trim()
}

/** Splits text into plain and formatted (*italic*, **bold**, ***both***) segments. */
function splitByFormat (text: string): { text: string; format: FormatKind }[] {
  const result: { text: string; format: FormatKind }[] = []
  let remaining = text

  while (remaining.length > 0) {
    const idx = remaining.indexOf('*')
    if (idx === -1) {
      result.push({ text: remaining, format: null })
      break
    }

    let len = 1
    if (remaining[idx + 1] === '*') len = 2
    if (len === 2 && remaining[idx + 2] === '*') len = 3

    const marker = '*'.repeat(len)
    const after = remaining.slice(idx + len)
    const close = after.indexOf(marker)

    if (close === -1) {
      result.push({ text: remaining, format: null })
      break
    }

    if (idx > 0) result.push({ text: remaining.slice(0, idx), format: null })

    const format: FormatKind = len === 3 ? 'bold-italic' : len === 2 ? 'bold' : 'italic'
    result.push({ text: after.slice(0, close), format })

    remaining = after.slice(close + len)
  }

  return result
}

/** Splits a plain text string on || and inserts <br /> elements. */
function textNodes (text: string, k: KeyRef): ReactNode[] {
  const parts = text.split('||')
  if (parts.length === 1) return [text]
  return parts.flatMap((part, i) =>
    i === 0 ? [part] : [<br key={`br${k.current++}`} />, part]
  )
}

/** Wraps nodes in the appropriate formatting element. */
function wrapNodes (nodes: ReactNode[], format: FormatKind, k: KeyRef): ReactNode[] {
  if (!format) return nodes
  const key = k.current++
  if (format === 'bold-italic') return [<strong key={key}><em>{nodes}</em></strong>]
  if (format === 'bold') return [<strong key={key}>{nodes}</strong>]
  return [<em key={key}>{nodes}</em>]
}

/** Parses formatting markers in a string (no {{key}} replacement). */
function parseFormat (text: string, k: KeyRef): ReactNode[] {
  return splitByFormat(text).flatMap(({ text: t, format }) =>
    wrapNodes(textNodes(t, k), format, k)
  )
}

/** Replaces {{key}} placeholders in text with values from the map. */
function replaceTokens (
  text: string,
  replacements: ReplacementMap,
  open: string,
  close: string,
  k: KeyRef
): ReactNode[] {
  const result: ReactNode[] = []
  let remaining = text

  while (remaining.length > 0) {
    const start = remaining.indexOf(open)
    if (start === -1) {
      result.push(...textNodes(remaining, k))
      break
    }

    const end = remaining.indexOf(close, start + open.length)
    if (end === -1) {
      result.push(...textNodes(remaining, k))
      break
    }

    if (start > 0) result.push(...textNodes(remaining.slice(0, start), k))

    const token = remaining.slice(start + open.length, end)
    if (token in replacements) {
      const value = replacements[token]
      if (typeof value === 'string') {
        result.push(...parseFormat(value, k))
      } else {
        result.push(<Fragment key={k.current++}>{value}</Fragment>)
      }
    } else {
      result.push(`${open}${token}${close}`)
    }

    remaining = remaining.slice(end + close.length)
  }

  return result
}

/**
 * Replaces {{key}} placeholders with React nodes from the map
 * and parses *italic*, **bold**, ***bold+italic*** formatting markers.
 * Formatting can span across placeholders.
 */
export function TextTemplateReplacer (
  template: string,
  replacements: ReplacementMap,
  delimiters: Delimiters = DEFAULT_DELIMITERS
): ReactNode[] {
  const [open, close] = delimiters
  const k: KeyRef = { current: 0 }

  return splitByFormat(template).flatMap(({ text, format }) => {
    const nodes = replaceTokens(text, replacements, open, close, k)
    return wrapNodes(nodes, format, k)
  })
}
