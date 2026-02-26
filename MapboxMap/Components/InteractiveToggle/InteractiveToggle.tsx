import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { HelpToggle } from '../HelpToggle'

const InteractiveToggleDefaults: {
  labelOn: string
  labelOff: string
} = {
  labelOn: 'Karte aktivieren',
  labelOff: 'Karte deaktivieren'
}

/** Toggles map interactivity. When cooperativeGestures is true, uses native Mapbox overlay instead. */
export const InteractiveToggle = ({
  isOutside = false,
  onDeactivate,
  cooperativeGestures: cooperativeGesturesProp = false
}: {
  isOutside?: boolean
  onDeactivate?: () => void
  cooperativeGestures?: boolean
}) => {
  var { isInteractive, handlePropChange, isMobile, setCooperativeGestures } = useContext(MapContext)

  useEffect(() => {
    setCooperativeGestures?.(cooperativeGesturesProp)
  }, [cooperativeGesturesProp, setCooperativeGestures])

  if (cooperativeGesturesProp) return null

  return (
    <InteractiveToggleArea $isOutside={isOutside} className='interactive-toggle-area'>
      <InteractiveToggleRoot
        $isOutside={isOutside}
        $isInteractive={!!isInteractive}
        onClick={() => {
          handlePropChange && handlePropChange('interaction', !isInteractive)
          if (isInteractive) {
            onDeactivate && onDeactivate()
          }
        }}
        style={{
          left: isMobile ? 'calc(50% - 20px)' : '50%'
        }}
      >
        {isInteractive
          ? InteractiveToggleDefaults.labelOff
          : InteractiveToggleDefaults.labelOn}
      </InteractiveToggleRoot>
      {isInteractive && <HelpToggle />}
    </InteractiveToggleArea>
  )
}

const InteractiveToggleArea = styled.div<{
  $isOutside: boolean
}>`
  z-index: 4;
  position: ${props => (props.$isOutside ? '' : 'absolute')};
  margin-top: ${props => (props.$isOutside ? '10px' : '0px')};
  bottom: 35px;
  width: 100%;
  display: flex;
  justify-content: center;
`

const InteractiveToggleRoot = styled.button<{
  $isInteractive: boolean
  $isOutside: boolean
}>`
  margin-right: 5px;
  border: 0;
  font-size: 15px;

  color: ${props => (props.$isInteractive ? '#fff' : 'var(--site-background)')};

  background-color: ${props =>
    props.$isInteractive ? 'var(--red-main)' : 'var(--text-color)'};
  width: 220px;
  padding: 18px 20px 15px 20px;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  @media screen and (max-width: 711px) {
    font-size: 13px;
    padding: 10px 10px 10px 10px;
    width: 200px;
  }
  @media screen and (min-width: 712px) {
    &:hover {
      cursor: pointer;
      background-color: ${props =>
        props.$isInteractive ? 'var(--red-bright-1)' : 'var(--brandblue-main)'};
      color: #fff;
    }
  }
`
