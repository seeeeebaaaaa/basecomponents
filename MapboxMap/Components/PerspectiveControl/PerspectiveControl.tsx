import { MapContext } from 'components/MapboxMap/Mapbox'
import { CTRLPositions } from '../../Types/mapboxtypes'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { CustomControl } from '../Utils/CreateCustomControl'

const PerspectiveControlDefaults: {
  position: CTRLPositions
  pitch3D: number
  zoom3D: number
} = {
  position: 'top-right',
  pitch3D: 60,
  zoom3D: 11,
}

/** Adds a 3D/2D perspective toggle control to the map. */
export const PerspectiveControl = ({
  position = PerspectiveControlDefaults.position,
}: {
  position?: CTRLPositions
}) => {
  const [ctrlcontainer, setCtrlcontainer] = useState<any | null>(null)
  const [control, setControl] = useState<CustomControl | undefined>(undefined)
  const {
    setTerrain,
    handlePropChange,
    map,
    terrainActive,
    setPerspectiveControl,
  } = useContext(MapContext)
  const className = 'perspective-control'
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!map || !setTerrain) return
    const existing = map.getContainer().getElementsByClassName(className)
    if (existing.length > 0) return
    setCtrlcontainer(document.createElement('div'))
  }, [map, setTerrain])

  function addControl() {
    if (!map || !setTerrain) return
    const ctrl = new CustomControl(
      setTerrain,
      map,
      <FSButton onClick={handlePropChange} />,
      className
    )
    setPerspectiveControl && setPerspectiveControl(ctrl)
    setControl(ctrl)
    map.addControl(ctrl, position)
    setAdded(true)
  }

  useEffect(() => {
    if (added) return
    addControl()
  }, [position, ctrlcontainer, terrainActive])

  return null
}

const FSButton = ({
  onClick,
}: {
  onClick?: (prop: string, value: any) => void | undefined
}) => {
  const { terrainActive } = useContext(MapContext)

  return (
    <ControlButton
      className='control-button perspective-control'
      style={{ pointerEvents: 'all', position: 'relative', width: '30px' }}
      onClick={() => onClick && onClick('perspective', !terrainActive)}
    >
      {terrainActive ? '2D' : '3D'}
    </ControlButton>
  )
}

const ControlButton = styled.button``
