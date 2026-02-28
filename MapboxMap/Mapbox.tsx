import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import styled from 'styled-components'

import {
  DefaultsType,
  DisabledFeature,
  MapContextType
} from './Types/mapboxtypes'
import { Help } from './Components/Help'
import { useWindowSize } from 'usehooks-ts'
import smoothscroll from 'smoothscroll-polyfill'

// kick off the polyfill!
smoothscroll.polyfill()

mapboxgl.accessToken =
  'pk.eyJ1IjoidGEtaW50ZXJha3RpdiIsImEiOiJjaXNhNGFsdHAwMDB2Mm9wNWdlMTlqMTNuIn0.uj5aGvF3yvEM4V6kNdlbVg'

const MapboxDefaults = {
  pointerColor: 'var(--site-background)'
}

/** Updates a default value in the MapboxDefaults config. */
function changeDefault (prop: keyof DefaultsType, value: any) {
  MapboxDefaults[prop] = value
}

export const MapContext = createContext<MapContextType>({} as MapContextType)

/** Main Mapbox map wrapper providing context to child components. */
export const MapboxMap = ({
  children,
  colorMode = 'light',
  lang = 'de',
  scrollTarget,
  getMap,
  initialView,
  height: heightProp,
  disabledFeatures = []
}: {
  children?: ReactNode
  colorMode?: 'dark' | 'light' | undefined
  lang?: 'de' | 'fr' | undefined
  scrollTarget?: HTMLDivElement | null
  getMap?: (e: mapboxgl.Map) => void
  initialView?: {
    bounds?: [[number, number], [number, number]]
    center?: { lng: number; lat: number }
    zoom?: number
    bearing?: number
    pitch?: number
  }
  height?: number | string
  disabledFeatures?: DisabledFeature[]
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | undefined>()
  const [mapReady, setMapReady] = useState(false)

  const [terrainActive, setTerrainActive] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [cooperativeGestures, setCooperativeGestures] = useState(false)
  const [helpVisible, setShowHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const windowSize = useWindowSize()
  const [height, setHeight] = useState<number>(windowSize.height)
  const [viewToReturnTo, setViewToReturnTo] = useState<
    mapboxgl.CameraOptions | undefined
  >()
  const [currentContext, setCurrentContext] = useState<MapContextType>({})

  useEffect(() => {
    map.current?.resize()
  }, [height])

  useEffect(() => {
    setIsMobile(window.innerWidth < 712)
    setHeight(windowSize.height)
  }, [windowSize.width])

  useEffect(() => {
    setHeight(windowSize.height)
  }, [])

  /** Activates 3D terrain view with a fly-to animation. */
  function activateTerrain () {
    if (map.current) {
      map.current.flyTo({
        center: map.current.getCenter(),
        zoom: 11.5,
        bearing: map.current.getBearing(),
        pitch: 60
      })
    }
    activateInteraction()
    setTerrainActive(true)
  }

  /** Deactivates terrain and returns to the saved camera position. */
  function deactivateTerrain () {
    if (map.current && viewToReturnTo) {
      map.current.flyTo({
        center: viewToReturnTo.center,
        zoom: viewToReturnTo.zoom,
        bearing: 0,
        pitch: 0
      })
    }
    setTerrainActive(false)
  }

  /** Enables scroll zoom and drag pan, scrolls to map target. Respects disabledFeatures. */
  function activateInteraction () {
    if (map.current) {
      // Save current view before enabling interaction so we can return to it
      setViewToReturnTo({
        center: map.current.getCenter(),
        zoom: map.current.getZoom(),
        bearing: map.current.getBearing(),
        pitch: map.current.getPitch()
      })
      map.current.scrollZoom.enable()
      map.current.dragPan.enable()

      if (disabledFeatures.includes('rotation')) {
        map.current.dragRotate.disable()
        map.current.touchZoomRotate.disableRotation()
        map.current.touchPitch.disable()
      }
    }
    if (scrollTarget) {
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
    setIsInteractive(true)
  }

  /** Disables interaction and returns to the saved camera view. */
  function deactivateInteraction () {
    if (map.current) {
      map.current.scrollZoom.disable()
      map.current.dragPan.disable()
      if (viewToReturnTo) {
        map.current.flyTo({
          center: viewToReturnTo.center,
          zoom: viewToReturnTo.zoom,
          bearing: viewToReturnTo.bearing ?? 0,
          pitch: viewToReturnTo.pitch ?? 0
        })
      }
    }
    deactivateTerrain()
    setIsInteractive(false)
  }

  /** Handles perspective and interaction property changes. Respects disabledFeatures. */
  function handlePropChange (prop: string, value: any) {
    if (prop === 'perspective') {
      if (disabledFeatures.includes('perspective')) return
      if (value) {
        activateTerrain()
      } else {
        deactivateTerrain()
      }
    }
    if (prop === 'interaction') {
      if (value) {
        activateInteraction()
      } else {
        deactivateInteraction()
      }
    }
  }

  function handleHelpChange (e: boolean) {
    setShowHelp(e)
  }

  /** Enables or disables cooperative gestures on the map. */
  const handleSetCooperativeGestures = useCallback((enabled: boolean) => {
    if (!map.current) return
    map.current.setCooperativeGestures(enabled)
    if (enabled) {
      map.current.scrollZoom.enable()
      map.current.dragPan.enable()
    } else {
      map.current.scrollZoom.disable()
      map.current.dragPan.disable()
    }
    setCooperativeGestures(enabled)
  }, [])

  // Initialize the map once
  useEffect(() => {
    if (map.current) return
    if (!mapContainer.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      bounds: initialView?.bounds,
      center: initialView?.center,
      zoom: initialView?.zoom,
      bearing: initialView?.bearing,
      pitch: initialView?.pitch,
      locale:
        lang === 'de'
          ? {
              'ScrollZoomBlocker.CtrlMessage':
                'Strg + Scrollen zum Zoomen der Karte',
              'ScrollZoomBlocker.CmdMessage':
                '\u2318 + Scrollen zum Zoomen der Karte',
              'TouchPanBlocker.Message': 'Karte mit zwei Fingern bewegen'
            }
          : lang === 'fr'
          ? {
              'ScrollZoomBlocker.CtrlMessage':
                'Ctrl + défilement pour zoomer la carte',
              'ScrollZoomBlocker.CmdMessage':
                '\u2318 + défilement pour zoomer la carte',
              'TouchPanBlocker.Message':
                'Utilisez deux doigts pour déplacer la carte'
            }
          : undefined
    })
    map.current.scrollZoom.disable()
    map.current.dragPan.disable()
    map.current.once('idle', () => {
      if (!map.current) return
      setViewToReturnTo({
        center: map.current.getCenter(),
        zoom: map.current.getZoom(),
        bearing: map.current.getBearing(),
        pitch: map.current.getPitch()
      })
    })

    map.current.on('moveend', () => {
      if (!map.current) return
      console.log('bounds', map.current.getBounds()?.toArray().join(', '))
      console.log('center', map.current.getCenter())
      console.log('zoom', map.current.getZoom())
      console.log('bearing', map.current.getBearing())
      console.log('pitch', map.current.getPitch())
    })

    map.current.once('load', () => {
      map.current?.resize()
    })
    setMapReady(true)
    getMap?.(map.current)
  }, [])

  useEffect(() => {
    setCurrentContext(prev => ({ ...prev, scrollTarget }))
  }, [scrollTarget])

  useEffect(() => {
    setCurrentContext({
      map: map.current,
      isMobile,
      zoomDuration: 500,
      colorMode,
      scrollTarget,
      handlePropChange,
      setShowHelp: handleHelpChange,
      setViewToReturnTo: (e: mapboxgl.CameraOptions) => setViewToReturnTo(e),
      viewToReturnTo,
      helpVisible,
      terrainActive,
      isInteractive,
      changeDefault,
      disabledFeatures,
      cooperativeGestures,
      setCooperativeGestures: handleSetCooperativeGestures
    })
  }, [
    helpVisible,
    isInteractive,
    terrainActive,
    viewToReturnTo,
    isMobile,
    mapReady,
    cooperativeGestures
  ])

  const mapHeight =
    heightProp != null
      ? typeof heightProp === 'number'
        ? `${heightProp}px`
        : heightProp
      : '100%'

  return (
    <MapContext.Provider value={currentContext}>
      <MapWrapper style={{ maxWidth: '100vw' }}>
        <FullScreenContainer
          className='fullscreen-container'
          style={{ height: mapHeight }}
        >
          <MapContainer
            className='map-container'
            $pointerColor={MapboxDefaults.pointerColor}
            $isInteractive={isInteractive}
            ref={mapContainer}
          />
          <Help visible={helpVisible} />
        </FullScreenContainer>
        {children}
      </MapWrapper>
    </MapContext.Provider>
  )
}

const MapWrapper = styled.div`
  position: relative;
`
const FullScreenContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`
const MapContainer = styled.div<{
  $pointerColor: string | undefined
  $isInteractive: boolean
}>`
  position: relative;
  width: 100%;
  height: 100%;
  @media screen and (max-width: 768px) {
    .mapboxgl-ctrl-bottom-left {
      bottom: 0px;
      overflow: visible;
    }
    .mapboxgl-ctrl-bottom-right {
      right: -15px;
      bottom: -3px;

      overflow: visible;
    }
    .mapboxgl-ctrl-attrib-inner {
      padding-top: 5px;
    }
  }
  .mapboxgl-popup {
    background-color:transparent;
    max-width: unset !important;
    @media screen and (max-width: 768px) {
      max-width: 330px !important;
    }
  }
  .mapboxgl-popup-close-button {
    font-size: 40px;
    margin-top: 4px;
    margin-right: 8px;
  }
  // ANNOTATION POPUP POINTER
  .mapboxgl-popup-anchor-top .mapboxgl-popup-tip,
  .mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip,
  .mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip {
    border-bottom-color: ${props => props.$pointerColor};
  }
  .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip,
  .mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip,
  .mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip {
    border-top-color: ${props => props.$pointerColor};
  }
  .mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
    border-right-color: ${props => props.$pointerColor};
  }
  .mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
    border-left-color: ${props => props.$pointerColor};
  }
  .mapboxgl-ctrl-top-left,
  .mapboxgl-ctrl-top-right {
    right: 10px;
    display: block;
  }
  .mapboxgl-popup-content {
    /* pointer-events: none; */
    background-color:transparent;

    padding: 0;
  }
  .mapboxgl-ctrl-attrib {
    font-size: 11px;
    line-height: 1.4em;
  }
  .control-button {
    background-color: #fff;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    border: 0;
    width: 30px;
    height: 30px;
    border-radius: 5px;
    padding: 0;
    margin: 0;
    margin-bottom: 8px;
    text-align: center;
    &:hover {
      cursor: pointer;
      background-color: var(--gray-5);
    }
  }
  .perspective-control {
    margin-top: 10px;
  }
  .mapboxgl-ctrl-bottom-right {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    flex-direction: column;
    padding-right: 10px;
  }
  .mapboxgl-ctrl-attrib {
    flex: 0 0 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    background-color: transparent;
  }
  .fullscreen-control {
    margin-top: 10px;
  }
  .mapboxgl-ctrl-group {
    float: unset;
  }
  .mapboxgl-scroll-zoom-blocker,
  .mapboxgl-touch-pan-blocker {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 5;
  }
  .mapboxgl-scroll-zoom-blocker-show,
  .mapboxgl-touch-pan-blocker-show {
    visibility: visible;
    opacity: 1;
  }
  .mapboxgl-scroll-zoom-blocker {
    max-width: 500px;
    max-height: 50px;

    margin-left: 50%;
    margin-top: 10%;

    transform: translate(-50%, -80%);
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.35);
  }
  .mapboxgl-touch-pan-blocker {
    max-width: 80vw;
    max-height: 20vh;

    margin-left: 50%;
    margin-top: 50%;

    transform: translate(-50%, 0vh);
    border-radius: 10px;
  }
`
