import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const FlyTo = ({
  lat,
  lng,
  zoom,
}: {
  lat: number
  lng: number
  zoom?: number
}) => {
  var context = useContext(MapContext)

  useEffect(() => {
    if (!context.map) return
    context.map.flyTo({
      center: [lng, lat],
      zoom: zoom || context.map.getZoom(),
    })
  }, [lat, lng, context.map])

  return null
}
