import React, { type ReactNode } from 'react'
import { useMFContext } from '../MFHelpers'
import { MapboxMap } from './Mapbox'
import { InteractiveToggle } from './Components/InteractiveToggle'
import { MapStyle } from './Components/MapStyle'
import { Marker } from './Components/Marker'
import { NavigationControl } from './Components/NavigationControl'
import { Overlay } from './Components/Overlay'

/** Stands in for the host token. Paste a key into Properties → mapboxToken. */
export const showcaseConfig = {
  properties: { mapboxToken: '' }
}

const LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11'
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11'

const ZURICH = { lng: 8.5417, lat: 47.3769 }

/** Reads the token from the host properties object the gallery edits. */
const useMapboxToken = () => {
  const { properties } = useMFContext()
  return properties.mapboxToken || properties.accessToken || ''
}

const MissingToken = () => (
  <div
    style={{
      padding: 16,
      border: '1px dashed rgba(128, 128, 128, 0.45)',
      fontSize: 13,
      lineHeight: 1.5
    }}
  >
    MapboxMap needs an access token. Open <strong>Properties</strong> and set{' '}
    <code>mapboxToken</code>.
  </div>
)

/** Shared shell: token, toolbar color mode / language, a compact height. */
const MapShell = ({
  children,
  height = 320,
  initialView
}: {
  children?: ReactNode
  height?: number | string
  initialView?: {
    bounds?: [[number, number], [number, number]]
    center?: { lng: number; lat: number }
    zoom?: number
    bearing?: number
    pitch?: number
  }
}) => {
  const token = useMapboxToken()
  const { colorMode, currentLanguage } = useMFContext()
  if (!token) return <MissingToken />

  return (
    <MapboxMap
      accessToken={token}
      colorMode={colorMode}
      lang={currentLanguage}
      height={height}
      initialView={initialView}
    >
      <MapStyle
        light={LIGHT_STYLE}
        dark={DARK_STYLE}
        colorMode={colorMode}
        lang={currentLanguage}
      />
      {children}
    </MapboxMap>
  )
}

const Pin = () => (
  <div
    style={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#e74c3c',
      border: '2px solid #fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.35)'
    }}
  />
)

/** A few live maps — each one is a WebGL context, so this list stays short. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description:
      'Switzerland bounds, streets style until MapStyle applies. Activate the map to pan.',
    element: (
      <MapShell>
        <InteractiveToggle />
      </MapShell>
    )
  },
  {
    title: 'initialView (Zürich)',
    description: 'center + zoom, height 280.',
    element: (
      <MapShell height={280} initialView={{ center: ZURICH, zoom: 11 }}>
        <InteractiveToggle />
      </MapShell>
    )
  },
  {
    title: 'NavigationControl, Marker, Overlay',
    element: (
      <MapShell initialView={{ center: ZURICH, zoom: 11 }}>
        <NavigationControl showHome />
        <Marker position={ZURICH}>
          <Pin />
        </Marker>
        <Overlay>
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.92)',
              color: '#1a1a1a',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600
            }}
          >
            Zürich
          </div>
        </Overlay>
        <InteractiveToggle />
      </MapShell>
    )
  }
]
