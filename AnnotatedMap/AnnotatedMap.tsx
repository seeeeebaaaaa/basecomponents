import { AnnotatedContent, PointAnnotation } from 'components/AnnotatedContent'
import Chart from 'components/Chart'
import { url, useMFContext } from 'components/MFHelpers'
import styled from 'styled-components'

const ConnectorStyle: ConnectorSpecs = {
  type: 'straight',
  direction: 'ccw',
  width: 1,
  stroke: 'var(--text-color)',
  strokeWidth: 2,
  markerSize: 4,
  markerColor: 'var(--text-color)'
}
const AnnotatedMap = () => {
  const { overwriteWithMFProperties } = useMFContext()

  return (
    <Chart
      innerSpace='0px'
      meta={overwriteWithMFProperties({
        title: 'Der Titel der Karte',
        subtitle: 'Die Untertitel der Karte',
        source: 'Quelle: Hier kommst her'
      })}
      contentWidth='TextWidthExtendedFullMobile'
      frameWidth='TextWidth'
      addToHead={<></>}
    >
      <AnnotatedContent
        annotations={[
          {
            pos: { x: 50, y: 50 },
            content: (
              <PointAnnotation
                textAnchor='left'
                offset={[-46, -80]}
                connectorStyle={ConnectorStyle}
                endMarker='circle'
              >
                Anno
              </PointAnnotation>
            )
          }
        ]}
      >
        <Image src={url('map.jpg')} />
      </AnnotatedContent>
    </Chart>
  )
}
const Image = styled.img`
  max-width: 100%;
`

export default AnnotatedMap
