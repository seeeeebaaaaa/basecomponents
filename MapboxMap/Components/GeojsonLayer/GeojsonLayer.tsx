import { MapContext } from 'components/MapboxMap/Mapbox'
import { FeatureCollection } from 'geojson'
import { useContext, useEffect } from 'react'

const layerPropsDefault = {
  type: 'fill',
  paint: {
    'fill-color': '#69AACD',
  },
}

export const GeojsonLayer = ({
  geojson,
  id,
  layerProperties = layerPropsDefault,
}: {
  geojson: FeatureCollection
  id: string
  layerProperties?: any
}) => {
  var context = useContext(MapContext)

  useEffect(() => {
    if (!context.map) return
    context.map.on('styledata', function () {
      if (!context.map) return

      if (!context.map.getSource(id)) {
        context.map.addSource(id, {
          type: 'geojson',
          data: geojson,
        })
      }
      if (!context.map.getLayer(id)) {
        context.map.addLayer({
          ...{ ...layerPropsDefault, ...layerProperties },
          id,
          source: id,
        })
      }
    })
  }, [geojson, context.map])

  return null
}
