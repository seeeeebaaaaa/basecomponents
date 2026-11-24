import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG } from './config'
import styled from 'styled-components'
import { getStickyHeaderHeight } from '@ta-interaktiv/utils'
/**
 * Component for Scrollytelling
 *
 * Elements for front layer
 * @prop {React.ReactNode[]} front
 *
 * Function returning background layer element
 * index = current visible front layer element
 * getPosition = returns the exact scroll position, see ScrollPosition. Cheap to call on
 * every animation frame; it does not trigger React renders.
 * @prop {( index:Number, id:String, getPosition:() => ScrollPosition )=> React.ReactChild } back
 *
 * Position of the trigger line as a fraction of the viewport height (0 = top, 1 = bottom).
 * A front element becomes active once its top edge crosses this line.
 * @prop {number} offset
 *
 * @returns { React.Element } React Component
 */

// step: index of the region the trigger line is in. -1 = above the first region (page
// top down to the first element), front.length - 1 is kept below the scroller.
// progress: 0–1 within that step. For step -1 it runs from page top (0) to the
// first region (1).
export type ScrollPosition = { step: number; progress: number }

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

const distance = (value: number | undefined, defaultDistance: number) =>
  value === 0 ? 0 : value || defaultDistance || 1

const useViewportHeight = () => {
  const [height, setHeight] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerHeight
  )
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return height
}

export const Scroller = ({
  front,
  back,
  defaultDistance = CONFIG.defaultDistance,
  className,
  offset = 0.5
}: {
  front: JSX.Element[]
  back: (index: number, id: string, getPosition: () => ScrollPosition) => JSX.Element
  defaultDistance?: number
  className?: string
  offset?: number
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const viewportHeight = useViewportHeight()
  const currentID = front[currentIndex]?.props?.id
  const stepCount = front.length

  const getPosition = useCallback((): ScrollPosition => {
    const line = window.innerHeight * offset
    const regions = stepRefs.current.slice(0, stepCount)
    const first = regions[0]
    if (!first) return { step: -1, progress: 0 }

    const firstTop = first.getBoundingClientRect().top
    if (firstTop > line) {
      const distanceToStart = firstTop - line + window.scrollY
      return { step: -1, progress: distanceToStart > 0 ? clamp01(window.scrollY / distanceToStart) : 1 }
    }
    for (let i = regions.length - 1; i >= 0; i--) {
      const rect = regions[i]?.getBoundingClientRect()
      if (rect && rect.top <= line) {
        return { step: i, progress: rect.height ? clamp01((line - rect.top) / rect.height) : 1 }
      }
    }
    return { step: -1, progress: 1 }
  }, [offset, stepCount])

  // Each step region spans its element plus the gaps up to the next element, so the
  // regions tile the scroller without holes. The trigger line therefore always sits in
  // exactly one region, and a fast scroll that skips steps still lands on the right one.
  useEffect(() => {
    if (!viewportHeight) return
    const line = Math.round(viewportHeight * offset)
    const intersecting = new Set<number>()

    const observer = new IntersectionObserver(
      entries => {
        let lastLeft: IntersectionObserverEntry | undefined
        for (const entry of entries) {
          const step = Number((entry.target as HTMLElement).dataset.step)
          if (entry.isIntersecting) intersecting.add(step)
          else {
            intersecting.delete(step)
            lastLeft = entry
          }
        }
        if (intersecting.size) setCurrentIndex(Math.max(...intersecting))
        else if (lastLeft)
          setCurrentIndex(lastLeft.boundingClientRect.top > line ? 0 : front.length - 1)
      },
      { rootMargin: `-${line}px 0px -${Math.max(viewportHeight - line - 1, 0)}px 0px`,scrollMargin: `${line}px` }
    )

    stepRefs.current.slice(0, front.length).forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [viewportHeight, offset, front.length])

  return (
    <StyledScroller className={'Scroller' + (className ? ' ' + className : '')} id='scroller'>
      <div className='back' id='back'>
        {back(currentIndex, currentID, getPosition)}
      </div>
      <div className='front'>
        {front.length > 0 && (
          <Spacer
            style={{ minHeight: distance(front[0].props.distanceTop, defaultDistance) + 'px' }}
          />
        )}
        {front.map((element, i) => {
          const next = front[i + 1]
          return (
            <div
              key={'Front_' + i}
              data-step={i}
              ref={el => {
                stepRefs.current[i] = el
              }}
            >
              <div>{element}</div>
              <Spacer
                style={{
                  minHeight: distance(element.props.distanceBottom, defaultDistance) + 'px'
                }}
              />
              {next && (
                <Spacer
                  style={{ minHeight: distance(next.props.distanceTop, defaultDistance) + 'px' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </StyledScroller>
  )
}

export const FrontElement = styled.div<{
  $distanceTop?: number
  $distanceBottom?: number
}>``

const Spacer = styled.div`pointer-events: none;`

const StyledScroller = styled.div<{
  $distanceTop?: number
  $distanceBottom?: number
}>`
  // fix for shaking while scrolling in safari
  transform: translateZ(0);
  backface-visibility: hidden;

  position: relative;
  display: block;
  z-index: 0;
  .back {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    z-index: 0;
    position: sticky;
    top: ${getStickyHeaderHeight()}px;
    bottom: 0;
  }

  .front {
    -webkit-transform: translate3d(0, 0, 100px);
    transform: translate3d(0, 0, 100px);
    pointer-events: none;
    position: relative;
    z-index: 1001;
    width: 100%;
  }
`
