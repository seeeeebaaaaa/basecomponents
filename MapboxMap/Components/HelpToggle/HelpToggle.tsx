import { MapContext } from 'components/MapboxMap/Mapbox'
import { useContext } from 'react'
import styled from 'styled-components'

const HelpToggleDefaults = {
  labelOn: '?',
  labelOff: '?',
} as const

/** Toggle button that shows/hides the help panel. */
export const HelpToggle = ({
  isOutside = false,
}: {
  isOutside?: boolean
}) => {
  const { helpVisible, setShowHelp, isMobile } = useContext(MapContext)

  return (
    <HelpToggleRoot
      isOutside={isOutside}
      $helpVisible={!!helpVisible}
      onClick={() => {
        setShowHelp && setShowHelp(!helpVisible)
      }}
      style={{
        left: isMobile ? 'calc(50% - 20px)' : '50%',
      }}
    >
      {helpVisible
        ? HelpToggleDefaults.labelOff
        : HelpToggleDefaults.labelOn}
    </HelpToggleRoot>
  )
}

const HelpToggleRoot = styled.button<{
  $helpVisible: boolean
  isOutside: boolean
}>`
  border: 0;
  font-size: 15px;
  color: ${(props) =>
    props.$helpVisible ? 'var(--red-main)' : 'var(--brandblue-main)'};
  width: 60px;
  background-color: var(--gray-4);
  padding: 18px 20px 15px 20px;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  @media screen and (max-width: 711px) {
    font-size: 13px;
    padding: 0px;
    width: 50px;
  }
  @media screen and (min-width: 712px) {
    &:hover {
      cursor: pointer;
      background-color: var(--red-bright-1);
    }
  }
`
