import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const Pitch = ({ pitch }: { pitch: number }) => {
  var context = useContext(MapContext)

  useEffect(() => {
    if (!context.map) return
    context.map.setPitch(pitch)
  }, [pitch, context.map])

  return null
}
