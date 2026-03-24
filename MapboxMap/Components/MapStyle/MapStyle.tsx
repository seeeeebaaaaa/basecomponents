import { MapContext } from 'components/MapboxMap/Mapbox'
import { MapStyleProps } from '../../Types/mapboxtypes'
import { useContext, useEffect } from 'react'

export const MapStyle = (props: MapStyleProps) => {
  const context = useContext(MapContext)
  const { light, dark, lightDe, darkDe, lightFr, darkFr, colorMode, lang } = props

  useEffect(() => {
    if (!context.map) return
    const lightStyle = ((lang === 'de' ? lightDe : lightFr) || light) as string
    const darkStyle = ((lang === 'de' ? darkDe : darkFr) ||
      dark ||
      light) as string

    context.map.setStyle(colorMode === 'light' ? lightStyle : darkStyle)
  }, [
    light,
    dark,
    lightDe,
    darkDe,
    lightFr,
    darkFr,
    colorMode,
    lang,
    context.map
  ])

  return null
}
