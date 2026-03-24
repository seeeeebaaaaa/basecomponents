import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

/**
 * Declaratively sets the camera view the map returns to when interaction is deactivated.
 * Accepts either bounds (resolved via cameraForBounds) or explicit center/zoom.
 */
export const ViewToReturnTo = ({
  bounds,
  padding = 100,
  center,
  zoom,
  bearing = 0,
  pitch = 0
}: {
  bounds?: [[number, number], [number, number]]
  padding?: number | mapboxgl.PaddingOptions
  center?: { lng: number; lat: number }
  zoom?: number
  bearing?: number
  pitch?: number
}) => {
  const { map, setViewToReturnTo } = useContext(MapContext)

  useEffect(() => {
    if (!map || !setViewToReturnTo) return

    const apply = () => {
      if (bounds) {
        const camera = map.cameraForBounds(bounds, { bearing, pitch, padding })
        if (camera) setViewToReturnTo(camera)
        return
      }
      if (center && zoom != null) {
        setViewToReturnTo({ center, zoom, bearing, pitch })
      }
    }

    if (map.loaded()) {
      apply()
    } else {
      map.once('load', apply)
      return () => { map.off('load', apply) }
    }
  }, [
    map,
    bounds?.[0]?.[0], bounds?.[0]?.[1], bounds?.[1]?.[0], bounds?.[1]?.[1],
    padding,
    center?.lng, center?.lat,
    zoom, bearing, pitch
  ])

  return null
}
