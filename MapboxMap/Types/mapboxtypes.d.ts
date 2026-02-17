import { ReactNode } from 'react'

type CTRLPositions = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

type MapStyleProps = {
  light?: string
  dark?: string
  lightDe?: string
  darkDe?: string
  lightFr?: string
  darkFr?: string
  colorMode?: 'light' | 'dark' | undefined
  lang?: 'de' | 'fr'
}

type MapAnnotation = {
  pos: { lat: number; lng: number }
  element: JSX.Element
  pointerColor?: string
}

type DefaultsType = {
  pointerColor: string
}

type MapContextType = {
  map?: mapboxgl.Map | undefined
  isMobile?: boolean
  zoomDuration?: number
  colorMode?: 'light' | 'dark' | undefined
  //
  handlePropChange?: (prop: string, value: any) => void
  setFullscreen?: (fullscreen: boolean) => void
  setTerrain?: (terrain: boolean) => void
  setIsInteractive?: (terrain: boolean) => void
  setShowHelp?: (showHelp: boolean) => void
  setViewToReturnTo?: (view: mapboxgl.CameraOptions) => void
  setPerspectiveControl?: (position: any) => void
  //
  viewToReturnTo?: mapboxgl.CameraOptions
  //
  helpVisible?: boolean
  isInteractive?: boolean
  terrainActive?: boolean
  isFullscreen?: boolean
  //
  changeDefault?: (prop: keyof DefaultsType, value: any) => void

  scrollTarget?: HTMLDivElement | null
}
