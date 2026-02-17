import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const Terrain = ({ exaggeration = 1.5 }: { exaggeration?: number }) => {
  var context = useContext(MapContext)

  useEffect(() => {
    if (!context.map) return

    context.map.on('style.load', () => {
      if (!context.map) return

      if (!context.map.getSource('mapbox-dem')) {
        context.map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        })
      }
      // add the DEM source as a terrain layer with exaggerated height
      context.map.setTerrain({ source: 'mapbox-dem', exaggeration })
    })
  }, [context.map])

  return null
}
