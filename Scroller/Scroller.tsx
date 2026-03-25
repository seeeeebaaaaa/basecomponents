import React, { useState } from 'react'
import { CONFIG } from './config'
import styled from 'styled-components'
import { Waypoint } from 'react-waypoint'
import { getStickyHeaderHeight } from '@ta-interaktiv/utils'
/**
 * Component for Scrollytelling
 *
 * Elements for front layer
 * @prop {React.ReactNode[]} front
 *
 * Function returning background layer element
 * index = current visible front layer element
 * @prop {( index:Number, id:String )=> React.ReactChild } back
 *
 *
 * @returns { React.Element } React Component
 */

export const Scroller = ({
  front,
  back,
  defaultDistance = CONFIG.defaultDistance,
  className
}: {
  front: JSX.Element[]
  back: (index: number, id: string) => JSX.Element
  defaultDistance?: number
  className?: string
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentID =
    front[currentIndex] &&
    front[currentIndex].props &&
    front[currentIndex].props.id &&
    front[currentIndex].props?.id

  return (
    <StyledScroller className={'Scroller ' + className} id='scroller'>
      <div className='back' id='back'>
        {back(currentIndex, currentID)}
      </div>
      <div className='front'>
        {front.map((element, i) => {
          const dbottom =
            element.props.distanceBottom === 0
              ? 0
              : element.props.distanceBottom || defaultDistance || 1
          const dtop =
            element.props.distanceTop === 0
              ? 0
              : element.props.distanceTop || defaultDistance || 1
          return (
            <React.Fragment key={'Front_' + i}>
              <Spacer style={{ minHeight: dtop + 'px' }} />
              <Waypoint
                scrollableAncestor={window}
                onEnter={() => setCurrentIndex(i)}
                onLeave={e => {
                  const newindex = i + (e.currentPosition === 'below' ? -1 : 1)
                  setCurrentIndex(
                    newindex > front.length
                      ? front.length
                      : newindex < 0
                      ? 0
                      : newindex
                  )
                }}
              >
                <div>{element}</div>
              </Waypoint>
              <Spacer style={{ minHeight: dbottom + 'px' }} />
            </React.Fragment>
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
