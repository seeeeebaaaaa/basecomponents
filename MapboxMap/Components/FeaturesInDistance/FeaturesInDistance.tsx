import mapboxgl from 'mapbox-gl'
import { useContext, useEffect, useRef } from 'react'
import { MapContext } from 'components/MapboxMap/Mapbox'

/** Converts a distance in meters to pixels at a given latitude and zoom level. */
function metersToPixels(meters: number, lat: number, zoom: number): number {
  const metersPerPixel =
    (40075016.686 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom + 8)
  return meters / metersPerPixel
}

/**
 * Queries rendered features within a given distance (meters) of a coordinate.
 * Fires onResult whenever coordinates or distanceMeters changes.
 * Pair with <FlyTo> to ensure the area is in the viewport before querying.
 */
export const FeaturesInDistance = ({
  coordinates,
  layer,
  distanceMeters,
  onResult
}: {
  coordinates: { lng: number; lat: number } | undefined
  /** Render layer ID(s) to query. */
  layer: string[]
  distanceMeters: number
  onResult: (features: mapboxgl.GeoJSONFeature[]) => void
}) => {
  const { map } = useContext(MapContext)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    if (!map) return
    const lng = coordinates?.lng
    const lat = coordinates?.lat
    if (typeof lng !== 'number' || typeof lat !== 'number') return
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let attempts = 0
    const maxAttempts = 40

    const query = () => {
      const center = map.project([lng, lat])
      const radiusPx = metersToPixels(distanceMeters, lat, map.getZoom())

      const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
        [center.x - radiusPx, center.y - radiusPx],
        [center.x + radiusPx, center.y + radiusPx]
      ]

      const features = map.queryRenderedFeatures(bbox, { layers: layer })
      onResultRef.current(features)
    }

    const hasAllLayers = () => layer.every(layerId => !!map.getLayer(layerId))

    const queryWhenReady = () => {
      if (
        !map.isStyleLoaded() ||
        !hasAllLayers() ||
        map.isMoving() ||
        !map.loaded()
      ) {
        if (attempts >= maxAttempts) return
        attempts += 1
        timeoutId = setTimeout(queryWhenReady, 100)
        return
      }
      query()
    }

    queryWhenReady()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [coordinates?.lng, coordinates?.lat, distanceMeters, map, layer.join('|')])

  return null
}
