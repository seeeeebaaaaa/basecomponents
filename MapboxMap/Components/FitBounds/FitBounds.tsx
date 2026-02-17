import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect, useRef } from 'react'

/** Fits the map to the given bounds. Applies instantly on first render, animates on subsequent changes. */
export const FitBounds = ({
  bounds,
  duration = 500,
  padding = 100
}: {
  bounds: [[number, number], [number, number]]
  duration?: number
  padding?: number | mapboxgl.PaddingOptions
}) => {
  const { map } = useContext(MapContext)
  const isInitialRef = useRef(true)

  useEffect(() => {
    if (!map) return

    const applyBounds = () => {
      map.fitBounds(bounds, {
        padding,
        duration: isInitialRef.current ? 0 : duration
      })
      isInitialRef.current = false
    }

    if (map.loaded()) {
      applyBounds()
    } else {
      map.once('load', applyBounds)
      return () => {
        map.off('load', applyBounds)
      }
    }
  }, [bounds, padding, map])

  return null
}
