import mapboxgl from 'mapbox-gl'
import { useContext, useEffect } from 'react'
import { MapContext } from 'components/MapboxMap/Mapbox'
import { useMFContext } from 'components/MFHelpers'

/** Zooms to a feature's location on click for the specified map layers. */
export const ZoomToFeature = ({
  layer,
  zoom = 15,
  speed = 1.2,
  topPaddingRatio = 0,
  onFeatureClick,
}: {
  layer: string[]
  zoom?: number
  speed?: number
  /** Fraction of container height (-1 to 1). Negative = point moves up, positive = point moves down. */
  topPaddingRatio?: number
  onFeatureClick?: (feature: [string, Record<string, any>], lngLat: mapboxgl.LngLat) => void
}) => {
  const { map } = useContext(MapContext)
  useEffect(() => {
    if (!map) return

    const handlers: { layer: string; handler: (e: any) => void }[] = []

    layer.forEach((l) => {
      const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.GeoJSONFeature[] }) => {
        const features = e.features
        if (!features?.length) return

        const f = features[0]
        const cleaned: [string, Record<string, any>] = [f.layer?.id ?? '', f.properties ?? {}]
        const geom = f.geometry
        const lngLat = geom.type === 'Point'
          ? new mapboxgl.LngLat(geom.coordinates[0], geom.coordinates[1])
          : e.lngLat

        const offset = topPaddingRatio !== 0
          ? map.getContainer().clientHeight * Math.abs(topPaddingRatio)
          : 0
        const padding = topPaddingRatio < 0
          ? { top: 0, bottom: offset, left: 0, right: 0 }
          : { top: offset, bottom: 0, left: 0, right: 0 }
        map.flyTo({
          center: lngLat,
          zoom,
          speed,
          ...(offset > 0 && { padding })
        })
        map.once('moveend', () => {
          map.fire('featuretooltip:show', { featureData: [cleaned], lngLat })
        })

        onFeatureClick?.(cleaned, lngLat)
      }

    
        map.on('click', l, handleClick)
    
      handlers.push({ layer: l, handler: handleClick })
    })

    return () => {
      handlers.forEach(({ layer: l, handler }) => {
        map.off('click', l, handler)
      })
    }
  }, [layer, map, zoom, speed, topPaddingRatio, onFeatureClick])

  return null
}
