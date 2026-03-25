import { MapContext } from 'components/MapboxMap/Mapbox'
import mapboxgl from 'mapbox-gl'
import { ReactNode, useContext, useEffect, useRef } from 'react'
import { createRoot, Root } from 'react-dom/client'

type MarkerPosition = { lng: number; lat: number }

/** Adds a Mapbox marker at a position and keeps it in sync with props. */
export const Marker = ({
  position,
  children,
  options,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd
}: {
  position: MarkerPosition
  children?: ReactNode
  options?: Omit<mapboxgl.MarkerOptions, 'element'>
  onClick?: (event: MouseEvent) => void
  onDragStart?: () => void
  onDrag?: () => void
  onDragEnd?: () => void
}) => {
  const { map } = useContext(MapContext)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const markerElementRef = useRef<HTMLDivElement | null>(null)
  const markerRootRef = useRef<Root | null>(null)

  useEffect(() => {
    if (!map) return

    const markerElement = document.createElement('div')
    markerElementRef.current = markerElement

    const marker = new mapboxgl.Marker({
      ...options,
      element: markerElement
    })
      .setLngLat(position)
      .addTo(map)
    markerRef.current = marker

    if (children) {
      markerRootRef.current = createRoot(markerElement)
    }

    if (onClick) {
      markerElement.addEventListener('click', onClick)
    }
    if (onDragStart) marker.on('dragstart', onDragStart)
    if (onDrag) marker.on('drag', onDrag)
    if (onDragEnd) marker.on('dragend', onDragEnd)

    return () => {
      if (onClick) {
        markerElement.removeEventListener('click', onClick)
      }
      if (onDragStart) marker.off('dragstart', onDragStart)
      if (onDrag) marker.off('drag', onDrag)
      if (onDragEnd) marker.off('dragend', onDragEnd)
      markerRootRef.current?.unmount()
      markerRootRef.current = null
      marker.remove()
      markerRef.current = null
      markerElementRef.current = null
    }
  }, [map, options, onClick, onDragStart, onDrag, onDragEnd])

  useEffect(() => {
    if (!markerRef.current) return
    markerRef.current.setLngLat(position)
  }, [position])

  useEffect(() => {
    if (!markerRootRef.current) return
    markerRootRef.current.render(<>{children}</>)
  }, [children])

  return null
}
