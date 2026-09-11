import {
  PointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'
import styled, { css } from 'styled-components'
import cantonsSvg from './cantons.svg?raw'
import { getCantonName, getCantonWappenUrl } from './cantons'

const CANTON_ID = /^[A-Z]{2}$/

const DEFAULT_HATCH = {
  color: 'rgba(17, 17, 17, 0.4)',
  spacing: 8,
  width: 1.5
}

export type ColorSpecs = {
  hoveredStroke?: string
  stroke?: string
  fill?: string
}

export type HatchDirection =
  | 'forward'
  | 'back'
  | 'horizontal'
  | 'vertical'
  | 'cross'

export type HatchSpec = {
  color?: string
  direction?: HatchDirection
  angle?: number
  spacing?: number
  width?: number
}

export type CantonStyle = {
  fill?: string
  hatch?: boolean | HatchSpec
  value?: number | string
}

export type CantonStyles = Record<string, CantonStyle>

type ResolvedHatch = {
  color: string
  angle: number
  spacing: number
  width: number
  cross: boolean
}

type HatchPattern = {
  id: string
  spec: ResolvedHatch
  fill?: string
}

type TooltipState = {
  id: string
  x: number
  y: number
  name: string
  value?: string
  sticky?: boolean
}

type CantonsMapProps = {
  cantons?: CantonStyles
  lang?: 'de' | 'fr'
  formatValue?: (value: number | string) => string
  noDataText?: string
  colors?: ColorSpecs
}

const svgMarkup = cantonsSvg.replace('<metadata>', '')

/**
 * Maps a hatch direction (and optional angle override) to pattern rotation.
 */
function directionToAngle (direction?: HatchDirection, angle?: number) {
  const cross = direction === 'cross'
  if (angle != null) return { angle, cross }
  if (direction === 'back') return { angle: -45, cross }
  if (direction === 'horizontal') return { angle: 0, cross }
  if (direction === 'vertical') return { angle: 90, cross }
  return { angle: 45, cross }
}

/**
 * Normalizes a canton hatch option into a concrete pattern spec.
 */
function resolveHatch (hatch?: boolean | HatchSpec): ResolvedHatch | null {
  if (!hatch) return null
  const spec = hatch === true ? {} : hatch
  const { angle, cross } = directionToAngle(spec.direction, spec.angle)
  return {
    color: spec.color ?? DEFAULT_HATCH.color,
    angle,
    spacing: spec.spacing ?? DEFAULT_HATCH.spacing,
    width: spec.width ?? DEFAULT_HATCH.width,
    cross
  }
}

/**
 * Escapes a value for use in an SVG attribute.
 */
function escapeAttr (value: string) {
  return value.replace(/"/g, '&quot;')
}

/**
 * Collects unique hatch patterns and per-canton fill/pattern assignments.
 */
function collectHatchPatterns (cantons: CantonStyles, idPrefix: string) {
  const patterns = new Map<string, HatchPattern>()
  const byCanton: Record<string, { fill?: string; patternId?: string }> = {}

  Object.entries(cantons).forEach(([id, canton]) => {
    if (!CANTON_ID.test(id)) return

    const hatch = resolveHatch(canton.hatch)
    if (!hatch && !canton.fill) return

    if (!hatch) {
      byCanton[id] = { fill: canton.fill }
      return
    }

    const withFill = canton.fill
    const key = [
      hatch.color,
      hatch.angle,
      hatch.spacing,
      hatch.width,
      hatch.cross,
      withFill ?? ''
    ].join('|')

    let pattern = patterns.get(key)
    if (!pattern) {
      pattern = {
        id: `${idPrefix}-${patterns.size}`,
        spec: hatch,
        fill: withFill
      }
      patterns.set(key, pattern)
    }

    byCanton[id] = { fill: canton.fill, patternId: pattern.id }
  })

  return { patterns, byCanton }
}

/**
 * Builds SVG <defs> markup for the collected hatch patterns.
 */
function buildHatchDefs (patterns: Map<string, HatchPattern>) {
  if (patterns.size === 0) return ''

  const markup = [...patterns.values()]
    .map(({ id, spec, fill }) => {
      const { spacing, angle, color, width, cross } = spec
      const bg = fill
        ? `<rect width="${spacing}" height="${spacing}" fill="${escapeAttr(
            fill
          )}"/>`
        : ''
      const line = `<line x1="0" y1="0" x2="0" y2="${spacing}" stroke="${escapeAttr(
        color
      )}" stroke-width="${width}"/>`
      const crossLine = cross
        ? `<line x1="0" y1="0" x2="${spacing}" y2="0" stroke="${escapeAttr(
            color
          )}" stroke-width="${width}"/>`
        : ''
      return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}" patternTransform="rotate(${angle})">${bg}${line}${crossLine}</pattern>`
    })
    .join('')

  return `<defs>${markup}</defs>`
}

/**
 * Injects hatch pattern defs and fill rules into the canton SVG markup.
 */
function injectHatchSvg (
  svg: string,
  patterns: Map<string, HatchPattern>,
  byCanton: Record<string, { fill?: string; patternId?: string }>
) {
  const defs = buildHatchDefs(patterns)
  const hatchCss = Object.entries(byCanton)
    .filter(([, canton]) => canton.patternId)
    .map(([id, canton]) => `#${id}{fill:url(#${canton.patternId})}`)
    .join('')
  const extras = `${defs}${hatchCss ? `<style>${hatchCss}</style>` : ''}`
  if (!extras) return svg
  return svg.replace(/(<svg[^>]*>)/, `$1${extras}`)
}

/**
 * Builds scoped fill rules for canton path ids (e.g. ZH, BE).
 */
function fillsToCss (
  byCanton: Record<string, { fill?: string; patternId?: string }>
) {
  return Object.entries(byCanton)
    .filter(([, canton]) => canton.fill && !canton.patternId)
    .map(
      ([id, canton]) => css`
        & #${id} {
          fill: ${canton.fill};
        }
      `
    )
}

/**
 * Formats a canton value for tooltip display.
 */
function defaultFormatValue (value: number | string) {
  return typeof value === 'number' ? value.toLocaleString('de-CH') : value
}

/**
 * True when the event comes from a real hover pointer (desktop mouse).
 * Touch and coarse pointers must not use hover; lifting a finger fires pointerleave.
 */
function isHoverPointer (event: PointerEvent) {
  return (
    event.pointerType === 'mouse' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
}

/**
 * Returns the canton path under the pointer, if any.
 */
function getCantonPath (event: PointerEvent<HTMLDivElement>) {
  const path = (event.target as Element).closest?.('path.canton')
  if (!path || !event.currentTarget.contains(path)) return null
  return path
}

/**
 * Moves the hovered canton path to the front so its stroke is not covered.
 */
function bringPathToFront (path: Element) {
  const parent = path.parentNode
  if (parent && parent.lastChild !== path) {
    parent.appendChild(path)
  }
}

/**
 * Renders the Swiss cantons SVG and colors paths from canton styles.
 */
const CantonsMap = ({
  cantons = {},
  lang = 'de',
  formatValue = defaultFormatValue,
  noDataText = 'keine Daten',
  colors = { hoveredStroke: '#111' }
}: CantonsMapProps) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<{
    x: number
    y: number
    path: Element | null
  } | null>(null)
  const hatchPrefix = `cm-hatch-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { patterns, byCanton } = useMemo(
    () => collectHatchPatterns(cantons, hatchPrefix),
    [cantons, hatchPrefix]
  )
  const mapMarkup = useMemo(
    () => injectHatchSvg(svgMarkup, patterns, byCanton),
    [patterns, byCanton]
  )

  /**
   * Builds tooltip state for a canton path at the current pointer position.
   */
  function tooltipFromPath (
    path: Element,
    event: PointerEvent<HTMLDivElement>,
    sticky?: boolean
  ): TooltipState {
    const id = path.id
    const canton = cantons[id]
    const value = canton?.value == null ? undefined : formatValue(canton.value)
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      id,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      name: getCantonName(id, lang),
      value,
      sticky
    }
  }

  /**
   * Remembers the press start so a scroll is not treated as a tap.
   * Stores the canton path here because iOS can fire pointerleave before pointerup.
   */
  function handlePointerDown (event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      path: getCantonPath(event)
    }
  }

  /**
   * Follows the cursor on hover pointers. Touch is handled on pointer up.
   */
  function handlePointerMove (event: PointerEvent<HTMLDivElement>) {
    if (!isHoverPointer(event)) return

    const path = getCantonPath(event)
    if (!path) {
      setTooltip(null)
      return
    }

    bringPathToFront(path)
    setTooltip(tooltipFromPath(path, event))
  }

  /**
   * Hides the hover tooltip when the pointer leaves the map.
   */
  function handlePointerLeave (event: PointerEvent<HTMLDivElement>) {
    if (!isHoverPointer(event)) return
    setTooltip(null)
  }

  /**
   * Pins the tooltip on tap for touch / coarse pointers.
   */
  function handlePointerUp (event: PointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (isHoverPointer(event)) return
    if (!start || event.button !== 0) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (dx * dx + dy * dy > 25) return

    const path = start.path
    if (!path) {
      setTooltip(null)
      return
    }

    bringPathToFront(path)
    const next = tooltipFromPath(path, event, true)
    setTooltip(prev => (prev?.id === next.id ? null : next))
  }

  /**
   * Drops an in-progress tap when the browser cancels the pointer (e.g. scroll).
   */
  function handlePointerCancel () {
    pointerStartRef.current = null
  }

  useEffect(() => {
    if (!tooltip?.sticky) return

    /**
     * Dismisses a tap-locked tooltip when pressing outside the map.
     */
    function handlePointerDownOutside (event: globalThis.PointerEvent) {
      const root = containerRef.current
      if (!root || root.contains(event.target as Node)) return
      setTooltip(null)
    }

    document.addEventListener('pointerdown', handlePointerDownOutside)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside)
    }
  }, [tooltip?.sticky])

  return (
    <CantonsMapContainer
      ref={containerRef}
      $byCanton={byCanton}
      $hoveredId={tooltip?.id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      $colors={colors}
    >
      <SvgHost dangerouslySetInnerHTML={{ __html: mapMarkup }} />
      {tooltip && (
        <Tooltip
          role='tooltip'
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          <TooltipWappen
            src={getCantonWappenUrl(tooltip.id)}
            alt=''
            aria-hidden
          />
          <TooltipBody>
            <TooltipName>{tooltip.name}</TooltipName>
            {tooltip.value != null && (
              <TooltipValue>{tooltip.value}</TooltipValue>
            )}
            {tooltip.value == null && <TooltipValue>{noDataText}</TooltipValue>}
          </TooltipBody>
        </Tooltip>
      )}
    </CantonsMapContainer>
  )
}

const CantonsMapContainer = styled.div<{
  $byCanton: Record<string, { fill?: string; patternId?: string }>
  $hoveredId?: string
  $colors: ColorSpecs
}>`
  position: relative;
  padding-left: 20px;
  padding-right: 20px;
  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  path.canton {
    cursor: pointer;
    transition: stroke 0.12s ease;
    stroke: ${({ $colors }) => $colors?.stroke || '#111'};
    fill: ${({ $colors }) => $colors?.fill || '#f0f0f0'};
  }

  ${({ $byCanton }) => fillsToCss($byCanton)}
  ${({ $hoveredId, $colors }) =>
    $hoveredId &&
    CANTON_ID.test($hoveredId) &&
    css`
      & #${$hoveredId} {
        stroke: ${$colors?.hoveredStroke};
      }
    `}
`

const SvgHost = styled.div`
  display: block;
`

const Tooltip = styled.div`
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translate(12px, -100%);
  pointer-events: none;
  padding: 6px 10px;
  background: #fff;
  color: #111;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  font-size: 14px;
  line-height: 1.3;
  white-space: nowrap;
`

const TooltipWappen = styled.img`
  display: block;
  height: 28px;
  width: auto;
  max-width: 32px;
  object-fit: contain;
  flex-shrink: 0;
`

const TooltipBody = styled.div`
  min-width: 0;
`

const TooltipName = styled.div`
  font-weight: 600;
`

const TooltipValue = styled.div`
  color: #444;
`

export default CantonsMap
