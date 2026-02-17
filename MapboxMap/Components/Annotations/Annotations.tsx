import mapboxgl from 'mapbox-gl'
import styled from 'styled-components'
import { Fragment, useContext, useEffect, useRef } from 'react'
import { MapAnnotation } from '../../Types/mapboxtypes'
import { createRoot, Root } from 'react-dom/client'
import { MapContext } from 'components/MapboxMap/Mapbox'

/** Renders map annotations as Mapbox popups with React content. */
export const Annotations = ({
  annotations,
  hidePointer = false,
  pointerColor
}: {
  annotations: MapAnnotation[]
  hidePointer?: boolean
  pointerColor?: string
}) => {
  const context = useContext(MapContext)
  const { map, changeDefault } = context
  const markersRef = useRef<{ popup: mapboxgl.Popup; root: Root }[]>([])

  useEffect(() => {
    if (!context.map) return

    // Clean up previous markers and unmount their React roots
    markersRef.current.forEach(({ popup, root }) => {
      root.unmount()
      popup.remove()
    })
    markersRef.current = []

    annotations.forEach(anno => {
      const placeholder = document.createElement('div')
      placeholder.className = 'annotation-placeholder'

      const root = createRoot(placeholder)
      root.render(<>{anno.element}</>)

      if (!map) return

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat(anno.pos)
        .setDOMContent(placeholder)
        .addTo(map)

      markersRef.current.push({ popup, root })
    })

    return () => {
      markersRef.current.forEach(({ popup, root }) => {
        root.unmount()
        popup.remove()
      })
      markersRef.current = []
    }
  }, [annotations, map])

  useEffect(() => {
    changeDefault &&
      changeDefault('pointerColor', hidePointer ? 'transparent' : pointerColor)
  }, [pointerColor, hidePointer, changeDefault, map])

  return <AnnotationLayerComponent annotations={annotations} />
}

/** Hidden container that forces styled-component CSS injection for annotation content. */
const AnnotationLayerComponent = ({
  annotations
}: {
  annotations: MapAnnotation[]
}) => {
  return (
    <HiddenStyledComponentForceCSSInjection>
      {annotations &&
        annotations.map((m: MapAnnotation, i) => (
          <Fragment key={'annotation_' + i}>{m.element}</Fragment>
        ))}
    </HiddenStyledComponentForceCSSInjection>
  )
}

const HiddenStyledComponentForceCSSInjection = styled.div`
  display: none;
  pointer-events: none;
`
