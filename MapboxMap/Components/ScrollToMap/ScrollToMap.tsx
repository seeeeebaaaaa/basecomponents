import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'

export const ScrollToMap = () => {
  var { scrollTarget } = useContext(MapContext)

  useEffect(() => {
    if (scrollTarget) {
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })
    }
  }, [])

  return null
}
