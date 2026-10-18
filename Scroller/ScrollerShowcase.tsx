import React, { type ReactNode } from 'react'
import { createGlobalStyle } from 'styled-components'
import { FrontElement, Scroller } from './Scroller'

const PLAY_CLASS = 'showcase-scroller-play'

/**
 * The gallery scrolls a light-DOM pane; Scroller lives in the shadow tree.
 * Sticky and Waypoint only see scrollports inside that tree, and Scroller's
 * own transform makes *itself* the sticky containing block. So the scroller
 * root has to be the thing that scrolls.
 */
const PlayStyle = createGlobalStyle`
  .${PLAY_CLASS} {
    height: 70vh;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    /* Scroller uses translateZ(0) as a Safari shake fix; that also makes
       the root the sticky containing block, so it must be the scrollport. */
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

const ScrollerPlay = ({
  className,
  ...props
}: {
  front: JSX.Element[]
  back: (index: number, id: string) => JSX.Element
  defaultDistance?: number
  className?: string
}) => (
  <>
    <PlayStyle />
    <Scroller
      {...props}
      className={[PLAY_CLASS, className].filter(Boolean).join(' ')}
    />
  </>
)

type Step = {
  id: string
  title: string
  body: string
  color: string
}

const STEPS: Step[] = [
  {
    id: 'zh',
    title: 'Zürich',
    body: 'The first card sets the sticky background. Keep scrolling to change the back layer.',
    color: '#3498db'
  },
  {
    id: 'be',
    title: 'Bern',
    body: 'back(index, id) re-renders with the active front card. The map — here a colour field — stays put.',
    color: '#2ecc71'
  },
  {
    id: 'ge',
    title: 'Genève',
    body: 'Each card is wrapped in a Waypoint. Entering it updates the current index.',
    color: '#e74c3c'
  },
  {
    id: 'bs',
    title: 'Basel',
    body: 'Last step. Scroll back up and the background walks through the cards in reverse.',
    color: '#9b59b6'
  }
]

const SHORT_STEPS = STEPS.slice(0, 2)

/** Front card. id / distanceTop / distanceBottom stay on props so Scroller can read them. */
const StepCard = ({
  id,
  children
}: {
  id?: string
  children: ReactNode
  distanceTop?: number
  distanceBottom?: number
}) => <Card id={id}>{children}</Card>

/** Sticky back layer — colour and label follow the active front index. */
const BackPanel = ({ index, id, steps }: { index: number; id: string; steps: Step[] }) => {
  const step = steps[index] ?? steps[0]
  return (
    <Back $color={step.color}>
      <BackKicker>{id || step.id}</BackKicker>
      <BackTitle>{step.title}</BackTitle>
      <BackMeta>
        {index + 1} / {steps.length}
      </BackMeta>
    </Back>
  )
}

const Card = ({ id, children }: { id?: string; children: ReactNode }) => (
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

const Back = ({
  $color,
  children
}: {
  $color: string
  children: ReactNode
}) => (
  <div
    style={{
      minHeight: '52vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: 24,
      background: $color,
      color: '#fff',
      transition: 'background 280ms ease'
    }}
  >
    {children}
  </div>
)

const BackKicker = ({ children }: { children: ReactNode }) => (
  <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>
    {children}
  </span>
)

const BackTitle = ({ children }: { children: ReactNode }) => (
  <strong style={{ fontSize: 32, lineHeight: 1.15, marginTop: 4 }}>{children}</strong>
)

const BackMeta = ({ children }: { children: ReactNode }) => (
  <span style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>{children}</span>
)

const Title = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{children}</div>
)

const Body = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 14, lineHeight: 1.45, opacity: 0.8 }}>{children}</div>
)

/** Builds the front-card list Scroller expects. */
const frontFrom = (steps: Step[], distances?: { top?: number; bottom?: number }) =>
  steps.map(step => (
    <StepCard
      key={step.id}
      id={step.id}
      distanceTop={distances?.top}
      distanceBottom={distances?.bottom}
    >
      <Title>{step.title}</Title>
      <Body>{step.body}</Body>
    </StepCard>
  ))

/** Every layout option of Scroller, one labelled scrolly each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description:
      'Scroll inside the frame. The back stays put; cards slide over it. defaultDistance is 160 here (config default is 500).',
    element: (
      <ScrollerPlay
        defaultDistance={160}
        front={frontFrom(STEPS)}
        back={(index, id) => <BackPanel index={index} id={id} steps={STEPS} />}
      />
    )
  },
  {
    title: 'defaultDistance 80',
    description: 'Tight gaps between cards — the back switches sooner.',
    element: (
      <ScrollerPlay
        defaultDistance={80}
        front={frontFrom(SHORT_STEPS)}
        back={(index, id) => <BackPanel index={index} id={id} steps={SHORT_STEPS} />}
      />
    )
  },
  {
    title: 'defaultDistance 280',
    description: 'Longer travel between cards, closer to the 500px config default.',
    element: (
      <ScrollerPlay
        defaultDistance={280}
        front={frontFrom(SHORT_STEPS)}
        back={(index, id) => <BackPanel index={index} id={id} steps={SHORT_STEPS} />}
      />
    )
  },
  {
    title: 'Per-card distanceTop / distanceBottom',
    description: 'First card is tight (40/40), second is loose (200/200).',
    element: (
      <ScrollerPlay
        defaultDistance={160}
        front={[
          <StepCard key='zh' id='zh' distanceTop={40} distanceBottom={40}>
            <Title>Zürich · tight</Title>
            <Body>distanceTop and distanceBottom are 40.</Body>
          </StepCard>,
          <StepCard key='be' id='be' distanceTop={200} distanceBottom={200}>
            <Title>Bern · loose</Title>
            <Body>distanceTop and distanceBottom are 200.</Body>
          </StepCard>
        ]}
        back={(index, id) => <BackPanel index={index} id={id} steps={SHORT_STEPS} />}
      />
    )
  },
  {
    title: 'back(index, id)',
    description: 'The second argument is the active card’s id prop.',
    element: (
      <ScrollerPlay
        defaultDistance={140}
        front={frontFrom(STEPS)}
        back={(index, id) => (
          <Back $color={STEPS[index]?.color ?? '#333'}>
            <BackKicker>back(index, id)</BackKicker>
            <BackTitle>
              {index} · {id || '—'}
            </BackTitle>
            <BackMeta>{STEPS[index]?.title}</BackMeta>
          </Back>
        )}
      />
    )
  },
  {
    title: 'FrontElement',
    description: 'The styled export. distance* still have to live on the element props Scroller reads.',
    element: (
      <ScrollerPlay
        defaultDistance={140}
        front={SHORT_STEPS.map(step => (
          <FrontElement key={step.id} id={step.id}>
            <Card>
              <Title>{step.title}</Title>
              <Body>{step.body}</Body>
            </Card>
          </FrontElement>
        ))}
        back={(index, id) => <BackPanel index={index} id={id} steps={SHORT_STEPS} />}
      />
    )
  },
  {
    title: 'className',
    element: (
      <ScrollerPlay
        className='showcase-scroller'
        defaultDistance={140}
        front={frontFrom(SHORT_STEPS)}
        back={(index, id) => <BackPanel index={index} id={id} steps={SHORT_STEPS} />}
      />
    )
  }
]
