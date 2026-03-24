import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import { ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders arbitrary React children into one of Mapbox's built-in control
 * containers (top-left, top-right, bottom-left, bottom-right) via a portal.
 * Unlike CustomControl, children stay in the parent React tree and retain
 * full access to context, state, and event handlers.
 */
export const MapControl = ({
  position = 'top-left',
  children
}: {
  position?: CTRLPositions
  children: ReactNode
}) => {
  const { map } = useContext(MapContext)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [targetContainer, setTargetContainer] = useState<HTMLElement | null>(
    null
  )

  useEffect(() => {
    if (!map) return

    const container = map
      .getContainer()
      .querySelector<HTMLElement>(`.mapboxgl-ctrl-${position}`)
    if (!container) return

    const wrapper = document.createElement('div')
    wrapper.className = 'mapboxgl-ctrl map-control-portal'
    wrapper.style.backfaceVisibility = 'hidden'
    wrapper.style.setProperty('-webkit-font-smoothing', 'antialiased')
    wrapper.style.transform = 'translateZ(0)'
    container.prepend(wrapper)
    wrapperRef.current = wrapper

    setTargetContainer(wrapper)

    return () => {
      wrapper.remove()
      wrapperRef.current = null
      setTargetContainer(null)
    }
  }, [map, position])

  if (!targetContainer) return null
  return createPortal(children, targetContainer)
}
