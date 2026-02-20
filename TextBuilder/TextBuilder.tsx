/** A text segment: [text] or [text, className]. */
export type Segment = [string, string?]

const NO_SPACE_BEFORE = /^[\s.,;:!?)\]]/
const NO_SPACE_AFTER = /[(\[]\s*$/

type TextBuilderOptions = {
  decimalSeparator?: string
  decimalPlaces?: number
  trailingZeros?: boolean
}

/**
 * Builds dynamic rich text as an array of [text, className?] tuples.
 * Spaces between segments are inserted automatically.
 * Rendering is the consumer's responsibility.
 */
export class TextBuilder {
  private segments: Segment[]
  private decimalSeparator: string
  private decimalPlaces: number | undefined
  private trailingZeros: boolean

  constructor (options?: TextBuilderOptions) {
    this.segments = []
    this.decimalSeparator = options?.decimalSeparator ?? '.'
    this.decimalPlaces = options?.decimalPlaces
    this.trailingZeros = options?.trailingZeros ?? false
  }

  /** Converts a number to string using the configured decimal separator and precision. */
  private formatNumber (value: number): string {
    let str = this.decimalPlaces !== undefined
      ? value.toFixed(this.decimalPlaces)
      : String(value)
    if (!this.trailingZeros) str = str.replace(/\.?0+$/, '')
    return str.replace('.', this.decimalSeparator)
  }

  /** Appends a segment, auto-prepending a space unless text starts with punctuation or whitespace. */
  private push (text: string | number, className?: string) {
    const str = typeof text === 'number' ? this.formatNumber(text) : text
    const prev = this.segments.length > 0 ? this.segments[this.segments.length - 1][0] : null
    const needsSpace = prev !== null && !NO_SPACE_BEFORE.test(str) && !NO_SPACE_AFTER.test(prev)
    const spaced = needsSpace ? ' ' + str : str
    this.segments.push(className ? [spaced, className] : [spaced])
  }

  /** Appends a text segment with an optional className. */
  add (text: string | number, className?: string) {
    this.push(text, className)
    return this
  }

  /** Appends a number and its singular/plural label together. */
  quantity (
    value: number,
    singular: string,
    plural: string,
    className?: string
  ) {
    this.push(value, className)
    this.push(value === 1 ? singular : plural, className)
    return this
  }

  /** Appends singular or plural form based on value. */
  singular_or_plural (
    value: number,
    singular: string,
    plural: string,
    className?: string
  ) {
    this.push(value === 1 ? singular : plural, className)
    return this
  }

  /** Appends the text from the first range that matches the value. */
  decide_by_range (
    value: number,
    ranges: [[number, number], string, string?][]
  ) {
    for (const [range, text, className] of ranges) {
      if (value >= range[0] && value <= range[1]) {
        this.push(text, className)
        break
      }
    }
    return this
  }

  /** Appends one of two templates based on string equality. */
  compare_strings (
    value1: string,
    value2: string,
    templates: string[],
    className?: string
  ) {
    if (value1 === value2) {
      this.push(templates[0], className)
    } else {
      this.push(templates[1], className)
    }
    return this
  }

  /** Appends one of three segments based on comparison of two values (equal / greater / less). */
  compare (value1: number, value2: number, templates: Segment[]) {
    const idx = value1 === value2 ? 0 : value1 > value2 ? 1 : 2
    const [text, className] = templates[idx]
    this.push(text, className)
    return this
  }

  /** Returns the accumulated segments array. */
  get (): Segment[] {
    return this.segments
  }
}
