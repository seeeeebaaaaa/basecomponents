import type { ComponentType, ReactNode } from 'react'

type Locale = Record<string, unknown>

/**
 * Optional `showcaseConfig` export a showcase file can use to feed the
 * MFContext values it needs, standing in for the host's properties object.
 */
export type ShowcaseConfig = {
  translations?: { de: Locale; fr?: Locale }
  properties?: Record<string, string>
  customProps?: Record<string, unknown>
  tenantKey?: string
  placeHolderHeight?: number
}

/**
 * One labelled example. Exporting these as data keeps the section/title
 * chrome here in the app, so component folders stay import-free.
 */
export type ShowcaseVariant = {
  title?: string
  description?: string
  element: ReactNode
}

export type ShowcaseEntry = {
  name: string
  Showcase?: ComponentType
  variants?: ShowcaseVariant[]
  config: Required<Pick<ShowcaseConfig, 'translations' | 'properties' | 'tenantKey'>> &
    ShowcaseConfig
  source: string
}

type ShowcaseModule = {
  default?: ComponentType
  showcaseVariants?: ShowcaseVariant[]
  showcaseConfig?: ShowcaseConfig
  [key: string]: unknown
}

const MODULES = import.meta.glob('../../*/*Showcase.tsx', {
  eager: true
}) as Record<string, ShowcaseModule>

const SOURCES = import.meta.glob('../../*/*Showcase.tsx', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

/** Picks the showcase export: default, `<Name>Showcase`, or the first function. */
const resolveShowcase = (module: ShowcaseModule, name: string) =>
  (module.default ??
    module[`${name}Showcase`] ??
    Object.values(module).find(value => typeof value === 'function')) as ComponentType

/** Fills in the MFContext values a showcase did not supply itself. */
const withDefaults = (config: ShowcaseConfig = {}) => ({
  translations: { de: {} },
  properties: {},
  tenantKey: 'showcase',
  ...config
})

/** One entry per `<Name>/<Name>Showcase.tsx` in the library, sorted by name. */
export const SHOWCASES: ShowcaseEntry[] = Object.entries(MODULES)
  .map(([path, module]) => {
    const name = path.split('/')[2]
    return {
      name,
      Showcase: module.showcaseVariants ? undefined : resolveShowcase(module, name),
      variants: module.showcaseVariants,
      config: withDefaults(module.showcaseConfig),
      source: SOURCES[path]
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))
