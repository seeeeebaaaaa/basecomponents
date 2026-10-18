import React, { useState, type ReactNode } from 'react'
import Accordion from './Accordion'

const WIDTHS = ['TextWidth', 'TextWidthExtended', 'ContentWidth', 'ArticleWidth'] as const

const Header = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 18, fontWeight: 700, padding: '8px 0' }}>{children}</div>
)

const Body = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.85, padding: '4px 0 12px' }}>
    {children}
  </div>
)

const LONG_BODY = (
  <Body>
    Zürich ist die bevölkerungsreichste Stadt der Schweiz. Der See, die
    Bahnhofstrasse und die Langstrasse liegen ein paar Tramstationen auseinander.
    Dieser Absatz ist lang genug, damit Peek und die Öffnungsanimation sichtbar
    sind.
  </Body>
)

const Trigger = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '6px 12px',
      border: '1px solid currentColor',
      borderRadius: 6,
      fontSize: 13
    }}
  >
    {children}
  </span>
)

/** Header click and onToggle stay in sync with the open state. */
const ControlledAccordion = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button
        type='button'
        onClick={() => setIsOpen(open => !open)}
        style={{ marginBottom: 8, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }}
      >
        isOpen = {String(isOpen)}
      </button>
      <Accordion
        header={<Header>Controlled</Header>}
        content={LONG_BODY}
        isOpen={isOpen}
        onToggle={setIsOpen}
        spaceAfter={16}
        spaceBefore={0}
        gradientColor='transparent'
      />
    </div>
  )
}

const widthVariants = WIDTHS.map(width => ({
  title: `width: ${width}`,
  element: (
    <Accordion
      header={<Header>{width}</Header>}
      content={LONG_BODY}
      width={width}
      spaceAfter={16}
      spaceBefore={0}
      gradientColor='transparent'
    />
  )
}))

/** Every open, peek and layout option of Accordion, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'Default',
    description: 'Click the header. Closed, no peek, 300ms, 50px spaceAfter.',
    element: (
      <Accordion
        header={<Header>So öffnet man den Text</Header>}
        content={LONG_BODY}
        spaceAfter={16}
        gradientColor='transparent'
      />
    )
  },
  {
    title: 'defaultOpen',
    element: (
      <Accordion
        header={<Header>Schon offen</Header>}
        content={LONG_BODY}
        defaultOpen
        spaceAfter={16}
        gradientColor='transparent'
      />
    )
  },
  {
    title: 'showPeek',
    description: 'peekHeight 50 (default). The fade uses gradientColor.',
    element: (
      <Accordion
        header={<Header>Ein Blick ins Innere</Header>}
        content={LONG_BODY}
        showPeek
        spaceAfter={16}
        gradientColor='Canvas'
      />
    )
  },
  {
    title: 'peekHeight 90',
    element: (
      <Accordion
        header={<Header>Höherer Peek</Header>}
        content={LONG_BODY}
        showPeek
        peekHeight={90}
        spaceAfter={16}
        gradientColor='Canvas'
      />
    )
  },
  {
    title: 'Custom trigger',
    description: 'Header is not clickable; the trigger below toggles.',
    element: (
      <Accordion
        header={<Header>Nur über den Button</Header>}
        content={LONG_BODY}
        trigger={<Trigger>Mehr anzeigen</Trigger>}
        spaceAfter={16}
        gradientColor='transparent'
      />
    )
  },
  {
    title: 'Trigger as function',
    element: (
      <Accordion
        header={<Header>Label folgt dem Zustand</Header>}
        content={LONG_BODY}
        trigger={isOpen => (
          <Trigger>{isOpen ? 'Weniger anzeigen' : 'Mehr anzeigen'}</Trigger>
        )}
        spaceAfter={16}
        gradientColor='transparent'
      />
    )
  },
  {
    title: 'Controlled isOpen',
    element: <ControlledAccordion />
  },
  {
    title: 'animationDuration 80',
    element: (
      <Accordion
        header={<Header>Schneller</Header>}
        content={LONG_BODY}
        animationDuration={80}
        spaceAfter={16}
        gradientColor='transparent'
      />
    )
  },
  ...widthVariants,
  {
    title: 'spaceBefore / spaceAfter',
    element: (
      <Accordion
        header={<Header>Abstand oben und unten</Header>}
        content={LONG_BODY}
        spaceBefore={24}
        spaceAfter={48}
        gradientColor='transparent'
      />
    )
  }
]
