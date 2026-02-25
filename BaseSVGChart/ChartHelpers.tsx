import { ScaleLinear } from 'd3'
import { useMemo } from 'react'

/**
 *
 * This function creates an array of evenly spaced tick values between min and max.
 * If count is provided, the function will create a number of ticks equal to count.
 * If step is provided, the function will create a number of ticks equal to the number of steps between min and max.
 * If neither count nor step is provided, the function will create a number of ticks equal to the number of values between min and max.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @param count - The number of ticks to create.
 * @param step - The step size between ticks.
 * @returns An array of tick values.
 */

/** Options for creating ticks. */
type TicksOptions = {
  min: number
  max: number
  count?: number
  step?: number
}

/** Generates an array of evenly spaced tick values between min and max. */
export function createTicks ({ min, max, count, step }: TicksOptions) {
  if (count) {
    const s = (max - min) / count
    return Array.from({ length: count }, (_, i) => min + i * s)
  }
  if (step) {
    return Array.from(
      { length: (max - min) / step + 1 },
      (_, i) => min + i * step
    )
  }
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

/** Memoized hook wrapper around createTicks. */
export function useTicks ({ min, max, count, step }: TicksOptions) {
  return useMemo(
    () => createTicks({ min, max, count, step }),
    [min, max, count, step]
  )
}

/**
 *
 * This component is used to draw multiple elements in a group.
 * @param name - The name of the component.
 * @param data - The data to draw.
 * @param element - The element to draw.
 * @param gProps - The props to pass to the group.
 * @returns A React component that draws multiple elements in a group.
 * @example
 * <DrawMultiple name='x-ticks'>
 *   <TickText x={xScale(0) - 10} y={yScale(tick)} textAnchor='end'>
 *     {tick}
 *   </TickText>
 * </DrawMultiple>
 */
type DrawMultipleProps = {
  data?: any[]
  element?: (item: any, index: number) => React.ReactNode
  addOnce?: React.ReactNode
} & React.SVGProps<SVGGElement>

const DrawMultipleComponent = ({
  data,
  element,
  addOnce,
  ...gProps
}: DrawMultipleProps) => {
  return (
    <g {...gProps}>
      {data?.map((x, i) => (
        <>{element?.(x, i)}</>
      ))}
      {addOnce}
    </g>
  )
}

/** Creates a named DrawMultiple variant that uses the name as className. */
export const DrawMultiple = (name: string) => {
  const Component = (props: DrawMultipleProps) => (
    <DrawMultipleComponent className={name} {...props} />
  )
  Component.displayName = name
  return Component
}



type WrapInGroupProps = {
  element: React.ReactNode
} & React.SVGProps<SVGGElement>

const WrapInGroupComponent = ({
  element,
  ...gProps
}: WrapInGroupProps) => {
  return (
    <g {...gProps}>
      <>{element}</>
    </g>
  )
}

export const WrapInGroup = (name: string) => {
  const Component = (props: WrapInGroupProps) => (
    <WrapInGroupComponent className={name} {...props} />
  )
  Component.displayName = name
  return Component
}
