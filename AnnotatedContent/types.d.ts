type ShapeStyle = {
  pattern?: 'crossed' | 'hatched' | 'dotted' | 'none'
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string | number | undefined
  patternWidth?: number
  patternSpace?: number
  patternRotation?: number
  cornerRadius?: number
}

type ConnectorSpecs = {
  type?: 'straight' | 'curved'
  direction?: 'cw' | 'ccw'
  width?: number
  markerSize?: number
  markerColor?: string
  stroke?: string
  strokeWidth?: number | string
  strokeOpacity?: number // 0 to 1
  strokeLinecap?: 'butt' | 'round' | 'square'
  strokeLinejoin?: 'miter' | 'round' | 'bevel'
  strokeMiterlimit?: number
  strokeDasharray?: string | number | undefined
  strokeDashoffset?: number | string
}

type Direction =
  | 'center'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left'
  | 'top-left'
