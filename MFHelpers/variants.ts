import { useMFContext, url } from './MFContext'

export type VariantOptions = {
  isMobile: boolean
  colorMode: string
}

export function variantName(base: string, { isMobile, colorMode }: VariantOptions) {
  return base + (isMobile ? '_mob' : '') + (colorMode === 'dark' ? '_dm' : '')
}

export function variantPath(base: string, ext: string, options: VariantOptions) {
  return url(`${variantName(base, options)}.${ext}`)
}

export function useVariantPath(base: string, ext: string) {
  const { isMobile, colorMode } = useMFContext()
  return variantPath(base, ext, { isMobile, colorMode })
}
