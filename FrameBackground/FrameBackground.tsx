import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { url } from '../MFHelpers'
import { FrameStore } from './FrameStore'
import { advance, initialState, targetSegment, TimelineState } from './timeline'
import type { BackgroundManifest, ScrollPosition, SegmentManifest } from './types'

const FADE_MS = 300
const MAX_DPR = 2

type FrameBackgroundProps = {
  getPosition: () => ScrollPosition
  /** Folder in /public holding manifest.json and the frame folders. */
  basePath?: string
  /** Draws segment, frame and scroll position on top. For development. */
  debug?: boolean
  /**
   * 'contain' scales the whole frame into the canvas (bars where the aspect differs),
   * 'cover' fills the canvas and crops.
   */
  fit?: 'contain' | 'cover'
}

/**
 * Format whose aspect ratio is closest to the browser window, e.g. the portrait video
 * on phones. The window decides, not the canvas, so a narrow canvas on a desktop still
 * gets the desktop video.
 */
const pickFormat = (manifest: BackgroundManifest) => {
  const target = Math.log(window.innerWidth / Math.max(window.innerHeight, 1))
  let best = Object.keys(manifest.formats)[0]
  let bestDistance = Infinity
  for (const [name, { width, height }] of Object.entries(manifest.formats)) {
    const distance = Math.abs(Math.log(width / height) - target)
    if (distance < bestDistance) {
      best = name
      bestDistance = distance
    }
  }
  return best
}

const drawFrame = (
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  iw: number,
  ih: number,
  fit: 'contain' | 'cover'
) => {
  const { width: cw, height: ch } = ctx.canvas
  const scale = (fit === 'cover' ? Math.max : Math.min)(cw / iw, ch / ih)
  if (fit === 'contain') ctx.clearRect(0, 0, cw, ch)
  const w = iw * scale
  const h = ih * scale
  ctx.drawImage(image, (cw - w) / 2, (ch - h) / 2, w, h)
}

/** Canvas renderer for a scroll-driven WebP frame sequence (manifest + frames in /public). */
export const FrameBackground = ({
  getPosition,
  basePath = 'background',
  debug = false,
  fit = 'contain'
}: FrameBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [manifest, setManifest] = useState<BackgroundManifest | null>(null)
  const getPositionRef = useRef(getPosition)
  getPositionRef.current = getPosition

  useEffect(() => {
    let cancelled = false
    fetch(url(`${basePath}/manifest.json`))
      .then(response => response.json())
      .then(data => !cancelled && setManifest(data))
      .catch(error =>
        console.error('FrameBackground: manifest could not be loaded', error)
      )
    return () => {
      cancelled = true
    }
  }, [basePath])

  // Switching format reloads the frames, so it only happens when another format fits
  // the window better, e.g. when a window is narrowed past portrait.
  const [format, setFormat] = useState<string | null>(null)
  useEffect(() => {
    if (!manifest) return
    const update = () => setFormat(pickFormat(manifest))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [manifest])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!manifest || !format || !manifest.formats[format] || !canvas || !ctx) return

    const segments: SegmentManifest[] = manifest.segments
    const size = manifest.formats[format]
    const frameUrl = (segment: SegmentManifest, frame: number) =>
      url(
        `${basePath}/${format}/${segment.id}/${String(frame + 1).padStart(4, '0')}.webp`
      )

    const store = new FrameStore(segments, frameUrl)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const fadeCanvas = document.createElement('canvas')
    const fadeCtx = fadeCanvas.getContext('2d')!
    let fadeStart = -Infinity

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      fadeCanvas.width = canvas.width
      fadeCanvas.height = canvas.height
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    let state: TimelineState = initialState(segments, getPositionRef.current())
    let focusKey = ''
    const focus = (seg: number, target: number) => {
      const key = `${seg}:${target}`
      if (key === focusKey) return
      focusKey = key
      store.focus(seg, target)
    }
    focus(state.seg, state.seg)

    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      // Clamped so a tab coming back from the background does not jump.
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      const position = getPositionRef.current()
      const result = advance(segments, state, {
        position,
        dt,
        fps: manifest.fps,
        isReady: seg => store.isReady(seg),
        reducedMotion: reducedMotion.matches
      })

      if (result.cut) {
        fadeCtx.clearRect(0, 0, fadeCanvas.width, fadeCanvas.height)
        fadeCtx.drawImage(canvas, 0, 0)
        fadeStart = now
      }
      focus(result.state.seg, targetSegment(segments, position))
      state = result.state

      const bitmap = store.nearest(state.seg, state.frame)
      if (!bitmap) return

      ctx.globalAlpha = 1
      drawFrame(ctx, bitmap, size.width, size.height, fit)

      const fade = 1 - (now - fadeStart) / FADE_MS
      if (fade > 0) {
        ctx.globalAlpha = fade
        ctx.drawImage(fadeCanvas, 0, 0)
        ctx.globalAlpha = 1
      }

      if (debug) {
        const segment = segments[state.seg]
        ;(window as any).__frameBackground = {
          segment: segment.id,
          frame: state.frame,
          drawn: segments.indexOf(segment),
          position
        }
        const text = `${segment.id} (${
          segment.mode
        }) frame ${state.frame.toFixed(1)}/${segment.frames - 1} · step ${
          position.step
        } ${position.progress.toFixed(2)}`
        ctx.font = `${Math.round(14 * (canvas.width / canvas.clientWidth))}px monospace`
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40)
        ctx.fillStyle = '#fff'
        ctx.fillText(text, 12, canvas.height - 14)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      store.dispose()
    }
  }, [manifest, format, basePath, debug, fit])

  return (
    <Root>
      <Canvas ref={canvasRef} />
    </Root>
  )
}

export default FrameBackground

const Root = styled.div`
  width: 100%;
  height: 100%;
  background: var(--frame-background-bg, #121212);
`

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  max-width: var(--frame-background-max-width, 668px);
  margin: 0 auto;
  height: 100%;
  display: block;
  background: var(--frame-background-bg, #121212);
`
