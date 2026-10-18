import React from 'react'
import {
  AnnotatedContent,
  type AnnotatedContentProps,
  type Annotation
} from 'components/AnnotatedContent'

const TILE_SIZE = 256

export type LngLat = [number, number]

/**
 * Geographic extent of the map image as [[west, south], [east, north]].
 * Must not cross the antimeridian.
 */
export type GeoBounds = [LngLat, LngLat]

/** An AnnotatedContent annotation positioned by lon/lat instead of percent. */
type WithLngLat<T> = T extends unknown ? Omit<T, 'pos'> & { pos: LngLat } : never
export type GeoAnnotation = WithLngLat<Annotation>

export type AnnotatedMapProps = Omit<AnnotatedContentProps, 'annotations'> & {
  annotations: Array<GeoAnnotation>
  /** Extent of the map image. Takes precedence over center/zoom/size. */
  bounds?: GeoBounds
  /** Center the image was rendered at, as an alternative to bounds. */
  center?: LngLat
  /** Zoom the image was rendered at. Needed with center and size. */
  zoom?: number
  /** Pixel size the image was rendered at, as [width, height]. */
  size?: [number, number]
}

/**
 * Annotates a static Web Mercator map image by geographic coordinates.
 * Coordinates are projected to percentages and handed to AnnotatedContent, so
 * annotations stay in place at any container size and every annotation type,
 * style prop and dev tool of AnnotatedContent keeps working.
 */
export const AnnotatedMap = ({
  annotations,
  bounds,
  center,
  zoom,
  size,
  ...contentProps
}: AnnotatedMapProps) => {
  const mapBounds = resolveBounds(bounds, center, zoom, size)

  if (!mapBounds) {
    console.error(
      '[AnnotatedMap] Needs either `bounds` or all of `center`, `zoom` and `size`.'
    )
    return <AnnotatedContent {...contentProps} annotations={[]} />
  }

  // Coordinates outside the image end up outside 0–100% and are dropped by
  // AnnotatedContent's own validation.
  const projected = annotations.map(
    annotation =>
      ({ ...annotation, pos: geoToPercent(annotation.pos, mapBounds) } as Annotation)
  )

  return <AnnotatedContent {...contentProps} annotations={projected} />
}

/** Picks the explicit extent, or derives one from center/zoom/size. */
function resolveBounds (
  bounds?: GeoBounds,
  center?: LngLat,
  zoom?: number,
  size?: [number, number]
) {
  if (bounds) return bounds
  if (!center || zoom == null || !size) return null
  return boundsFromCenterZoom(center, zoom, size)
}

/**
 * Projects a lon/lat to a percentage position inside a Web Mercator map image.
 * Longitude is linear across the image, latitude only in Mercator space.
 */
export function geoToPercent ([lng, lat]: LngLat, bounds: GeoBounds) {
  const [[west, south], [east, north]] = bounds
  const [left, right] = [lngToWorldX(west), lngToWorldX(east)]
  const [top, bottom] = [latToWorldY(north), latToWorldY(south)]
  return {
    x: ((lngToWorldX(lng) - left) / (right - left)) * 100,
    y: ((latToWorldY(lat) - top) / (bottom - top)) * 100
  }
}

/**
 * Derives the extent of a static map image from the center, zoom and pixel size
 * it was rendered at — the convention of the Mapbox Static Images API.
 * Only valid for images rendered without bearing or pitch.
 */
export function boundsFromCenterZoom (
  center: LngLat,
  zoom: number,
  [width, height]: [number, number]
): GeoBounds {
  const worldSize = TILE_SIZE * 2 ** zoom
  const [x, y] = [lngToWorldX(center[0]), latToWorldY(center[1])]
  const [halfWidth, halfHeight] = [
    width / (2 * worldSize),
    height / (2 * worldSize)
  ]
  return [
    [worldXToLng(x - halfWidth), worldYToLat(y + halfHeight)],
    [worldXToLng(x + halfWidth), worldYToLat(y - halfHeight)]
  ]
}

/** Longitude to normalized [0, 1] world x. */
export const lngToWorldX = (lng: number) => (lng + 180) / 360

/** Latitude to normalized [0, 1] world y, top-down. */
export const latToWorldY = (lat: number) =>
  0.5 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI)

/** Inverse of lngToWorldX. */
const worldXToLng = (x: number) => x * 360 - 180

/** Inverse of latToWorldY. */
const worldYToLat = (y: number) =>
  (Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) * 360) / Math.PI - 90

export default AnnotatedMap
