import React from 'react'
import {
  cloneElement,
  isValidElement,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import styled from 'styled-components'
import { useResizeObserver } from 'usehooks-ts'



interface BaseAnnotation {
  pos: {
    x: number
    y: number
  }
  id?: string
}

interface CustomAnnotation extends BaseAnnotation {
  type: 'custom'
  content: React.ReactNode
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  hide?: boolean
}

interface StandardAnnotation extends BaseAnnotation {
  type?: never
  hide?: boolean
  content: React.ReactNode
}

export type Annotation = CustomAnnotation | StandardAnnotation






export interface AnnotatedContentProps {
  children: ReactNode
  annotations: Array<Annotation>
  className?: string
  shapeStyle?: ShapeStyle
  connectorStyle?: ConnectorSpecs
  style?: React.CSSProperties
}

const isDev = window.location.hostname === 'localhost'

/** Derives a stable key from img srcs in the content so we re-run load logic when images change. */
function getContentKey(container: HTMLElement | null): string {
  if (!container) return ''
  const imgs = container.querySelectorAll('img')
  if (imgs.length === 0) return '__no_imgs__'
  return Array.from(imgs)
    .map((img) => img.getAttribute('src') || img.src)
    .join('|')
}

export const AnnotatedContent = ({
  children,
  annotations = [],
  className = '',
  connectorStyle,
  shapeStyle = {},
  style,
}: AnnotatedContentProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentKey, setContentKey] = useState('')
  const [contentLoaded, setContentLoaded] = useState(false)

  const { width = 0, height = 0 } = useResizeObserver({
    ref: ref as React.RefObject<HTMLElement>,
    box: 'border-box',
  })

  useLayoutEffect(() => {
    const key = getContentKey(contentRef.current)
    setContentKey((prev) => (prev === key ? prev : key))
  })

  useEffect(() => {
    if (!contentKey) return
    const el = contentRef.current
    if (!el) return
    const imgs = Array.from(el.querySelectorAll('img'))
    if (imgs.length === 0) {
      setContentLoaded(true)
      return
    }
    setContentLoaded(false)
    const checkAllLoaded = () => {
      if (imgs.every((img) => img.complete)) setContentLoaded(true)
    }
    const handleError = (e: Event) => {
      const img = e.target as HTMLImageElement
      console.error(
        '[AnnotatedContent] Image failed to load:',
        img.src || img.getAttribute('src')
      )
    }
    imgs.forEach((img) => {
      if (img.complete) checkAllLoaded()
      else {
        img.addEventListener('load', checkAllLoaded)
        img.addEventListener('error', handleError)
      }
    })
    return () => {
      imgs.forEach((img) => {
        img.removeEventListener('load', checkAllLoaded)
        img.removeEventListener('error', handleError)
      })
    }
  }, [contentKey])

  // Only render annotations when container has been measured and content (e.g. images) has loaded
  const showAnnotations = width > 0 && height > 0 && contentLoaded

  const validateAnnotation = useCallback((annotation: Annotation): boolean => {
    if (annotation.hide) return false
    return (
      annotation.pos.x >= 0 &&
      annotation.pos.x <= 100 &&
      annotation.pos.y >= 0 &&
      annotation.pos.y <= 100
    )
  }, [])

  const renderAnnotation = useCallback(
    (annotation: Annotation, index: number) => {
    const basePosition = {
      position: 'absolute',
      left: `${annotation.pos.x}%`,
      top: `${annotation.pos.y}%`,
      zIndex: 1000,
    } as const

    // If type is explicitly set to 'custom', render as custom annotation
    if (annotation.type === 'custom') {
      return (
        <div
          key={annotation.id ?? index}
          className={annotation.className}
          style={{
            ...basePosition,
            transform: 'translate(-50%, -50%)',
            ...annotation.style,
          }}
        >
          {annotation.content}
        </div>
      )
    }

    // Clone the content element if it's a valid element and inject global styles
    if (isValidElement(annotation.content)) {
      const elementProps = annotation.content.props as {
        connectorStyle?: Record<string, any>;
        shapeStyle?: Record<string, any>;
        [key: string]: any;
      }
      return (
        <div key={annotation.id ?? index} style={basePosition}>
          {cloneElement(annotation.content as React.ReactElement<any>, {
            ...elementProps,
            connectorStyle: {
              ...connectorStyle,
              ...elementProps.connectorStyle,
            },
            shapeStyle: {
              ...shapeStyle,
              ...elementProps.shapeStyle,
            },
            fullSize: [width, height],
          })}
        </div>
      )
    }

    return (
      <div key={annotation.id ?? index} style={basePosition}>
        {annotation.content}
      </div>
    )
    },
    [connectorStyle, shapeStyle, width, height]
  )

  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDev) return
    if (!e.shiftKey) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      console.log(`{ x: ${x.toFixed(2)}, y: ${y.toFixed(2)} },`)
    }
  }, [])

  return (
    <AnnotatedContentContainer
      ref={ref}
      style={style}
      className={`annotated-content ${className}`.trim()}
      onClick={isDev ? handleContainerClick : undefined}
      aria-busy={!contentLoaded}
    >
      <div ref={contentRef} style={{ display: 'contents' }}>{children}</div>
      {showAnnotations && annotations.filter(validateAnnotation).map(renderAnnotation)}
    </AnnotatedContentContainer>
  )
}

const AnnotatedContentContainer = styled.div`
  position: relative;
  display: inline-block;
  line-height: 0;
  width: 100%;
  * {
    line-height: 1.2em;
  }
  .annotated-content__image {
    height: auto;
    display: block;
  }
`
