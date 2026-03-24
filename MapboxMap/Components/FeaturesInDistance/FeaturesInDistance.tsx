import mapboxgl from 'mapbox-gl'
import { useContext, useEffect } from 'react'
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

  useEffect(() => {
    if (!map || !coordinates) return

    const query = () => {
      const center = map.project([coordinates.lng, coordinates.lat])
      const radiusPx = metersToPixels(distanceMeters, coordinates.lat, map.getZoom())

      const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
        [center.x - radiusPx, center.y - radiusPx],
        [center.x + radiusPx, center.y + radiusPx]
      ]

      const features = map.queryRenderedFeatures(bbox, { layers: layer })
      onResult(features)
    }

    if (map.loaded()) {
      query()
    } else {
      map.once('idle', query)
      return () => { map.off('idle', query) }
    }
  }, [coordinates, distanceMeters, layer, map])

  return null
}
