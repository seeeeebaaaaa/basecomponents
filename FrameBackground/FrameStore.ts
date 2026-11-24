import type { SegmentManifest } from './types'

const CONCURRENCY = 6
const COARSE_STRIDE = 8

// Coarse to fine: every 8th frame (plus the last), then every 4th, 2nd, all.
const loadOrder = (frames: number) => {
  const order: number[] = []
  const seen = new Set<number>()
  const add = (i: number) => {
    if (i < frames && !seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
  for (let i = 0; i < frames; i += COARSE_STRIDE) add(i)
  add(frames - 1)
  for (const stride of [4, 2, 1]) for (let i = 0; i < frames; i += stride) add(i)
  return order
}

const coarseCount = (frames: number) => Math.ceil(frames / COARSE_STRIDE) + (frames % COARSE_STRIDE === 1 ? 0 : 1)

type SegmentSlot = {
  bitmaps: (ImageBitmap | undefined)[]
  pending: number[]
  loaded: number
  coarse: number
  inFlight: Set<HTMLImageElement>
}

// Loads frames as <img> (no CORS needed, the canvas is never read back) and keeps them
// as decoded ImageBitmaps. Only segments in the active window are kept in memory.
export class FrameStore {
  private slots = new Map<number, SegmentSlot>()
  private priority: number[] = []
  private active = 0
  private disposed = false
  private finished = new WeakSet<HTMLImageElement>()

  constructor(
    private segments: SegmentManifest[],
    private frameUrl: (segment: SegmentManifest, frame: number) => string
  ) {}

  // Keeps the current segment, the one the scroll position asks for, and their
  // neighbours. Current loads first, then the target, so a jump never waits on frames
  // that are not being loaded.
  focus(seg: number, target = seg) {
    const candidates = [seg, target, seg + 1, seg - 1, target + 1, target - 1, seg + 2]
    const window = [...new Set(candidates)].filter(i => i >= 0 && i < this.segments.length)
    for (const i of [...this.slots.keys()]) if (!window.includes(i)) this.release(i)
    for (const i of window) if (!this.slots.has(i)) this.slots.set(i, this.createSlot(i))
    this.priority = window
    this.pump()
  }

  isReady(seg: number) {
    const slot = this.slots.get(seg)
    return !!slot && slot.loaded >= slot.coarse
  }

  // Requested frame, or the nearest loaded one while finer frames are still coming.
  nearest(seg: number, frame: number) {
    const slot = this.slots.get(seg)
    if (!slot) return undefined
    const target = Math.round(frame)
    for (let d = 0; d < slot.bitmaps.length; d++) {
      const bitmap = slot.bitmaps[target - d] ?? slot.bitmaps[target + d]
      if (bitmap) return bitmap
    }
    return undefined
  }

  dispose() {
    this.disposed = true
    for (const i of [...this.slots.keys()]) this.release(i)
  }

  private createSlot(seg: number): SegmentSlot {
    const frames = this.segments[seg].frames
    return {
      bitmaps: new Array(frames),
      pending: loadOrder(frames),
      loaded: 0,
      coarse: Math.min(coarseCount(frames), frames),
      inFlight: new Set()
    }
  }

  private release(seg: number) {
    const slot = this.slots.get(seg)
    if (!slot) return
    slot.inFlight.forEach(img => {
      img.onload = img.onerror = null
      img.src = ''
      this.finish(img, slot, false)
    })
    slot.bitmaps.forEach(bitmap => bitmap?.close())
    this.slots.delete(seg)
  }

  private pump() {
    while (!this.disposed && this.active < CONCURRENCY) {
      const seg = this.priority.find(i => this.slots.get(i)?.pending.length)
      if (seg === undefined) return
      const slot = this.slots.get(seg)!
      this.load(seg, slot, slot.pending.shift()!)
    }
  }

  private finish(img: HTMLImageElement, slot: SegmentSlot, pump: boolean) {
    if (this.finished.has(img)) return
    this.finished.add(img)
    slot.inFlight.delete(img)
    this.active--
    if (pump) this.pump()
  }

  private load(seg: number, slot: SegmentSlot, frame: number) {
    this.active++
    const img = new Image()
    img.decoding = 'async'
    slot.inFlight.add(img)
    const done = () => this.finish(img, slot, true)
    img.onload = () =>
      createImageBitmap(img)
        .then(bitmap => {
          if (this.slots.get(seg) === slot) {
            slot.bitmaps[frame] = bitmap
            slot.loaded++
          } else bitmap.close()
        })
        .catch(() => {})
        .finally(done)
    img.onerror = done
    img.src = this.frameUrl(this.segments[seg], frame)
  }
}
