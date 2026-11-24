import type { ReactNode } from 'react'
import StarRating from './StarRating'

const RIGHT_HALF =
  'M24 1.175l7.553 14.84L48 18.611 36.22 30.38l2.613 16.444L24 39.26z'
const LEFT_HALF =
  'M24 1.175L16.447 16.015 0 18.613l11.78 11.767L9.167 46.825 24 39.26z'

const SHADED_MARKUP = `<svg viewBox="0 0 51 48"><path fill="#e2a820" d="${LEFT_HALF}"/><path fill="#ffe462" d="${RIGHT_HALF}"/></svg>`
const MUTED_MARKUP = `<svg viewBox="0 0 51 48"><path fill="#c8c8c8" d="${LEFT_HALF}"/><path fill="#ececec" d="${RIGHT_HALF}"/></svg>`

/** Wraps markup as an image source, the same way a jpg URL is passed. */
function svgImageUrl (markup: string) {
  const withNamespace = markup.replace(
    '<svg',
    '<svg xmlns="http://www.w3.org/2000/svg"'
  )
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(withNamespace)}`
}

/** Two-tone star. `muted` is the unfilled artwork. */
function ShadedStar ({ muted = false }: { muted?: boolean }) {
  const light = muted ? '#ececec' : '#ffe462'
  const dark = muted ? '#c8c8c8' : '#e2a820'

  return (
    <svg viewBox='0 0 51 48' aria-hidden='true'>
      <path fill={dark} d={LEFT_HALF} />
      <path fill={light} d={RIGHT_HALF} />
    </svg>
  )
}

/** Every rating and colour option of StarRating, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description: 'value 3.2, max 5, voted rgb(255, 228, 98), empty #e0e0e0',
    element: <StarRating value={3.2} />
  },
  {
    title: 'max: 3',
    description: 'value 2.4 of 3 stars',
    element: <StarRating value={2.4} max={3} />
  },
  {
    title: 'value: 0',
    element: <StarRating value={0} />
  },
  {
    title: 'value: 0.4',
    element: <StarRating value={0.4} />
  },
  {
    title: 'Full',
    description: 'value equals max',
    element: <StarRating value={5} />
  },
  {
    title: 'Above max',
    description: 'value 8 is clamped to 5 filled stars',
    element: <StarRating value={8} />
  },
  {
    title: 'voted and empty',
    element: <StarRating value={3.2} voted='#e74c3c' empty='#f3d0cc' />
  },
  {
    title: 'max: 10',
    element: <StarRating value={7.5} max={10} voted='#3498db' empty='#d6e6f2' />
  },
  {
    title: 'icon: one multi-shade svg',
    description: 'Artwork keeps its own colors. The unfilled part is a grayscale copy.',
    element: <StarRating value={3.2} icon={<ShadedStar />} />
  },
  {
    title: 'icon and emptyIcon',
    description: 'Two graphics, one for the filled part and one for the rest.',
    element: (
      <StarRating value={3.2} icon={<ShadedStar />} emptyIcon={<ShadedStar muted />} />
    )
  },
  {
    title: 'icon: svg markup string',
    element: <StarRating value={3.2} icon={SHADED_MARKUP} emptyIcon={MUTED_MARKUP} />
  },
  {
    title: 'icon: image url',
    description: 'A jpg, png, or svg URL. Same for emptyIcon.',
    element: (
      <StarRating
        value={3.2}
        icon={svgImageUrl(SHADED_MARKUP)}
        emptyIcon={svgImageUrl(MUTED_MARKUP)}
      />
    )
  }
]
