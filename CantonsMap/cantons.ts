import cantonsJson from './cantons.json'

export type CantonLanguage = 'de' | 'fr'

export type Canton = {
  bfsId: number
  code: string
  de: string
  fr: string
}

export const CANTONS: Canton[] = cantonsJson
export const ALL_CANTON_CODES = CANTONS.map(canton => canton.code)

const CANTON_BY_CODE = Object.fromEntries(
  CANTONS.map(canton => [canton.code, canton])
)

export const CANTON_WAPPEN_URL =
  'https://interaktiv.tagesanzeiger.ch/static/kantonswappen'

/**
 * Returns the localized display name for a canton code.
 */
export function getCantonName (code: string, lang: CantonLanguage) {
  return CANTON_BY_CODE[code]?.[lang] ?? code
}

/**
 * Returns the static URL for a canton's coat of arms.
 */
export function getCantonWappenUrl (id: string) {
  return `${CANTON_WAPPEN_URL}/${id}.svg`
}
