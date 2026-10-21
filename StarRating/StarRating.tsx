import { useId } from 'react'
import styled from 'styled-components'

const STAR_PATH =
  'M24 1.175l7.553 14.84L48 18.611 36.22 30.38l2.613 16.444L24 39.26 9.167 46.825 11.78 30.38 0 18.613l16.447-2.598z'

const DEFAULT_VOTED = 'rgb(255, 228, 98)'
const DEFAULT_EMPTY = '#e0e0e0'

export type StarRatingProps = {
  value: number
  max?: number
  voted?: string
  empty?: string
  className?: string
}

/**
 * Renders `max` stars filled from the left up to `value`, including a partial star.
 */
function StarRating ({
  value,
  max = 5,
  voted = DEFAULT_VOTED,
  empty = DEFAULT_EMPTY,
  className
}: StarRatingProps) {
  const starCount = toStarCount(max)
  const filled = clamp(Number.isFinite(value) ? value : 0, 0, starCount)

  return (
    <Stars
      className={className}
      role='img'
      aria-label={`${formatRating(filled)} out of ${starCount}`}
    >
      {Array.from({ length: starCount }, (_, index) => (
        <StarIcon
          key={index}
          fill={filled - index}
          voted={voted}
          empty={empty}
        />
      ))}
    </Stars>
  )
}

/** Draws one star, filled from the left by `fill` (0–1). */
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
    <StarSvg viewBox='0 0 51 48' aria-hidden='true' className='widget-svg'>
      <StarPath className='star' d={STAR_PATH} $fill={empty} />
      {fraction > 0 && (
        <>
          <clipPath id={clipId}>
            <rect x='0' y='0' width={51 * fraction} height='48' />
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
  width: 23px;
  height: 23px;
  flex: 0 0 auto;
  transition: transform 0.2s ease-in-out;
`

const StarPath = styled.path<{ $fill: string }>`
  fill: ${props => props.$fill};
  transition: fill 0.2s ease-in-out;
`

export default StarRating
