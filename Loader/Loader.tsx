import type { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

export type LoaderVariant = 'default' | 'dataviz' | 'map' | 'radar'

export type LoaderProps = {
  loading?: boolean
  variant?: LoaderVariant
  size?: number
  speed?: number
  color?: string
  background?: string
  width?: string | number
  height?: string | number
  message?: string
  label?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'color'>

const chase = keyframes`
  0% { opacity: 1 }
  70%, 100% { opacity: 0.15 }
`

const bar = keyframes`
  0%, 100% { transform: scaleY(0.25) }
  50% { transform: scaleY(1) }
`

const bob = keyframes`
  0%, 100% { transform: translateY(-1.2px) }
  50% { transform: translateY(0.6px) }
`

const ping = keyframes`
  0% { transform: scale(0.15); opacity: 0.5 }
  100% { transform: scale(1); opacity: 0 }
`

const sweep = keyframes`
  to { transform: rotate(360deg) }
`

const rest = keyframes`
  to { opacity: 0.35 }
`

const DOTS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2
  return {
    cx: +(12 + Math.cos(a) * 8).toFixed(2),
    cy: +(12 + Math.sin(a) * 8).toFixed(2)
  }
})

const BARS = [11, 18, 14, 20, 12]

const PIN =
  'M12 2.6c-3.2 0-5.8 2.6-5.8 5.8 0 4.3 5.8 10.6 5.8 10.6s5.8-6.3 5.8-10.6c0-3.2-2.6-5.8-5.8-5.8z'

/**
 * Renders a reserved-space loading spinner. Hidden when `loading` is false.
 */
function Loader ({
  loading = true,
  variant = 'default',
  size = 32,
  speed = 1.2,
  color = 'currentColor',
  background = '#fff',
  width = '100%',
  height = 300,
  message,
  label = 'Loading',
  className,
  style,
  ...rest
}: LoaderProps) {
  if (!loading) return null

  return (
    <LoaderContainer
      role='status'
      aria-label={message || label}
      className={className}
      $width={width}
      $height={height}
      style={{ color, ...style }}
      {...rest}
    >
      <Svg
        $speed={speed}
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='currentColor'
        aria-hidden='true'
      >
        {variant === 'default' &&
          DOTS.map((d, i) => (
            <circle
              key={i}
              className='sp-a sp-chase'
              cx={d.cx}
              cy={d.cy}
              r='2'
              style={{ animationDelay: `${(i / DOTS.length - 1) * speed}s` }}
            />
          ))}

        {variant === 'dataviz' &&
          BARS.map((h, i) => (
            <rect
              key={i}
              className='sp-a sp-bar'
              x={2 + i * 4.3}
              y={21 - h}
              width='2.8'
              height={h}
              rx='1.2'
              style={{ animationDelay: `${i * 0.11 - speed}s` }}
            />
          ))}

        {variant === 'map' && (
          <>
            {[0, 0.5].map((offset, i) => (
              <ellipse
                key={i}
                className='sp-a sp-ping'
                cx='12'
                cy='21'
                rx='8'
                ry='2.8'
                style={{ animationDelay: `${offset * speed - speed}s` }}
              />
            ))}
            <g className='sp-a sp-bob'>
              <path d={PIN} />
              <circle cx='12' cy='8.4' r='2.1' fill={background} />
            </g>
          </>
        )}

        {variant === 'radar' && (
          <>
            <circle
              cx='12'
              cy='12'
              r='9.2'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.4'
              opacity='.22'
            />
            <circle
              cx='12'
              cy='12'
              r='4.6'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.4'
              opacity='.22'
            />
            <circle cx='12' cy='12' r='1.4' />
            <path
              className='sp-a sp-sweep'
              d='M12 12 L12 2.8 A9.2 9.2 0 0 1 20.5 8.6 Z'
              opacity='.55'
            />
          </>
        )}
      </Svg>

      {message && <Message>{message}</Message>}
    </LoaderContainer>
  )
}

const LoaderContainer = styled.div<{
  $width: string | number
  $height: string | number
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: ${props => toCssSize(props.$width)};
  height: ${props => toCssSize(props.$height)};
`

const Svg = styled.svg<{ $speed: number }>`
  overflow: visible;
  --sp-speed: ${props => props.$speed}s;

  .sp-a {
    transform-box: fill-box;
    transform-origin: center;
    animation-duration: var(--sp-speed);
    animation-iteration-count: infinite;
  }

  .sp-chase {
    animation-name: ${chase};
    animation-timing-function: linear;
  }

  .sp-bar {
    animation-name: ${bar};
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    transform-origin: bottom center;
  }

  .sp-ping {
    animation-name: ${ping};
    animation-timing-function: cubic-bezier(0.2, 0.6, 0.3, 1);
  }

  .sp-bob {
    animation-name: ${bob};
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    transform-box: view-box;
  }

  .sp-sweep {
    animation-name: ${sweep};
    animation-timing-function: linear;
    transform-box: view-box;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: ${rest} 1.6s ease-in-out infinite alternate;

    .sp-a {
      animation: none;
      opacity: 0.6;
    }
  }
`

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.7;
  text-align: center;
`

/**
 * Turns a number into a px length, leaving CSS strings unchanged.
 */
function toCssSize (value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

export default Loader
