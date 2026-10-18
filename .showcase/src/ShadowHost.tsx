import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { StyleSheetManager } from 'styled-components'

/**
 * A closed root is unreachable via `host.shadowRoot`, so keep our own handle
 * and never attach twice (StrictMode remounts effects).
 */
const SHADOW_ROOTS = new WeakMap<Element, ShadowRoot>()

const getShadowRoot = (host: HTMLElement) => {
  const existing = SHADOW_ROOTS.get(host)
  if (existing) return existing

  const created = host.attachShadow({ mode: 'closed' })
  SHADOW_ROOTS.set(host, created)
  return created
}

/**
 * Mirrors production, where the app is injected into a closed shadow root.
 * styled-components must target the root or its styles never reach the tree.
 */
export const ShadowHost = ({ children }: { children: ReactNode }) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)

  useEffect(() => {
    if (hostRef.current) setShadowRoot(getShadowRoot(hostRef.current))
  }, [])

  return (
    <div ref={hostRef} style={{ minHeight: '100%' }}>
      {shadowRoot &&
        createPortal(
          <StyleSheetManager target={shadowRoot as unknown as HTMLElement}>
            <>{children}</>
          </StyleSheetManager>,
          shadowRoot
        )}
    </div>
  )
}
