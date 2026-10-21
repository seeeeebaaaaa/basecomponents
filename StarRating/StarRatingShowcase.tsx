import type { ReactNode } from 'react'
import StarRating from './StarRating'

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
  }
]
