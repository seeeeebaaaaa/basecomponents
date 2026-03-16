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

type MarkerStyle = {
  size?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

type ConnectorSpecs = {
  type?: 'straight' | 'curved' | 'corner'
  direction?: 'cw' | 'ccw'
  cornerRadius?: number // 0 (sharp corner) to 100 (full curve), only applies to 'curved' type
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
