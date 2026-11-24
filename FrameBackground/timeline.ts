import type { ScrollPosition, SegmentManifest } from './types'

export type TimelineState = { seg: number; frame: number }

export type TimelineInput = {
  position: ScrollPosition
  dt: number // seconds since the last tick
  fps: number // manifest default
  isReady: (seg: number) => boolean
  reducedMotion: boolean
}

/** `cut`: the frame jumped without a designed transition; the renderer cross-fades. */
export type TimelineResult = { state: TimelineState; cut: boolean }

const SMOOTHING = 0.15 // share of the remaining distance per 60 fps frame

const lastFrame = (segment: SegmentManifest) => segment.frames - 1
const startOf = (segment: SegmentManifest) => segment.from ?? 0
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

/** Segment that owns the scroll position: the last one whose (step, from) is reached. */
export const targetSegment = (
  segments: SegmentManifest[],
  { step, progress }: ScrollPosition
) => {
  let target = 0
  segments.forEach((segment, i) => {
    if (segment.step < step || (segment.step === step && startOf(segment) <= progress))
      target = i
  })
  return target
}

/** Progress of the scroll position within a segment's own range (0–1). */
export const localProgress = (
  segments: SegmentManifest[],
  seg: number,
  { step, progress }: ScrollPosition
) => {
  const segment = segments[seg]
  if (step > segment.step) return 1
  if (step < segment.step) return 0
  const next = segments[seg + 1]
  const end = next && next.step === segment.step ? startOf(next) : 1
  const start = startOf(segment)
  return end > start ? clamp01((progress - start) / (end - start)) : 1
}

const smoothTowards = (frame: number, target: number, dt: number) => {
  const factor = 1 - Math.pow(1 - SMOOTHING, dt * 60)
  const next = frame + (target - frame) * factor
  return Math.abs(target - next) < 0.05 ? target : next
}

/** Frame a segment starts at when it is entered. */
const entryFrame = (
  segments: SegmentManifest[],
  seg: number,
  position: ScrollPosition,
  forward: boolean
) => {
  const segment = segments[seg]
  if (segment.mode === 'scrub') return localProgress(segments, seg, position) * lastFrame(segment)
  if (segment.mode === 'play') return forward ? 0 : lastFrame(segment)
  return 0
}

/** Advances the playhead within the current segment. */
const playWithin = (
  segments: SegmentManifest[],
  { seg, frame }: TimelineState,
  input: TimelineInput
) => {
  const segment = segments[seg]
  const step = input.dt * (segment.fps ?? input.fps)
  if (segment.mode === 'scrub') {
    const target = localProgress(segments, seg, input.position) * lastFrame(segment)
    return input.reducedMotion ? target : smoothTowards(frame, target, input.dt)
  }
  if (input.reducedMotion) return segment.mode === 'play' ? lastFrame(segment) : frame
  if (segment.mode === 'loop') return (frame + step) % segment.frames
  return Math.min(frame + step, lastFrame(segment))
}

/**
 * Plays the current segment towards its exit. Returns the new frame and whether the
 * exit was reached, i.e. the next segment may take over seamlessly.
 */
const playToExit = (
  segment: SegmentManifest,
  frame: number,
  forward: boolean,
  input: TimelineInput
): { frame: number; done: boolean } => {
  const step = input.dt * (segment.fps ?? input.fps)
  const last = lastFrame(segment)

  if (segment.mode === 'scrub') {
    const target = forward ? last : 0
    // At least one frame per tick so a slow smoothing tail cannot stall the handover.
    const smoothed = smoothTowards(frame, target, input.dt)
    const next = forward
      ? Math.max(smoothed, Math.min(frame + 1, last))
      : Math.min(smoothed, Math.max(frame - 1, 0))
    return { frame: next, done: next === target }
  }

  if (segment.mode === 'play') {
    const next = forward ? Math.min(frame + step, last) : Math.max(frame - step, 0)
    return { frame: next, done: next === (forward ? last : 0) }
  }

  // loop: forwards through any exit point, backwards only through the loop start
  const exits = forward ? (segment.exits?.length ? segment.exits : [0]) : [0]
  const positions = exits.map(e => (e <= 0 ? segment.frames : e))
  const next = frame + step
  if (positions.some(p => frame < p && p <= next)) return { frame: next, done: true }
  return { frame: next % segment.frames, done: false }
}

export const initialState = (
  segments: SegmentManifest[],
  position: ScrollPosition
): TimelineState => {
  const seg = targetSegment(segments, position)
  const segment = segments[seg]
  const frame =
    segment.mode === 'play' ? lastFrame(segment) : entryFrame(segments, seg, position, true)
  return { seg, frame }
}

export const advance = (
  segments: SegmentManifest[],
  state: TimelineState,
  input: TimelineInput
): TimelineResult => {
  const target = targetSegment(segments, input.position)

  if (target === state.seg) {
    return { state: { seg: state.seg, frame: playWithin(segments, state, input) }, cut: false }
  }

  const forward = target > state.seg
  const neighbour = forward ? state.seg + 1 : state.seg - 1

  if (target !== neighbour || input.reducedMotion) {
    if (!input.isReady(target)) {
      return { state: { seg: state.seg, frame: playWithin(segments, state, input) }, cut: false }
    }
    return {
      state: { seg: target, frame: entryFrame(segments, target, input.position, forward) },
      cut: !input.reducedMotion
    }
  }

  const { frame, done } = playToExit(segments[state.seg], state.frame, forward, input)
  if (!done || !input.isReady(target)) {
    const current = segments[state.seg]
    const held = current.mode === 'loop' ? frame % current.frames : frame
    return { state: { seg: state.seg, frame: held }, cut: false }
  }
  // Designed handover: start at the frame that matches the one just left. A scrub
  // segment then smooths towards the scroll position from there.
  const next = segments[target]
  const frame0 = forward || next.mode === 'loop' ? 0 : lastFrame(next)
  return { state: { seg: target, frame: frame0 }, cut: false }
}
