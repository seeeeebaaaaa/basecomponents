import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const Center = ({ lat, lng }: { lat: number; lng: number }) => {
  var context = useContext(MapContext)

  useEffect(() => {
    if (!context.map) return
    context.map.setCenter([lng, lat])

    context.map.on('styledata', function () {
      if (!context.map) return

    })
  }, [lat, lng, context.map])

  return null
}
