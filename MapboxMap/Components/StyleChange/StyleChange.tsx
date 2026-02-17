import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const StyleChange = ({
  layer,
  properties,
}: {
  layer: string
  properties: {
    layout?: {
      name: string
      value: any
    }[]
    paint?: {
      name: string
      value: any
    }[]
  }
}) => {
  var context = useContext(MapContext)
  var p = properties.paint
  var l = properties.layout
  useEffect(() => {
    if (!context.map) return
    if (l) {
      if (!context.map) return
      var map = context.map
      if (map.getLayer(layer)) {
        l?.forEach((prop) => {
          map.setLayoutProperty(layer, prop.name as any, prop.value)
        })
      }

      map.once('idle', () => {
        l?.forEach((prop) => {
          if(!prop) return
          map.setLayoutProperty(layer, prop.name as any, prop.value)
        })
      })
    }

    if (p) {
      if (!context.map) return
      var map = context.map
      if (map.getLayer(layer)) {
        p?.forEach((prop) => {
          map.setPaintProperty(layer, prop.name as any, prop.value)
        })
      }
      map.once('idle', () => {
        p?.forEach((prop) => {
          map.setPaintProperty(layer, prop.name as any, prop.value)
        })
      })
    }
  }, [properties.layout, properties.paint, context.map])
  return null
}
