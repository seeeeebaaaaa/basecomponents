import styled from 'styled-components'
import { useContext } from 'react'
import { MapContext } from 'components/MapboxMap/Mapbox'

import mousebuttonMove from './Icons/help_icons_mousebutton_move.svg'
import touchpadMove from './Icons/help_icons_touchpad_move.svg'
import mousewheelUpDown from './Icons/help_icons_mousewheel_up_down.svg'
import touchpadUpDown from './Icons/help_icons_touchpad_up_down.svg'
import ctrlKey from './Icons/help_icons_ctrl_key.svg'
import mobileMove from './Icons/help_icons_mobile_move.svg'
import mobilePinch from './Icons/help_icons_mobile_pinch.svg'
import mobileUpDown from './Icons/help_icons_mobile_up_down.svg'

/** Help overlay panel that slides in from the bottom. */
export const Help = ({ visible }: { visible: boolean }) => { 
  const context = useContext(MapContext)
  return (
    <HelpWrapper>
      <HelpRoot $visible={visible}>
        <Title>Hilfe</Title>
        <h3>So bedienen Sie die interaktive Karte</h3>
        {!context.isMobile && (
          <Table>
            <tbody>
            <tr>
              <td>Verschieben</td>
              <IconCell>
                <img src={mousebuttonMove} />
              </IconCell>
              <IconCell>oder</IconCell>
              <IconCell>
                <img src={touchpadMove} />
              </IconCell>
            </tr>
            <tr>
              <td>Zoomen</td>
              <IconCell>
                <img src={mousewheelUpDown} />
              </IconCell>
              <IconCell>oder</IconCell>
              <IconCell>
                <img src={touchpadUpDown} />
              </IconCell>
            </tr>
            <tr>
              <td>Perspektive drehen</td>
              <IconCell>
                <img src={ctrlKey} />
              </IconCell>
              <IconCell>+</IconCell>
              <IconCell>
                {' '}
                <img src={mousebuttonMove} />
              </IconCell>
            </tr>
            <tr className='noBorder'>
              <td></td>
              <IconCell>
                <img src={ctrlKey} />
              </IconCell>
              <IconCell>+</IconCell>
              <IconCell>
                <img src={touchpadMove} />
              </IconCell>
            </tr>
            <tr className='noBorder'>
              <td colSpan={4} className='close'>
                <button
                  onClick={() => {
                    context.setShowHelp && context.setShowHelp(false)
                  }}
                >
                  Schliessen
                </button>
              </td>
            </tr>
            </tbody>
          </Table>
        )}
        {/* 
        
        
        
        
        */}
        {context.isMobile && (
          <Table>
            <tbody>
            <tr>
              <td>Verschieben</td>
              <IconCell>
                <img src={mobileMove} />
              </IconCell>
            </tr>
            <tr>
              <td>Zoomen</td>
              <IconCell>
                <img src={mobilePinch} />
              </IconCell>
            </tr>
            <tr>
              <td>Perspektive drehen</td>
              <IconCell>
                <img src={mobileUpDown} />{' '}
              </IconCell>
            </tr>

            <tr className='noBorder'>
              <td colSpan={2} className='close'>
                <button
                  onClick={() => {
                    context.setShowHelp && context.setShowHelp(false)
                  }}
                >
                  Schliessen
                </button>
              </td>
            </tr></tbody>
          </Table>
        )}
      </HelpRoot>
      
    </HelpWrapper>
  )
}

const Table = styled.table`
  table-layout: fixed;
  width: 100%;
  font-size: 15px;
  line-height: 1.1em;
  tr:not(.noBorder) {
    td {
      border-top: 1px solid var(--brandblue-bright-5);
      /* padding-top: 10px; */
      /* padding-bottom: 10px; */
      vertical-align: middle;
    }
  }
  td {
    padding: 0;
    &.close {
      text-align: center;
      padding-top: 15px;
      button {
        border: 0;
        background-color: var(--yellow-main);
        color: var(--brandblue-main);
        font-size: 18px;
        padding: 10px;
        &:hover {
          cursor: pointer;
          background-color: var(--brandblue-bright-3);
        }
      }
    }
  }
  img {
    width: 60px;
  }
`
const IconCell = styled.td`
  width: 60px;
  text-align: center;
  font-weight: 900;
  font-size: 15px;
  vertical-align: middle;
`

const HelpWrapper = styled.div`
  position: absolute;
  z-index: 400;
  bottom: 00px;
  left: 50%;
  transform: translate(-50%, 0);
`

const HelpRoot = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: ${(props) => (props.$visible ? '20px' : '-700px')};
  left: 50%;
  transform: translate(-50%, 0%);
  transition: bottom 0.3s ease-in-out;
  border-radius: 15px;
  border-top-right-radius: 15px;
  padding: 15px 30px;
  width: 400px;
  background-color: var(--site-background);
  -webkit-box-shadow: 0px 10px 15px 5px rgba(0, 0, 0, 0.05);
  box-shadow: 0px 10px 15px 5px rgba(0, 0, 0, 0.05);
  color: var(--text-color);
  @media screen and (max-width: 711px) {
    width: 280px;
  }
  span {
    font-weight: 300;
    font-size: 22px;
    margin-right: 10px;
    margin-left: 10px;
  }
  img {
    max-width: 60px;
  }
  h4 {
    font-size: 15px;
    flex: 0 0 40%;
    margin: 0;
    @media screen and (max-width: 711px) {
      font-size: 15px;
      max-width: 50%;
      line-height: 1.4em;
    }
  }

  h3 {
    margin-top: 0;
    width: 100%;
    text-align: center;
    font-weight: 700;
    font-size: 18px;
  }
`

const Title = styled.div`
  line-height: 2em;
  font-size: 15px;
  width: 100%;
  text-align: center;
`
