import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import mapboxgl from 'mapbox-gl'
import { useContext, useEffect, useRef } from 'react'

/** Adds the standard Mapbox navigation control (zoom + compass). */
export const NavigationControl = ({
  position = 'top-right',
}: {
  position?: CTRLPositions
}) => {
  const context = useContext(MapContext)
  const controlRef = useRef<mapboxgl.NavigationControl | undefined>()

  useEffect(() => {
    if (!context.map || controlRef.current) return

    const nav = new mapboxgl.NavigationControl()
    context.map.addControl(nav, position)
    controlRef.current = nav

    return () => {
      context.map?.removeControl(nav)
      controlRef.current = undefined
    }
  }, [position, context.map])

  return null
}
