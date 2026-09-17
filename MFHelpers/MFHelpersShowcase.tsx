import styled from 'styled-components'
import { useMFContext } from './MFContext'

/** Stands in for the host's properties object and translation files. */
export const showcaseConfig = {
  translations: {
    de: {
      greeting: 'Hallo {{name}}, willkommen.',
      labels: { intro: 'Verschachtelter Schlüssel' }
    },
    fr: {
      greeting: 'Bonjour {{name}}, bienvenue.',
      labels: { intro: 'Clé imbriquée' }
    }
  },
  properties: { part: 'nameResults', dataset: 'vornamen-2024' },
  tenantKey: 'tagesanzeiger'
}

/** Reads everything MFContextProvider exposes so the wiring is visible. */
export const MFHelpersShowcase = () => {
  const {
    _t,
    currentLanguage,
    colorMode,
    isMobile,
    tenantKey,
    windowHeight,
    properties,
    trackEvent
  } = useMFContext()

  return (
    <Container>
      <Title>Translations</Title>
      <Row>
        <Key>_t('greeting', {'{ name: \'Seba\' }'})</Key>
        <Value>{_t('greeting', { name: 'Seba' })}</Value>
      </Row>
      <Row>
        <Key>_t('labels.intro')</Key>
        <Value>{_t('labels.intro')}</Value>
      </Row>
      <Row>
        <Key>_t('missing_key')</Key>
        <Value>{_t('missing_key')}</Value>
      </Row>

      <Title>Context</Title>
      <Row>
        <Key>currentLanguage</Key>
        <Value>{currentLanguage}</Value>
      </Row>
      <Row>
        <Key>colorMode</Key>
        <Value>{colorMode}</Value>
      </Row>
      <Row>
        <Key>tenantKey</Key>
        <Value>{tenantKey}</Value>
      </Row>
      <Row>
        <Key>isMobile</Key>
        <Value>{String(isMobile)}</Value>
      </Row>
      <Row>
        <Key>windowHeight</Key>
        <Value>{windowHeight}</Value>
      </Row>

      <Title>Properties</Title>
      {Object.entries(properties).map(([key, value]) => (
        <Row key={key}>
          <Key>{key}</Key>
          <Value>{String(value)}</Value>
        </Row>
      ))}

      <Title>Tracking</Title>
      <TrackButton onClick={() => trackEvent?.('showcase_click', { tenantKey })}>
        Fire trackEvent (logs to console)
      </TrackButton>
    </Container>
  )
}

const Container = styled.div`
  padding: 32px 0;
  max-width: 560px;
  font-size: 14px;
`

const Title = styled.h3`
  margin: 28px 0 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
`

const Row = styled.div`
  display: flex;
  gap: 16px;
  padding: 7px 0;
  border-bottom: 1px solid currentColor;
  border-bottom-color: rgba(128, 128, 128, 0.25);
`

const Key = styled.span`
  flex: 0 0 240px;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  opacity: 0.7;
`

const Value = styled.span`
  font-weight: 600;
`

const TrackButton = styled.button`
  padding: 8px 14px;
  border: 1px solid currentColor;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
`
