import mapboxgl from 'mapbox-gl'
import { useContext, useEffect } from 'react'
import { MapContext } from 'components/MapboxMap/Mapbox'

/**
 * Queries source features by matching a property against a list of values,
 * or by a raw Mapbox filter expression for more complex cases.
 *
 * Uses querySourceFeatures — features do not need to be rendered, only in
 * loaded tiles. Pair with <FlyTo> to ensure the relevant tiles are loaded.
 *
 * Simple usage (property + values):
 *   <FeaturesByProperty sourceId='grid' sourceLayer='cells' property='id' values={['a','b']} onResult={...} />
 *
 * Advanced usage (raw filter):
 *   <FeaturesByProperty sourceId='grid' sourceLayer='cells' filter={['>', ['get', 'value'], 100]} onResult={...} />
 */
export const FeaturesByProperty = ({
  sourceId,
  sourceLayer,
  property,
  values,
  filter,
  onResult
}: {
  sourceId: string
  sourceLayer?: string
  onResult: (features: mapboxgl.GeoJSONFeature[]) => void
} & (
  | { property: string; values: (string | number)[]; filter?: never }
  | { filter: mapboxgl.FilterSpecification; property?: never; values?: never }
)) => {
  const { map } = useContext(MapContext)

  useEffect(() => {
    if (!map) return

    const resolvedFilter: mapboxgl.FilterSpecification = filter
      ?? ['in', ['get', property], ['literal', values]]

    const query = () => {
      const features = map.querySourceFeatures(sourceId, {
        sourceLayer,
        filter: resolvedFilter
      })
      onResult(features)
    }

    if (map.isStyleLoaded()) {
      query()
    } else {
      map.once('styledata', query)
      return () => { map.off('styledata', query) }
    }
  }, [sourceId, sourceLayer, property, values, filter, map])

  return null
}
