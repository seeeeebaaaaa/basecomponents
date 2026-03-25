import MapboxGeocoder from 'components/GeoCoder'
import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import mapboxgl from 'mapbox-gl'
import { useContext, useEffect } from 'react'

type GeocoderControl = mapboxgl.IControl & {
  on: (event: string, handler: (event: any) => void) => void
  off: (event: string, handler: (event: any) => void) => void
  setLanguage?: (language: string) => void
  setCountries?: (countries: string) => void
  setMinLength?: (minLength: number) => void
  setLocales?: (locales: string[]) => void
  setCustomInput?: (input: HTMLInputElement) => void
  _inputEl?: HTMLInputElement
}

type GeocoderProps = {
  position?: CTRLPositions
  showWhenActivated?: boolean
  language?: string
  countries?: string
  minLength?: number
  locales?: string[]
  options?: Record<string, unknown>
  onResult?: (event: any) => void
  onResults?: (event: any) => void
  onLoading?: (event: any) => void
  onClear?: (event: any) => void
  onError?: (event: any) => void
}

/** Adds a reusable geocoder map control and wires closed-shadow input fallback automatically. */
export const Geocoder = ({
  position = 'top-left',
  showWhenActivated = false,
  language,
  countries = 'ch',
  minLength = 3,
  locales,
  options,
  onResult,
  onResults,
  onLoading,
  onClear,
  onError
}: GeocoderProps) => {
  const { map, isInteractive } = useContext(MapContext)
  const shouldShow = !showWhenActivated || !!isInteractive

  useEffect(() => {
    if (!map || !shouldShow) return

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken ?? '',
      mapboxgl: mapboxgl as any,
      marker: false,
      ...options
    }) as GeocoderControl

    if (language) geocoder.setLanguage?.(language)
    if (countries) geocoder.setCountries?.(countries)
    if (typeof minLength === 'number') geocoder.setMinLength?.(minLength)
    if (locales?.length) geocoder.setLocales?.(locales)

    if (onResult) geocoder.on('result', onResult)
    if (onResults) geocoder.on('results', onResults)
    if (onLoading) geocoder.on('loading', onLoading)
    if (onClear) geocoder.on('clear', onClear)
    if (onError) geocoder.on('error', onError)

    map.addControl(geocoder, position)

    if (geocoder._inputEl) {
      geocoder.setCustomInput?.(geocoder._inputEl)
    }

    return () => {
      if (onResult) geocoder.off('result', onResult)
      if (onResults) geocoder.off('results', onResults)
      if (onLoading) geocoder.off('loading', onLoading)
      if (onClear) geocoder.off('clear', onClear)
      if (onError) geocoder.off('error', onError)
      map.removeControl(geocoder)
    }
  }, [
    map,
    position,
    shouldShow,
    language,
    countries,
    minLength,
    locales,
    options,
    onResult,
    onResults,
    onLoading,
    onClear,
    onError
  ])

  return null
}
