import { useId } from 'react'
import styled from 'styled-components'

/** Accessible radio toggle bar using native radio inputs with custom styling.
 *  Supports CSS custom properties for theming:
 *  --toggle-bg, --toggle-color, --toggle-hover-bg, --toggle-hover-color,
 *  --toggle-selected-bg, --toggle-selected-color, --toggle-border-color,
 *  --toggle-padding, --toggle-font-size
 */
const RadioToggleBar = ({
  selected,
  options,
  labelProperty,
  onChange,
  title,
  style,
  align='center'
}: {
  selected: string
  options: Record<string, any>
  labelProperty: string
  onChange: (selected: string | number) => void | undefined
  title?: string
  style?: React.CSSProperties,
  align?: 'center' | 'flex-start' | 'flex-end'
}) => {
  const groupId = useId()

  /** Handles radio input change events */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <RadioToggleBarContainer role='radiogroup' style={style} $align={align}>
      {title && <RadioToggleBarTitle>{title}</RadioToggleBarTitle>}
      <ToggleBarWarpper>
        {Object.entries(options).map(([key, label]) => (
          <RadioToggleBarLabel key={key} $selected={selected === key}>
            <RadioToggleBarInput
              type='radio'
              name={groupId}
              value={key}
              checked={selected === key}
              onChange={handleChange}
            />
            {label}
          </RadioToggleBarLabel>
        ))}
      </ToggleBarWarpper>
    </RadioToggleBarContainer>
  )
}

const RadioToggleBarContainer = styled.div<{ $align?: 'center' | 'flex-start' | 'flex-end' }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0px;
  justify-content: ${props => props.$align ?? 'center'};
  margin-top: 5px;
`
const ToggleBarWarpper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0px;
  justify-content: center;

  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--toggle-border-color, var(--beige-bright-1));
`

const RadioToggleBarTitle = styled.h2`
  font-size: 16px;
  font-weight: 300;
  color: var(--gray-3);
  margin-bottom: 10px;
  flex: 0 0 100%;
  text-align: center;
`

const RadioToggleBarInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`

const RadioToggleBarLabel = styled.label<{ $selected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  border-left: 1px solid var(--toggle-border-color, var(--beige-bright-1));
  padding: var(--toggle-padding, 8px 20px);
  margin-left: -1px;
  font-size: var(--toggle-font-size, 16px);
  font-weight: 600;
  cursor: pointer;
  color: var(--toggle-selected-color, var(--text-color));
  background-color: var(--toggle-selected-bg, var(--yellow-main));

  &:not(:has(input:checked)):hover {
    background-color: var(--toggle-hover-bg, var(--site-background));
    color: var(--toggle-hover-color, var(--gray-3));
    cursor: pointer;
    font-weight: 300;
  }

  &:not(:has(input:checked)) {
    font-weight: 300;
    background-color: var(--toggle-bg, var(--beige-bright-3));
    color: var(--toggle-color, var(--gray-3));
  }

  &:has(input:focus-visible) {
    outline: 2px solid var(--text-color);
    outline-offset: -2px;
  }
`

export default RadioToggleBar
