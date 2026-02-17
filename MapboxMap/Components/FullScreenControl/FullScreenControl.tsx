import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import FullScreen from './FullScreen'
import ExitFullScreen from './ExitFullScreen'
import { CustomControl } from '../Utils/CreateCustomControl'

/** Adds a fullscreen toggle control to the map. */
export const FullScreenControl = ({
  position = 'top-right',
}: {
  position?: CTRLPositions
}) => {
  const [on, setOn] = useState(false)
  const controlRef = useRef<CustomControl | undefined>()
  const context = useContext(MapContext)
  const className = 'fullscreen-control'

  useEffect(() => {
    if (controlRef.current) controlRef.current.action = () => setOn(!on)
    context.setFullscreen && context.setFullscreen(!context.isFullscreen)
    context.map?.resize()
    if (!on) {
      context.setIsInteractive && context.setIsInteractive(false)
    }

    // Update the button visual via React root
    controlRef.current?.root?.render(
      <div onClick={() => setOn(!on)}>
        <FSButton on={!!context.isFullscreen} />
      </div>
    )
  }, [on])

  useEffect(() => {
    if (!context.map || !context.setFullscreen || controlRef.current) return
    if (context.isMobile) return

    const c = new CustomControl(
      () => setOn((prev) => !prev),
      context.map,
      <FSButton on={on} />,
      className
    )
    context.map.addControl(c, position)
    controlRef.current = c

    return () => {
      if (controlRef.current) {
        context.map?.removeControl(controlRef.current)
        controlRef.current = undefined
      }
    }
  }, [position, context.map])

  return null
}

const FSButton = ({ on }: { on: boolean }) => {
  return (
    <ControlButton className='control-button' style={{ pointerEvents: 'all' }}>
      {!on && <FullScreen />}
      {on && <ExitFullScreen />}
    </ControlButton>
  )
}

const ControlButton = styled.button``
