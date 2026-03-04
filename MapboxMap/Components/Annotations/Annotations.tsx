import mapboxgl from 'mapbox-gl'
import styled from 'styled-components'
import { Fragment, useContext, useEffect, useRef } from 'react'
import { MapAnnotation } from '../../Types/mapboxtypes'
import { createRoot, Root } from 'react-dom/client'
import { MapContext } from 'components/MapboxMap/Mapbox'
import { PointAnnotation } from 'components/AnnotatedContent/PointAnnotation'

type MapEntry = {
  root: Root
  remove: () => void
}

/** Renders map annotations as Mapbox popups/markers with React content. */
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
  const entriesRef = useRef<MapEntry[]>([])

  useEffect(() => {
    if (!context.map) return

    entriesRef.current.forEach(e => {
      e.root.unmount()
      e.remove()
    })
    entriesRef.current = []

    annotations.forEach(anno => {
      if (!map) return

      const placeholder = document.createElement('div')
      placeholder.className = 'annotation-placeholder'
      const root = createRoot(placeholder)

      if (anno.offset != null) {
        root.render(
          <PointAnnotation
            offset={anno.offset}
            connectorStyle={anno.connectorStyle}
            startMarker={anno.startMarker}
            endMarker={anno.endMarker}
          >
            {anno.element}
          </PointAnnotation>
        )

        const marker = new mapboxgl.Marker({
          element: placeholder,
          anchor: 'center'
        })
          .setLngLat(anno.pos)
          .addTo(map)

        entriesRef.current.push({ root, remove: () => marker.remove() })
      } else {
        root.render(<>{anno.element}</>)

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        })
          .setLngLat(anno.pos)
          .setDOMContent(placeholder)
          .addTo(map)

        entriesRef.current.push({ root, remove: () => popup.remove() })
      }
    })

    return () => {
      entriesRef.current.forEach(e => {
        e.root.unmount()
        e.remove()
      })
      entriesRef.current = []
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
          <Fragment key={'annotation_' + i}>
            {m.offset != null ? (
              <PointAnnotation
                offset={m.offset}
                connectorStyle={m.connectorStyle}
                startMarker={m.startMarker}
                endMarker={m.endMarker}
              >
                {m.element}
              </PointAnnotation>
            ) : (
              m.element
            )}
          </Fragment>
        ))}
    </HiddenStyledComponentForceCSSInjection>
  )
}

const HiddenStyledComponentForceCSSInjection = styled.div`
  display: none;
  pointer-events: none;
`