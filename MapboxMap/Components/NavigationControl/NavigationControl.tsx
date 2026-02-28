import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import mapboxgl from 'mapbox-gl'
import { useContext, useEffect, useRef } from 'react'

/** Adds the standard Mapbox navigation control (zoom + compass) with an optional home button. */
export const NavigationControl = ({
  position = 'top-right',
  showWhenActivated = false,
  showHome = false,
  homeIcon,
}: {
  position?: CTRLPositions
  showWhenActivated?: boolean
  showHome?: boolean
  homeIcon?: string
}) => {
  const { map, isInteractive, disabledFeatures, viewToReturnTo } = useContext(MapContext)
  const controlRef = useRef<mapboxgl.NavigationControl | undefined>()
  const homeControlRef = useRef<HomeControl | undefined>()
  const viewRef = useRef(viewToReturnTo)
  viewRef.current = viewToReturnTo

  const shouldShow = !showWhenActivated || !!isInteractive
  const showCompass = !disabledFeatures?.includes('rotation')

  useEffect(() => {
    if (!map) return

    if (shouldShow && !controlRef.current) {
      const nav = new mapboxgl.NavigationControl({ showCompass })
      map.addControl(nav, position)
      controlRef.current = nav

      if (showHome && !homeControlRef.current) {
        const home = new HomeControl(() => {
          if (viewRef.current) map.flyTo(viewRef.current)
        }, homeIcon)
        map.addControl(home, position)
        homeControlRef.current = home
      }
    }

    if (!shouldShow && controlRef.current) {
      map.removeControl(controlRef.current)
      controlRef.current = undefined
      if (homeControlRef.current) {
        map.removeControl(homeControlRef.current)
        homeControlRef.current = undefined
      }
    }

    return () => {
      if (controlRef.current && map) {
        map.removeControl(controlRef.current)
        controlRef.current = undefined
      }
      if (homeControlRef.current && map) {
        map.removeControl(homeControlRef.current)
        homeControlRef.current = undefined
      }
    }
  }, [position, map, shouldShow])

  return null
}

/** Custom IControl that renders a home button matching the Mapbox control style. */
class HomeControl implements mapboxgl.IControl {
  private container: HTMLElement | undefined
  private onClick: () => void
  private icon: string | undefined

  constructor(onClick: () => void, icon?: string) {
    this.onClick = onClick
    this.icon = icon
  }

  onAdd() {
    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'

    const button = document.createElement('button')
    button.className = 'mapboxgl-ctrl-home'
    button.type = 'button'
    button.title = 'Reset view'
    button.setAttribute('aria-label', 'Reset view')
    button.addEventListener('click', this.onClick)

    if (this.icon) {
      button.innerHTML = `<img src="${this.icon}" style="width:20px;height:20px;padding-top:4px;" />`
    } else {
      button.innerHTML = `<svg viewBox="0 0 19 19" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10L10 3l7 7M5 8.5V16h3.5v-4h3v4H15V8.5"/></svg>`
    }

    this.container.appendChild(button)
    return this.container
  }

  onRemove() {
    this.container?.parentNode?.removeChild(this.container)
    this.container = undefined
  }
}
