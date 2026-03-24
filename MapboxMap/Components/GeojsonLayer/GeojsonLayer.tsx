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
  const context = useContext(MapContext)

  useEffect(() => {
    if (!context.map) return
    const map = context.map

    const addSourceAndLayer = () => {
      if (!map.getSource(id)) {
        map.addSource(id, { type: 'geojson', data: geojson })
      }
      if (!map.getLayer(id)) {
        map.addLayer({ ...layerPropsDefault, ...layerProperties, id, source: id })
      }
    }

    if (map.isStyleLoaded()) {
      addSourceAndLayer()
    }
    map.on('styledata', addSourceAndLayer)

    return () => {
      map.off('styledata', addSourceAndLayer)
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(id)) map.removeSource(id)
    }
  }, [id, geojson, context.map])

  return null
}
