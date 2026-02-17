import mapboxgl from 'mapbox-gl'
import styled from 'styled-components'
import { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { MapContext } from 'components/MapboxMap/Mapbox'
import { createRoot, Root } from 'react-dom/client'

/** Displays a tooltip following the cursor when hovering over specified map layers. */
export const FeatureTooltip = ({
  layer,
  content,
}: {
  layer: string[]
  content: (e: any) => JSX.Element
}) => {
  const [popup, setPopup] = useState<mapboxgl.Popup | undefined>()
  const context = useContext(MapContext)
  const { map } = context
  const rootRef = useRef<Root | undefined>()
  const placeholderRef = useRef<HTMLDivElement | undefined>()

  useEffect(() => {
    if (!context.map || popup) return

    const placeholder = document.createElement('div')
    placeholder.className = 'featuretooltip-placeholder'
    placeholderRef.current = placeholder

    const root = createRoot(placeholder)
    rootRef.current = root
    root.render(<></>)

    const pop = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    })
      .setDOMContent(placeholder)
      .addTo(context.map)
    setPopup(pop)

    return () => {
      root.unmount()
      pop.remove()
    }
  }, [context.map])

  useEffect(() => {
    if (!context.map || !popup) return
    const currentMap = context.map

    const handlers: { layer: string; move: (e: any) => void; leave: () => void }[] = []

    layer.forEach((l) => {
      const handleMouseMove = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.GeoJSONFeature[] }) => {
        currentMap.getCanvas().style.cursor = 'crosshair'
        const features = e.features
        if (!features) return
        const featuresCleaned = features.map((f: any) => [f.layer.id, f.properties])
        // Re-render the tooltip content into the existing root
        rootRef.current?.render(content(featuresCleaned))
        popup.setLngLat(e.lngLat)
      }

      const handleMouseLeave = () => {
        currentMap.getCanvas().style.cursor = ''
        rootRef.current?.render(<></>)
        popup.setLngLat([0, 0])
      }

      currentMap.on('mousemove', l, handleMouseMove)
      currentMap.on('mouseleave', l, handleMouseLeave)
      handlers.push({ layer: l, move: handleMouseMove, leave: handleMouseLeave })
    })

    return () => {
      handlers.forEach(({ layer: l, move, leave }) => {
        currentMap.off('mousemove', l, move)
        currentMap.off('mouseleave', l, leave)
      })
    }
  }, [layer, map, popup])

  return (
    <HiddenStyledComponentForceCSSInjection>
      {content([])}
    </HiddenStyledComponentForceCSSInjection>
  )
}

const HiddenStyledComponentForceCSSInjection = styled.div`
  display: none;
  pointer-events: none;
`
