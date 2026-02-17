import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { CustomControl } from '../Utils/CreateCustomControl'

/** Adds a help button (?) as a Mapbox map control. */
export const HelpControl = ({
  position = 'top-right',
}: {
  position?: CTRLPositions
}) => {
  const [ctrlcontainer, setCtrlcontainer] = useState<any | null>(null)
  const context = useContext(MapContext)
  const className = 'help-control'

  useEffect(() => {
    if (!context.map) return
    const existing = context.map
      .getContainer()
      .getElementsByClassName(className)
    if (existing.length > 0) return
    setCtrlcontainer(document.createElement('div'))
  }, [context.map])

  useEffect(() => {
    if (!context.map || !context.setShowHelp) return
    context.map.addControl(
      new CustomControl(
        context.setShowHelp,
        context.map,
        <HelpButton />,
        className
      ),
      position
    )
  }, [position, ctrlcontainer])

  return null
}

const HelpButton = () => {
  return (
    <ControlButton
      className='control-button'
      style={{ pointerEvents: 'all', position: 'relative', width: '30px' }}
    >
      ?
    </ControlButton>
  )
}

const ControlButton = styled.button``
