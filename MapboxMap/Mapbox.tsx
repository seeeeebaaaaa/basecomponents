import { ReactNode, createContext, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import styled from 'styled-components'

import { DefaultsType, MapContextType } from './Types/mapboxtypes'
import { Help } from './Components/Help'
import { useWindowSize } from 'usehooks-ts'
import smoothscroll from 'smoothscroll-polyfill'

// kick off the polyfill!
smoothscroll.polyfill()

mapboxgl.accessToken =
  'pk.eyJ1IjoidGEtaW50ZXJha3RpdiIsImEiOiJjaXNhNGFsdHAwMDB2Mm9wNWdlMTlqMTNuIn0.uj5aGvF3yvEM4V6kNdlbVg'

const MapboxDefaults = {
  pointerColor: '#fff'
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
  getMap
}: {
  children?: ReactNode
  colorMode?: 'dark' | 'light' | undefined
  lang?: 'de' | 'fr' | undefined
  scrollTarget?: HTMLDivElement | null
  getMap?: (e: mapboxgl.Map) => void
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | undefined>()
  const [mapReady, setMapReady] = useState(false)

  const [terrainActive, setTerrainActive] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
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

  /** Enables scroll zoom and drag pan, scrolls to map target. */
  function activateInteraction () {
    if (map.current) {
      map.current.scrollZoom.enable()
      map.current.dragPan.enable()
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
          bearing: 90,
          pitch: 0
        })
      }
    }
    deactivateTerrain()
    setIsInteractive(false)
  }

  /** Handles perspective and interaction property changes. */
  function handlePropChange (prop: string, value: any) {
    if (prop === 'perspective') {
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

  // Initialize the map once
  useEffect(() => {
    if (map.current) return
    if (!mapContainer.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 5
    })
    map.current.scrollZoom.disable()
    map.current.dragPan.disable()
    map.current.once('styledata', () => {
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
      changeDefault
    })
  }, [
    helpVisible,
    isInteractive,
    terrainActive,
    viewToReturnTo,
    isMobile,
    mapReady
  ])

  return (
    <MapWrapper
      style={{
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
    >
      <FullScreenContainer
        className='fullscreen-container'
        style={{
          position: 'relative',
          top: 0,
          height: '100%'
        }}
      >
        <MapContext.Provider value={currentContext}>
          {height && (
            <MapContainer
              className='map-container'
              $pointerColor={MapboxDefaults.pointerColor}
              $isInteractive={isInteractive}
              ref={mapContainer}
              $minHeight={height * 0.85}
            />
          )}

          {children}
          <Help visible={helpVisible} />
        </MapContext.Provider>
      </FullScreenContainer>
    </MapWrapper>
  )
}

const MapWrapper = styled.div`
  position: relative;
  overflow: hidden;
`
const FullScreenContainer = styled.div`
  width: 100%;
  height: 100%;
`
const MapContainer = styled.div<{
  $pointerColor: string | undefined
  $isInteractive: boolean
  $minHeight: number
}>`
  position: relative;
  width: 100%;
  min-height: ${props => props.$minHeight}px;
  height: 100%;
  @media screen and (max-width: 711px) {
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
    pointer-events: none;
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
`
