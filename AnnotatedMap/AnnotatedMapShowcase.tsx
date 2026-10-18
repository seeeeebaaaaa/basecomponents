import React, { type ReactNode } from 'react'
import { PointAnnotation } from 'components/AnnotatedContent'
import {
  AnnotatedMap,
  boundsFromCenterZoom,
  latToWorldY,
  lngToWorldX,
  type GeoBounds,
  type LngLat
} from './AnnotatedMap'

const SWITZERLAND: GeoBounds = [
  [5.9, 45.8],
  [10.5, 47.85]
]

const CITIES: Record<string, LngLat> = {
  Zürich: [8.5417, 47.3769],
  Bern: [7.4474, 46.948],
  Genève: [6.1432, 46.2044],
  Lugano: [8.9511, 46.0037],
  Basel: [7.5886, 47.5596],
  Wien: [16.3738, 48.2082]
}

const CONNECTOR = {
  type: 'straight',
  stroke: '#111',
  strokeWidth: 1.5
} as const

const MARKER = { size: 9, fill: '#e74c3c', stroke: '#fff', strokeWidth: 1.5 }

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ maxWidth: 720 }}>{children}</div>
)

const Label = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      background: '#fff',
      padding: '2px 6px',
      borderRadius: 3,
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }}
  >
    {children}
  </span>
)

/** A city label on a connector, anchored on the coordinate by its start marker. */
const City = ({
  name,
  offset,
  textAnchor = 'left'
}: {
  name: string
  offset: [number, number]
  textAnchor?: 'left' | 'center' | 'right'
}) => (
  <PointAnnotation
    offset={offset}
    textAnchor={textAnchor}
    connectorStyle={CONNECTOR}
    markerStyle={MARKER}
    startMarker='circle'
  >
    <Label>{name}</Label>
  </PointAnnotation>
)

/**
 * Stands in for a static map export: the OpenStreetMap tiles covering `bounds`,
 * positioned in percentages so the background scales with its container.
 * A real project would use a Mapbox Static Images URL or an exported image.
 */
const TileBackground = ({ bounds }: { bounds: GeoBounds }) => {
  const [[west, south], [east, north]] = bounds
  const [left, top] = [lngToWorldX(west), latToWorldY(north)]
  const [spanX, spanY] = [
    lngToWorldX(east) - left,
    latToWorldY(south) - latToWorldY(north)
  ]
  const zoom = Math.max(0, Math.round(Math.log2(3 / spanX)))
  const tiles = 2 ** zoom

  const grid: Array<[number, number]> = []
  for (let x = Math.floor(left * tiles); x < Math.ceil((left + spanX) * tiles); x++) {
    for (let y = Math.floor(top * tiles); y < Math.ceil((top + spanY) * tiles); y++) {
      grid.push([x, y])
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${spanX} / ${spanY}`,
        overflow: 'hidden',
        background: '#dfe6ec'
      }}
    >
      {grid.map(([x, y]) => (
        <img
          key={`${x}-${y}`}
          src={`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`}
          alt=''
          style={{
            position: 'absolute',
            left: `${((x / tiles - left) / spanX) * 100}%`,
            top: `${((y / tiles - top) / spanY) * 100}%`,
            width: `${(1 / tiles / spanX) * 100}%`,
            height: `${(1 / tiles / spanY) * 100}%`
          }}
        />
      ))}
    </div>
  )
}

const CENTER_ZOOM = {
  center: [8.2, 46.82] as LngLat,
  zoom: 7,
  size: [900, 560] as [number, number]
}

/** Every way to georeference a static map image, one labelled variant each. */
export const showcaseVariants: {
  title?: string
  description?: string
  element: ReactNode
}[] = [
  {
    title: 'bounds',
    description:
      'Annotations are placed by [lng, lat] against the extent of the image: [[west, south], [east, north]].',
    element: (
      <Frame>
        <AnnotatedMap
          bounds={SWITZERLAND}
          annotations={[
            { pos: CITIES.Zürich, content: <City name='Zürich' offset={[45, 35]} /> },
            { pos: CITIES.Bern, content: <City name='Bern' offset={[-45, -35]} textAnchor='right' /> },
            { pos: CITIES.Genève, content: <City name='Genève' offset={[50, -35]} /> },
            { pos: CITIES.Lugano, content: <City name='Lugano' offset={[45, -40]} /> }
          ]}
        >
          <TileBackground bounds={SWITZERLAND} />
        </AnnotatedMap>
      </Frame>
    )
  },
  {
    title: 'center, zoom and size',
    description:
      'For images from a static map API: the extent is derived from the center, zoom and pixel size the image was rendered at.',
    element: (
      <Frame>
        <AnnotatedMap
          {...CENTER_ZOOM}
          annotations={[
            { pos: CITIES.Basel, content: <City name='Basel' offset={[-45, -35]} textAnchor='right' /> },
            { pos: CITIES.Zürich, content: <City name='Zürich' offset={[45, 35]} /> },
            { pos: CITIES.Genève, content: <City name='Genève' offset={[50, -35]} /> }
          ]}
        >
          <TileBackground
            bounds={boundsFromCenterZoom(
              CENTER_ZOOM.center,
              CENTER_ZOOM.zoom,
              CENTER_ZOOM.size
            )}
          />
        </AnnotatedMap>
      </Frame>
    )
  },
  {
    title: 'Custom annotations',
    description:
      "type: 'custom' centers any content on the coordinate — here a plain dot with a value.",
    element: (
      <Frame>
        <AnnotatedMap
          bounds={SWITZERLAND}
          annotations={Object.entries(CITIES).map(([name, pos]) => ({
            type: 'custom' as const,
            id: name,
            pos,
            content: (
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: 'rgba(231, 76, 60, 0.75)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center'
                }}
              >
                {name}
              </div>
            )
          }))}
        >
          <TileBackground bounds={SWITZERLAND} />
        </AnnotatedMap>
      </Frame>
    )
  },
  {
    title: 'Coordinates outside the image',
    description:
      'Wien is in the annotations array but outside the bounds, so AnnotatedContent drops it instead of clamping it to the edge.',
    element: (
      <Frame>
        <AnnotatedMap
          bounds={SWITZERLAND}
          annotations={[
            { pos: CITIES.Zürich, content: <City name='Zürich' offset={[45, 35]} /> },
            { pos: CITIES.Wien, content: <City name='Wien' offset={[45, 35]} /> }
          ]}
        >
          <TileBackground bounds={SWITZERLAND} />
        </AnnotatedMap>
      </Frame>
    )
  }
]
