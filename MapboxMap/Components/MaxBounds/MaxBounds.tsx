import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const MaxBounds = ({
  boundsDesktop,
  boundsMobile,
}: {
  boundsDesktop: [[number, number], [number, number]]
  boundsMobile: [[number, number], [number, number]]
}) => {
  var context = useContext(MapContext)
  var { isMobile } = context
  useEffect(() => {
    if (!context.map) return
    context.map.setMaxBounds(isMobile ? boundsMobile : boundsDesktop)
  }, [boundsDesktop, boundsMobile, context.map])

  return null
}
