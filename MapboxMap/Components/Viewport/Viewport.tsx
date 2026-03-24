import { Center } from '../Center'
import { Zoom } from '../Zoom'
import { MaxBounds } from '../MaxBounds'
import { Pitch } from '../Pitch'
import { FitBounds } from '../FitBounds'
import mapboxgl from 'mapbox-gl'

/** Composite component that sets up the map viewport (center, zoom, bounds, pitch). */
export const View = ({
  center,
  zoom,
  maxBounds,
  bounds,
  padding,
  pitch,
  minZoom,
}: {
  center?: { lat: number; lng: number }
  zoom?: number
  minZoom?: number
  maxBounds?:
    | {
        desktop?: [[number, number], [number, number]]
        mobile?: [[number, number], [number, number]]
      }
    | [[number, number], [number, number]]
  bounds?: [[number, number], [number, number]]
  padding?: number | mapboxgl.PaddingOptions
  pitch?: number
}) => {
  let maxBoundsDesktop
  let maxBoundsMobile
  if (maxBounds) {
    maxBoundsDesktop = Array.isArray(maxBounds) ? maxBounds : maxBounds?.desktop
    maxBoundsMobile = Array.isArray(maxBounds) ? maxBounds : maxBounds?.mobile
  }

  return (
    <>
      {bounds && <FitBounds bounds={bounds} padding={padding} />}

      {center && <Center lng={center.lng} lat={center.lat} />}

      {zoom && <Zoom zoom={zoom} minZoom={minZoom} />}

      {maxBoundsDesktop && maxBoundsMobile && (
        <MaxBounds
          boundsDesktop={maxBoundsDesktop}
          boundsMobile={maxBoundsMobile}
        />
      )}

      {pitch && <Pitch pitch={pitch} />}
    </>
  )
}
