import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import mapboxgl from 'mapbox-gl'
import { useContext, useEffect, useRef } from 'react'

/** Adds the standard Mapbox navigation control (zoom + compass). */
export const NavigationControl = ({
  position = 'top-right',
  showWhenActivated = false,
}: {
  position?: CTRLPositions
  /** When true, the control is only shown while the map is interactive. */
  showWhenActivated?: boolean
}) => {
  const { map, isInteractive, disabledFeatures } = useContext(MapContext)
  const controlRef = useRef<mapboxgl.NavigationControl | undefined>()

  const shouldShow = !showWhenActivated || !!isInteractive
  const showCompass = !disabledFeatures?.includes('rotation')

  useEffect(() => {
    if (!map) return

    if (shouldShow && !controlRef.current) {
      const nav = new mapboxgl.NavigationControl({ showCompass })
      map.addControl(nav, position)
      controlRef.current = nav
    }

    if (!shouldShow && controlRef.current) {
      map.removeControl(controlRef.current)
      controlRef.current = undefined
    }

    return () => {
      if (controlRef.current && map) {
        map.removeControl(controlRef.current)
        controlRef.current = undefined
      }
    }
  }, [position, map, shouldShow])

  return null
}
