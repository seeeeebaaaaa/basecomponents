import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import FullScreen from './FullScreen'
import ExitFullScreen from './ExitFullScreen'
import { CustomControl } from '../Utils/CreateCustomControl'

/** Adds a pitch toggle (fullscreen-style) control to the map. */
export const PitchToggle = ({
  position = 'top-right',
}: {
  position?: CTRLPositions
}) => {
  const [ctrlcontainer, setCtrlcontainer] = useState<any | null>(null)
  const context = useContext(MapContext)
  const className = 'fullscreen-control'

  useEffect(() => {
    if (!context.map || !context.setFullscreen || context.isMobile) return
    const existing = context.map
      .getContainer()
      .getElementsByClassName(className)
    if (existing.length > 0) return
    setCtrlcontainer(document.createElement('div'))
  }, [context.map, context.setFullscreen])

  useEffect(() => {
    if (!context.map || !context.setFullscreen || context.isMobile) return
    context.map.addControl(
      new CustomControl(
        context.setFullscreen,
        context.map,
        <FSButton />,
        className
      ),
      position
    )
  }, [position, ctrlcontainer])

  return null
}

const FSButton = () => {
  const [active, setActive] = useState(false)

  return (
    <ControlButton
      className='control-button'
      style={{ pointerEvents: 'all' }}
      onClick={() => setActive(!active)}
    >
      {!active && <FullScreen onClick={() => setActive(!active)} />}
      {active && <ExitFullScreen onClick={() => setActive(active)} />}
    </ControlButton>
  )
}

const ControlButton = styled.button``
