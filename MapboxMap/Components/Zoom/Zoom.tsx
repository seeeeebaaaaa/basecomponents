import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const Zoom = ({ zoom, minZoom }: { zoom: number; minZoom?: number }) => {
  var context = useContext(MapContext)

  useEffect(() => {
    if (!context.map) return
    if (minZoom) context.map.setMinZoom(minZoom)
    context.map.zoomTo(zoom, { duration: context.zoomDuration })
  }, [zoom, context.map])

  return null
}
