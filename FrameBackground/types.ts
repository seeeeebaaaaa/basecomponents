export type SegmentMode = 'loop' | 'play' | 'scrub'

/**
 * Scroll progress handed in by the host (typically Scroller's getPosition).
 * step: region index (-1 = above the first front element).
 * progress: 0–1 within that step.
 */
export type ScrollPosition = { step: number; progress: number }

/** Written by build-background.ts into public/background/manifest.json. */
export type SegmentManifest = {
  id: string
  mode: SegmentMode
  /** Scroller step the segment belongs to (-1 = page top down to the first text box). */
  step: number
  /**
   * Progress within the step (0–1) at which the segment takes over. Lets several
   * segments share a step, e.g. a loop until the first scroll, then a scrub.
   */
  from?: number
  frames: number
  fps?: number
  /** loop only: frames at which the loop may be left forwards. Default: end of the loop. */
  exits?: number[]
}

export type BackgroundManifest = {
  fps: number
  formats: Record<string, { width: number; height: number }>
  segments: SegmentManifest[]
}
