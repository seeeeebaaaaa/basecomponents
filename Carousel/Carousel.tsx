import React, { useRef, useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'

type CarouselProps = {
  /** Elements to render inside the carousel */
  elements: JSX.Element[]
  /** Height of the carousel in px. Default: 300 */
  height?: number
  /** Enable snap-scroll page mode. Default: false = free horizontal scroll */
  snap?: boolean
  /** Controlled current index (snap mode only). Must be used with onIndexChange. */
  index?: number
  /** Called when visible slide changes (snap mode only). Must be used with index. */
  onIndexChange?: (index: number) => void
  /** Optional className forwarded to the outer wrapper */
  className?: string
}

export const Carousel = ({
  elements,
  height = 300,
  snap = false,
  index: controlledIndex,
  onIndexChange,
  className
}: CarouselProps) => {
  const isControlled =
    controlledIndex !== undefined && onIndexChange !== undefined
  const [internalIndex, setInternalIndex] = useState(0)
  const currentIndex = isControlled ? controlledIndex : internalIndex

  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  slideRefs.current = slideRefs.current.slice(0, elements.length)

  // Keep onIndexChange in a ref so the observer never goes stale
  const onIndexChangeRef = useRef(onIndexChange)
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange
  }, [onIndexChange])

  const scrollToIndex = useCallback((i: number) => {
    const slide = slideRefs.current[i]
    if (!slide || !trackRef.current) return
    trackRef.current.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
  }, [])

  // IntersectionObserver: detect which slide is current (snap mode only)
  useEffect(() => {
    if (!snap) return
    const track = trackRef.current
    if (!track) return

    const observers = slideRefs.current.map((slide, i) => {
      if (!slide) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          if (isControlled) {
            onIndexChangeRef.current?.(i)
          } else {
            setInternalIndex(i)
          }
        },
        { root: track, threshold: 0.5 }
      )
      obs.observe(slide)
      return obs
    })

    return () => observers.forEach(obs => obs?.disconnect())
  }, [snap, isControlled])

  // Note: in controlled mode, programmatic scrolls via scrollToIndex also trigger the
  // IntersectionObserver, which fires onIndexChange again. In typical useState usage
  // this is safe (setting the same value is a no-op). If onIndexChange has side effects
  // (analytics, network calls), consumers should debounce or deduplicate externally.
  useEffect(() => {
    if (!isControlled || !snap) return
    scrollToIndex(controlledIndex)
  }, [controlledIndex, isControlled, snap, scrollToIndex])

  const goTo = useCallback(
    (i: number) => {
      scrollToIndex(i)
      if (!isControlled) setInternalIndex(i)
    },
    [isControlled, scrollToIndex]
  )

  const prev = useCallback(
    () => goTo(Math.max(0, currentIndex - 1)),
    [currentIndex, goTo]
  )
  const next = useCallback(
    () => goTo(Math.min(elements.length - 1, currentIndex + 1)),
    [currentIndex, elements.length, goTo]
  )

  return (
    <Wrapper className={'Carousel ' + (className ?? '')}>
      <ButtonRow>
        {snap && !isControlled && (
          <ArrowButton
            onClick={prev}
            disabled={currentIndex === 0}
            aria-label='Previous slide'
          >
            &#8249;
          </ArrowButton>
        )}{' '}
        {snap && !isControlled && (
          <Dots>
            {elements.map((_, i) => (
              <Dot
                key={i}
                $active={i === currentIndex}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === currentIndex ? true : undefined}
              />
            ))}
          </Dots>
        )}
        {snap && !isControlled && (
          <ArrowButton
            onClick={next}
            disabled={currentIndex === elements.length - 1}
            aria-label='Next slide'
          >
            &#8250;
          </ArrowButton>
        )}
      </ButtonRow>
      <TrackRow>
        <Track ref={trackRef} $snap={snap} $height={height}>
          {elements.map((el, i) => (
            <Slide
              key={i}
              ref={el => {
                slideRefs.current[i] = el
              }}
              $snap={snap}
            >
              {el}
            </Slide>
          ))}
        </Track>
      </TrackRow>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`

const Track = styled.div<{ $snap: boolean; $height: number }>`
  display: flex;
  height: ${({ $height }) => $height}px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  ${({ $snap }) =>
    $snap &&
    `
    scroll-snap-type: x mandatory;
  `}
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`

const Slide = styled.div<{ $snap: boolean }>`
  flex-shrink: 0;
  height: 100%;
  ${({ $snap }) =>
    $snap &&
    `
    min-width: 100%;
    scroll-snap-align: start;
  `}
`

const TrackRow = styled.div`
  display: flex;
  align-items: center;
`

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 30px;
`
const ArrowButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 44px;
  line-height: 1;

  width: 44px;
  color: inherit;
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
  @media (max-width: 768px) {
    display: none;
  }
`

const Dots = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
`

const Dot = styled.button<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ $active }) =>
    $active ? 'var(--brandblue-main)' : 'var(--brandblue-main)'};
  opacity: ${({ $active }) => ($active ? 1 : 0.2)};
  transition: opacity 0.2s;
`
