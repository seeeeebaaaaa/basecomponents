import styled from 'styled-components'
import { MapContext } from '../../Mapbox'
import { useContext, useEffect, useState } from 'react'

const PerspectiveControl = () => {
  var [label, setLabel] = useState<string>('3D')
  var { terrainActive, handlePropChange } = useContext(MapContext)

  useEffect(() => {
    if (terrainActive) {
      setLabel('2D')
    } else {
      setLabel('3D')
    }
  }, [terrainActive])
  
  return (
    <PerspectiveControl2Container
      onClick={() => {
        handlePropChange && handlePropChange('perspective', !terrainActive)
      }}
    >
      {label}
    </PerspectiveControl2Container>
  )
}
const PerspectiveControl2Container = styled.button`
  position: absolute;
  top: 108px;
  right: 19px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  background-color: #f00;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  border:0;
`

export default PerspectiveControl
