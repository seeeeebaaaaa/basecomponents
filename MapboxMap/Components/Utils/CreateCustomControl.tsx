import mapboxgl from 'mapbox-gl'
import { ReactNode } from 'react'
import { createRoot, Root } from 'react-dom/client'

/** Custom Mapbox control that renders a React node into the map UI. */
export class CustomControl {
  map: mapboxgl.Map | undefined = undefined
  container: HTMLElement | undefined = undefined
  root: Root | undefined = undefined
  action: (a: boolean) => void
  visual: ReactNode
  className: string

  constructor(
    action: (a: boolean) => void,
    map: mapboxgl.Map | undefined = undefined,
    visual: ReactNode,
    className: string = 'custom-control'
  ) {
    this.map = map
    this.action = action
    this.visual = visual
    this.className = className
  }

  onAdd(map: mapboxgl.Map) {
    this.map = map
    this.container = document.createElement('div')
    this.container.className = this.className

    this.root = createRoot(this.container)
    this.root.render(
      <div
        onClick={() => {
          this.action(true)
        }}
      >
        {this.visual}
      </div>
    )
    return this.container
  }

  onRemove() {
    this.root?.unmount()
    this.root = undefined
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = undefined
    this.map = undefined
  }
}
