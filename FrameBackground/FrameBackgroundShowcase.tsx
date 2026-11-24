import { type ReactNode } from 'react'
import { createGlobalStyle } from 'styled-components'
import { Scroller } from '../Scroller'
import { FrameBackground } from './FrameBackground'

const PLAY_CLASS = 'showcase-frame-background-play'

/**
 * Gallery scrolls a light-DOM pane; Scroller lives in the shadow tree.
 * Sticky only sees scrollports inside that tree, so the scroller root must scroll.
 */
const PlayStyle = createGlobalStyle`
  .${PLAY_CLASS} {
    height: 70vh;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    transform: none;
  }

  .${PLAY_CLASS} .back {
    transform: none;
  }

  .${PLAY_CLASS} .back,
  .${PLAY_CLASS} .back > * {
    box-sizing: border-box;
    min-height: 70vh;
  }
`

const STEPS = [
  {
    id: 'orbit',
    title: 'Orbit',
    body: 'Scrub segment: scroll progress maps directly onto the frame range.'
  },
  {
    id: 'wechsel',
    title: 'Wechsel',
    body: 'Play segment: plays through once when this step becomes active.'
  },
  {
    id: 'kapsel',
    title: 'Kapsel',
    body: 'Loop segment: holds and loops until you leave the step.'
  }
]

/** Front card. id / distanceTop / distanceBottom stay on props so Scroller can read them. */
const StepCard = ({
  id,
  children
}: {
  id?: string
  children: ReactNode
  distanceTop?: number
  distanceBottom?: number
}) => (
  <div
    id={id}
    style={{
      maxWidth: 360,
      margin: '0 auto',
      padding: '16px 18px',
      background: 'rgba(255, 255, 255, 0.94)',
      color: '#1a1a1a',
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      pointerEvents: 'auto'
    }}
  >
    {children}
  </div>
)

const front = STEPS.map(step => (
  <StepCard key={step.id} id={step.id} distanceTop={280} distanceBottom={280}>
    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{step.title}</div>
    <div style={{ fontSize: 14, lineHeight: 1.45, opacity: 0.8 }}>{step.body}</div>
  </StepCard>
))

/** Scroll-driven frame background inside a sticky Scroller back slot. */
const ScrollyDemo = ({ debug = false }: { debug?: boolean }) => (
  <>
    <PlayStyle />
    <Scroller
      className={PLAY_CLASS}
      defaultDistance={280}
      front={front}
      back={(_index, _id, getPosition) => (
        <div style={{ position: 'relative', minHeight: '70vh', height: '70vh' }}>
          <FrameBackground getPosition={getPosition} debug={debug} />
        </div>
      )}
    />
  </>
)

/** Needs `public/background/manifest.json` + WebP frames (see build-background.ts). */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description:
      'Scroller drives getPosition; FrameBackground plays loop / play / scrub segments from public/background. Build frames with FrameBackground/build-background.ts.',
    element: <ScrollyDemo />
  },
  {
    title: 'debug',
    description: 'Overlay shows active segment, frame and scroll step/progress.',
    element: <ScrollyDemo debug />
  }
]
