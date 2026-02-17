import { MapContext } from 'components/MapboxMap/Mapbox'
import { ReactNode, useContext } from 'react'
import styled from 'styled-components'

export const Overlay = ({ children }: { children: ReactNode }) => {
  const context = useContext(MapContext)
  const { isMobile } = context

  return (
    <OverlayRoot className="overlay"style={{ width: isMobile ? 'calc(100% - 40px)' : '100%' }}>
      {children}
    </OverlayRoot>
  )
}

const OverlayRoot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  /* width: 100%; */
  height: 100%;
  pointer-events: none;
  * {
    pointer-events: all;
  }
  @media screen and (max-width: 711px) {
    
  
  max-width: 300px;
}`
