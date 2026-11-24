// Cuts the background video into WebP frame sequences per segment and format, and
// writes the manifest the app reads at runtime.
//
//   bun run background                       uses background-src/segments.json
//   bun run background path/to/config.json
//
// Output: public/background/<format>/<segment>/0001.webp … and public/background/manifest.json

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

// source: own video for this format (e.g. a portrait cut for mobile), relative to the
// config file. Without it the main source is used, cropped to `aspect` if given.
// Segment times must match in all sources.
type FormatConfig = { width: number; aspect?: string; source?: string }
type SegmentConfig = {
  id: string
  mode: 'loop' | 'play' | 'scrub'
  step: number
  from?: number
  start: number | string
  end: number | string
  fps?: number
  exits?: number[]
}
type Config = {
  source: string
  fps: number
  quality?: number
  formats: Record<string, FormatConfig>
  segments: SegmentConfig[]
}

const configPath = resolve(process.argv[2] ?? 'background-src/segments.json')
const config: Config = JSON.parse(readFileSync(configPath, 'utf8'))
const outRoot = resolve('public/background')

const sourceFor = (format: FormatConfig) => {
  const source = resolve(dirname(configPath), format.source ?? config.source)
  if (!existsSync(source)) {
    console.error(`Source video not found: ${source}`)
    process.exit(1)
  }
  return source
}

const ffmpeg = (args: string[]) => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit'
  })
  if (result.status !== 0) {
    console.error(`ffmpeg failed: ffmpeg ${args.join(' ')}`)
    process.exit(result.status ?? 1)
  }
}

const filterFor = (format: FormatConfig, fps: number) => {
  const filters = [`fps=${fps}`]
  if (format.aspect) {
    const [w, h] = format.aspect.split(':').map(Number)
    filters.push(`crop='min(iw,ih*${w}/${h})':'min(ih,iw*${h}/${w})'`)
  }
  filters.push(`scale=${format.width}:-2`)
  return filters.join(',')
}

const probeSize = (file: string) => {
  const result = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file
  ])
  const [width, height] = result.stdout.toString().trim().split(',').map(Number)
  return { width, height }
}

rmSync(outRoot, { recursive: true, force: true })

const formats: Record<string, { width: number; height: number }> = {}
const frameCounts: Record<string, number[]> = {}

for (const [name, format] of Object.entries(config.formats)) {
  const source = sourceFor(format)
  for (const segment of config.segments) {
    const dir = join(outRoot, name, segment.id)
    mkdirSync(dir, { recursive: true })
    ffmpeg([
      '-i', source,
      '-ss', String(segment.start),
      '-to', String(segment.end),
      '-vf', filterFor(format, segment.fps ?? config.fps),
      '-an',
      '-c:v', 'libwebp',
      '-quality', String(config.quality ?? 70),
      join(dir, '%04d.webp')
    ])
    const frames = readdirSync(dir).filter(f => f.endsWith('.webp')).sort()
    if (!frames.length) {
      console.error(`No frames written for ${name}/${segment.id}`)
      process.exit(1)
    }
    ;(frameCounts[segment.id] ??= []).push(frames.length)
    formats[name] ??= probeSize(join(dir, frames[0]))
    console.log(`${name}/${segment.id}: ${frames.length} frames`)
  }
}

const manifest = {
  fps: config.fps,
  formats,
  segments: config.segments.map(({ id, mode, step, from, fps, exits }) => ({
    id,
    mode,
    step,
    ...(from ? { from } : {}),
    frames: Math.min(...frameCounts[id]),
    ...(fps ? { fps } : {}),
    ...(exits ? { exits } : {})
  }))
}

writeFileSync(join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`Manifest: ${join(outRoot, 'manifest.json')}`)
