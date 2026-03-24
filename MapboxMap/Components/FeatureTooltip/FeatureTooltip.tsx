import mapboxgl from 'mapbox-gl'
import { useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContext } from 'components/MapboxMap/Mapbox'

/** Displays a tooltip following the cursor when hovering over specified map layers. */
export const FeatureTooltip = ({
  layer,
  content,
  anchor
}: {
  layer: string[]
  content: (e: [string, Record<string, any>][]) => JSX.Element
  anchor?: mapboxgl.Popup['options']['anchor']
}) => {
  const context = useContext(MapContext)
  const { map, isMobile } = context
  const isPinned = useRef(false)
  const skipFlyOnCloseRef = useRef(false)
  const viewToReturnToRef = useRef(context.viewToReturnTo)
  viewToReturnToRef.current = context.viewToReturnTo

  const hoverPlaceholderRef = useRef<HTMLDivElement | null>(null)
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null)
  const [hoverData, setHoverData] = useState<any>(null)

  const pinnedPlaceholderRef = useRef<HTMLDivElement | null>(null)
  const pinnedPopupRef = useRef<mapboxgl.Popup | null>(null)
  const [pinnedData, setPinnedData] = useState<any>(null)

  /** Set up hover popup container. */
  useEffect(() => {
    if (!map || hoverPopupRef.current) return

    const placeholder = document.createElement('div')
    hoverPlaceholderRef.current = placeholder

    const pop = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor,
      className: 'hover-popup'
    })
      .setDOMContent(placeholder)
      .addTo(map)
    hoverPopupRef.current = pop

    return () => {
      pop.remove()
      hoverPopupRef.current = null
      hoverPlaceholderRef.current = null
      pinnedPopupRef.current?.remove()
      pinnedPopupRef.current = null
      pinnedPlaceholderRef.current = null
    }
  }, [map])

  /** Bind mouse and zoom event handlers for tooltip interaction. */
  useEffect(() => {
    if (!map || !hoverPopupRef.current) return
    const currentMap = map
    const popup = hoverPopupRef.current

    const handlers: {
      layer: string
      move: (e: any) => void
      leave: () => void
    }[] = []

    layer.forEach(l => {
      const handleMouseMove = (
        e: mapboxgl.MapMouseEvent & { features?: mapboxgl.GeoJSONFeature[] }
      ) => {
        if (isPinned.current) return
        currentMap.getCanvas().style.cursor = 'crosshair'
        const features = e.features
        if (!features) return
        const featuresCleaned = features.map((f: any) => [
          f.layer.id,
          f.properties
        ])
        setHoverData(featuresCleaned)
        popup.setLngLat(e.lngLat)
      }

      const handleMouseLeave = () => {
        if (isPinned.current) return
        currentMap.getCanvas().style.cursor = ''
        setHoverData(null)
        popup.setLngLat([0, 0])
      }
      if (!isMobile) {
        currentMap.on('mousemove', l, handleMouseMove)
        currentMap.on('mouseleave', l, handleMouseLeave)
      }
      handlers.push({
        layer: l,
        move: handleMouseMove,
        leave: handleMouseLeave
      })
    })

    /** Pins a separate tooltip with close button after ZoomToFeature zoom. */
    const handleShowFromZoom = (e: any) => {
      isPinned.current = true
      setHoverData(null)
      popup.setLngLat([0, 0])

      skipFlyOnCloseRef.current = true
      pinnedPopupRef.current?.remove()
      pinnedPlaceholderRef.current = null

      const placeholder = document.createElement('div')
      pinnedPlaceholderRef.current = placeholder

      const pinnedPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        anchor
      })
        .setDOMContent(placeholder)
        .setLngLat(e.lngLat)
        .addTo(currentMap)

      setPinnedData(e.featureData)

      pinnedPopup.on('close', () => {
        isPinned.current = false
        setPinnedData(null)
        pinnedPopupRef.current = null
        pinnedPlaceholderRef.current = null

        if (skipFlyOnCloseRef.current) {
          skipFlyOnCloseRef.current = false
          return
        }
        if (viewToReturnToRef.current) {
          currentMap.flyTo(viewToReturnToRef.current)
        }
      })

      pinnedPopupRef.current = pinnedPopup
    }

    currentMap.on('featuretooltip:show', handleShowFromZoom)

    return () => {
      handlers.forEach(({ layer: l, move, leave }) => {
        currentMap.off('mousemove', l, move)
        currentMap.off('mouseleave', l, leave)
      })
      currentMap.off('featuretooltip:show', handleShowFromZoom)
    }
  }, [layer, map])

  return (
    <>
      {hoverPlaceholderRef.current &&
        hoverData &&
        createPortal(content(hoverData), hoverPlaceholderRef.current)}
      {pinnedPlaceholderRef.current &&
        pinnedData &&
        createPortal(content(pinnedData), pinnedPlaceholderRef.current)}
    </>
  )
}
