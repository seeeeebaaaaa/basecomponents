import { useId, type ReactNode } from 'react'
import styled from 'styled-components'

const STAR_PATH =
  'M24 1.175l7.553 14.84L48 18.611 36.22 30.38l2.613 16.444L24 39.26 9.167 46.825 11.78 30.38 0 18.613l16.447-2.598z'
const STAR_VIEW_BOX = '0 0 51 48'
const ICON_SIZE = 23

const DEFAULT_VOTED = 'rgb(255, 228, 98)'
const DEFAULT_EMPTY = '#e0e0e0'

export type StarRatingProps = {
  value: number
  max?: number
  /** Fill of the default star. Custom icons keep the colors in the artwork. */
  voted?: string
  /** Empty color of the default star. Custom icons keep the colors in the artwork. */
  empty?: string
  /**
   * Filled graphic. An SVG element, an SVG markup string, or an image URL
   * (jpg, png, svg). Omit it to use the default star.
   */
  icon?: ReactNode
  /**
   * Unfilled graphic, same format as `icon`. Omit it to use a grayscale copy
   * of `icon`.
   */
  emptyIcon?: ReactNode
  className?: string
}

/**
 * Renders `max` icons filled from the left up to `value`, including a partial icon.
 */
function StarRating ({
  value,
  max = 5,
  voted = DEFAULT_VOTED,
  empty = DEFAULT_EMPTY,
  icon,
  emptyIcon,
  className
}: StarRatingProps) {
  const starCount = toStarCount(max)
  const filled = clamp(Number.isFinite(value) ? value : 0, 0, starCount)
  const hasCustomIcon = icon != null && icon !== ''

  return (
    <Stars
      className={className}
      role='img'
      aria-label={`${formatRating(filled)} out of ${starCount}`}
    >
      {Array.from({ length: starCount }, (_, index) =>
        hasCustomIcon ? (
          <CustomIcon
            key={index}
            fill={filled - index}
            icon={icon}
            emptyIcon={emptyIcon}
          />
        ) : (
          <StarIcon
            key={index}
            fill={filled - index}
            voted={voted}
            empty={empty}
          />
        )
      )}
    </Stars>
  )
}

/** Stacks the filled graphic over the empty one and clips the fill from the left. */
function CustomIcon ({
  fill,
  icon,
  emptyIcon
}: {
  fill: number
  icon: ReactNode
  emptyIcon?: ReactNode
}) {
  const fraction = clamp(fill, 0, 1)
  const scope = useId().replace(/:/g, '')

  return (
    <IconFrame aria-hidden='true'>
      {fraction < 1 && (
        <IconLayer $muted={emptyIcon == null}>
          {renderGraphic(emptyIcon ?? icon, `${scope}-empty`)}
        </IconLayer>
      )}
      {fraction > 0 && (
        <IconLayer
          style={{ clipPath: `inset(0 ${(1 - fraction) * 100}% 0 0)` }}
        >
          {renderGraphic(icon, `${scope}-filled`)}
        </IconLayer>
      )}
    </IconFrame>
  )
}

/** Draws the default star, filled from the left by `fill` (0–1). */
function StarIcon ({
  fill,
  voted,
  empty
}: {
  fill: number
  voted: string
  empty: string
}) {
  const clipId = `star-${useId().replace(/:/g, '')}`
  const fraction = clamp(fill, 0, 1)

  return (
    <StarSvg viewBox={STAR_VIEW_BOX} aria-hidden='true' className='widget-svg'>
      <StarPath className='star' d={STAR_PATH} $fill={empty} />
      {fraction > 0 && (
        <>
          <clipPath id={clipId} clipPathUnits='objectBoundingBox'>
            <rect x='0' y='0' width={fraction} height='1' />
          </clipPath>
          <StarPath
            className='star'
            d={STAR_PATH}
            $fill={voted}
            clipPath={`url(#${clipId})`}
          />
        </>
      )}
    </StarSvg>
  )
}

/** Turns an SVG element, SVG markup string, or image URL into a node. */
function renderGraphic (graphic: ReactNode, scope: string) {
  if (typeof graphic !== 'string') return graphic

  const trimmed = graphic.trim()
  if (!isSvgMarkup(trimmed)) return <IconImage src={trimmed} alt='' />

  return (
    <IconMarkup
      dangerouslySetInnerHTML={{ __html: scopeSvgIds(trimmed, scope) }}
    />
  )
}

/** Detects an SVG document rather than an image URL. */
function isSvgMarkup (value: string) {
  return /<svg[\s>]/i.test(value)
}

/** Prefixes ids so copied icons do not share gradient or clip targets. */
function scopeSvgIds (markup: string, scope: string) {
  const ids = [...markup.matchAll(/\sid=["']([^"']+)["']/gi)].map(
    match => match[1]
  )

  return ids.reduce((result, id) => {
    const next = `${scope}-${id}`
    return result
      .replaceAll(`id="${id}"`, `id="${next}"`)
      .replaceAll(`id='${id}'`, `id='${next}'`)
      .replaceAll(`url(#${id})`, `url(#${next})`)
      .replaceAll(`href="#${id}"`, `href="#${next}"`)
      .replaceAll(`xlink:href="#${id}"`, `xlink:href="#${next}"`)
  }, markup)
}

/** Keeps a number inside an inclusive range. */
function clamp (value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Turns `max` into a non-negative star count. */
function toStarCount (max: number) {
  if (!Number.isFinite(max)) return 5
  return Math.max(0, Math.round(max))
}

/** Drops trailing zeros so 3.2 stays 3.2 and 4 stays 4. */
function formatRating (value: number) {
  return String(Math.round(value * 100) / 100)
}

const Stars = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  line-height: 0;
`

const StarSvg = styled.svg`
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  flex: 0 0 auto;
  transition: transform 0.2s ease-in-out;
`

const StarPath = styled.path<{ $fill: string }>`
  fill: ${props => props.$fill};
  transition: fill 0.2s ease-in-out;
`

const IconFrame = styled.span`
  position: relative;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  flex: 0 0 auto;
  transition: transform 0.2s ease-in-out;
`

const IconLayer = styled.span<{ $muted?: boolean }>`
  position: absolute;
  inset: 0;
  display: block;
  filter: ${props => (props.$muted ? 'grayscale(1)' : 'none')};
  opacity: ${props => (props.$muted ? 0.45 : 1)};

  svg,
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }
`

const IconMarkup = styled.span`
  display: contents;
`

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

export default StarRating
