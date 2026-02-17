import styled from 'styled-components'
import ClickAndDrag from './ClickAndDrag'

/** Tooltip showing a click-and-drag hint icon beside the map. */
export const UITooltip = () => {
  return (
    <Tooltip>
      <ClickAndDrag />
    </Tooltip>
  )
}

const Tooltip = styled.div`
  background-color: #f00;
  position: absolute;
  top: 50%;
  left: -64px;
  width: 40px;
  transform: translateY(-50%);
  height: 32px;
  display: inline-block;
  padding: 8px;
  svg {
    max-width: 32px;
  }
`
