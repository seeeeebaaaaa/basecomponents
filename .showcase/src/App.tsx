import {
  Component,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode
} from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { MFContextProvider } from 'components/MFHelpers'
import { ShadowHost } from './ShadowHost'
import { VariantList } from './VariantList'
import { SHOWCASES, type ShowcaseEntry } from './showcases'

type Language = 'de' | 'fr'
type ColorMode = 'light' | 'dark'

const LANGUAGES: Language[] = ['de', 'fr']
const COLOR_MODES: ColorMode[] = ['light', 'dark']

const logTrackEvent = (event: string, eventData: Record<string, unknown>) =>
  console.log('[trackEvent]', event, eventData)

const formatProperties = (entry?: ShowcaseEntry) =>
  JSON.stringify(entry?.config.properties ?? {}, null, 2)

/** Gallery shell: pick a component, then render it the way production does. */
export const App = () => {
  const [selectedName, setSelectedName] = useState(
    () => decodeURIComponent(window.location.hash.slice(1)) || SHOWCASES[0]?.name
  )
  const [language, setLanguage] = useState<Language>('de')
  const [colorMode, setColorMode] = useState<ColorMode>('light')
  const [isShadowEnabled, setIsShadowEnabled] = useState(true)
  const [isSourceVisible, setIsSourceVisible] = useState(false)
  const [arePropertiesVisible, setArePropertiesVisible] = useState(false)
  const [propertiesText, setPropertiesText] = useState(() =>
    formatProperties(SHOWCASES.find(({ name }) => name === selectedName) ?? SHOWCASES[0])
  )

  const entry = SHOWCASES.find(({ name }) => name === selectedName) ?? SHOWCASES[0]

  const parsedProperties = useMemo(() => {
    try {
      return { value: JSON.parse(propertiesText) as Record<string, string>, error: '' }
    } catch (error) {
      return { value: null, error: (error as Error).message }
    }
  }, [propertiesText])

  const handleSelect = (name: string) => {
    window.location.hash = name
    setSelectedName(name)
    setPropertiesText(formatProperties(SHOWCASES.find(entry => entry.name === name)))
  }

  if (!entry)
    return (
      <>
        <GlobalStyle />
        <EmptyState>
          No showcases found. Add a <code>&lt;Name&gt;Showcase.tsx</code> to any
          component folder.
        </EmptyState>
      </>
    )

  // Mirrors MainComponent: AppContainer wraps the provider, which feeds the tree.
  const preview = (
    <AppContainer $colorMode={colorMode}>
      <MFContextProvider
        locale={language}
        colorMode={colorMode}
        translations={entry.config.translations as never}
        tenantKey={entry.config.tenantKey}
        properties={parsedProperties.value ?? entry.config.properties}
        customProps={entry.config.customProps}
        placeHolderHeight={entry.config.placeHolderHeight}
        trackEvent={logTrackEvent}
      >
        <ShowcaseBoundary key={entry.name}>
          {entry.variants ? (
            <VariantList variants={entry.variants} />
          ) : (
            entry.Showcase && <entry.Showcase />
          )}
        </ShowcaseBoundary>
      </MFContextProvider>
    </AppContainer>
  )

  return (
    <>
      <GlobalStyle />
      <Layout>
        <Sidebar>
          <SidebarTitle>Base Components</SidebarTitle>
          {SHOWCASES.map(({ name }) => (
            <SidebarItem
              key={name}
              $isActive={name === entry.name}
              onClick={() => handleSelect(name)}
            >
              {name}
            </SidebarItem>
          ))}
        </Sidebar>
        <Main>
          <Toolbar>
            <ComponentName>{entry.name}</ComponentName>
            <Segmented
              options={LANGUAGES}
              value={language}
              onChange={setLanguage}
            />
            <Segmented
              options={COLOR_MODES}
              value={colorMode}
              onChange={setColorMode}
            />
            <ToolbarButton
              $isActive={isShadowEnabled}
              onClick={() => setIsShadowEnabled(!isShadowEnabled)}
            >
              Shadow DOM
            </ToolbarButton>
            <Spacer />
            <ToolbarButton
              $isActive={arePropertiesVisible}
              onClick={() => setArePropertiesVisible(!arePropertiesVisible)}
            >
              Properties
            </ToolbarButton>
            <ToolbarButton
              $isActive={isSourceVisible}
              onClick={() => setIsSourceVisible(!isSourceVisible)}
            >
              Source
            </ToolbarButton>
          </Toolbar>
          {arePropertiesVisible && (
            <PropertiesPanel>
              <PropertiesLabel>
                properties — the object the host passes in
              </PropertiesLabel>
              <PropertiesInput
                spellCheck={false}
                value={propertiesText}
                onChange={event => setPropertiesText(event.target.value)}
              />
              {parsedProperties.error && (
                <PropertiesError>{parsedProperties.error}</PropertiesError>
              )}
            </PropertiesPanel>
          )}
          <Panes>
            <Preview>
              {isShadowEnabled ? (
                <ShadowHost key={entry.name}>{preview}</ShadowHost>
              ) : (
                preview
              )}
            </Preview>
            {isSourceVisible && <Source>{entry.source}</Source>}
          </Panes>
        </Main>
      </Layout>
    </>
  )
}

/** Small pill switch used for language and color mode. */
const Segmented = <T extends string>({
  options,
  value,
  onChange
}: {
  options: T[]
  value: T
  onChange: (next: T) => void
}) => (
  <SegmentedGroup>
    {options.map(option => (
      <SegmentedOption
        key={option}
        $isActive={option === value}
        onClick={() => onChange(option)}
      >
        {option}
      </SegmentedOption>
    ))}
  </SegmentedGroup>
)

/** Keeps one failing showcase from taking down the whole gallery. */
class ShowcaseBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info)
  }

  render() {
    if (this.state.error)
      return <ErrorMessage>{this.state.error.message}</ErrorMessage>
    return this.props.children
  }
}

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #1a1a1a;
  }
`

const AppContainer = styled.div<{ $colorMode: ColorMode }>`
  /* flow-root keeps a showcase's top margin inside the themed background. */
  display: flow-root;
  min-height: 100%;
  padding: 0 24px;
  background: ${({ $colorMode }) => ($colorMode === 'dark' ? '#141414' : '#fff')};
  color: ${({ $colorMode }) => ($colorMode === 'dark' ? '#ededed' : '#1a1a1a')};
`

const Layout = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  height: 100vh;
`

const Sidebar = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 12px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
  overflow-y: auto;
`

const SidebarTitle = styled.span`
  padding: 0 10px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
`

const SidebarItem = styled.button<{ $isActive: boolean }>`
  padding: 7px 10px;
  border: 0;
  border-radius: 6px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  background: ${({ $isActive }) => ($isActive ? '#1a1a1a' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? '#fff' : 'inherit')};

  &:hover {
    background: ${({ $isActive }) => ($isActive ? '#1a1a1a' : '#ececec')};
  }
`

const Main = styled.main`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Toolbar = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
`

const ComponentName = styled.h1`
  margin: 0 8px 0 0;
  font-size: 15px;
  font-weight: 600;
`

const Spacer = styled.div`
  flex: 1;
`

const SegmentedGroup = styled.div`
  display: flex;
  padding: 2px;
  border-radius: 7px;
  background: #eee;
`

const SegmentedOption = styled.button<{ $isActive: boolean }>`
  padding: 4px 10px;
  border: 0;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  background: ${({ $isActive }) => ($isActive ? '#fff' : 'transparent')};
  box-shadow: ${({ $isActive }) => ($isActive ? '0 1px 2px rgba(0,0,0,0.15)' : 'none')};
`

const ToolbarButton = styled.button<{ $isActive: boolean }>`
  padding: 5px 11px;
  border: 1px solid ${({ $isActive }) => ($isActive ? '#1a1a1a' : '#d0d0d0')};
  border-radius: 7px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  background: ${({ $isActive }) => ($isActive ? '#1a1a1a' : '#fff')};
  color: ${({ $isActive }) => ($isActive ? '#fff' : 'inherit')};
`

const PropertiesPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
`

const PropertiesLabel = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
`

const PropertiesInput = styled.textarea`
  min-height: 90px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  resize: vertical;
`

const PropertiesError = styled.span`
  color: #a32020;
  font-size: 12px;
  font-family: ui-monospace, monospace;
`

const Panes = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`

const Preview = styled.div`
  flex: 1;
  overflow: auto;
`

const Source = styled.pre`
  width: 45%;
  margin: 0;
  padding: 20px;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
`

const ErrorMessage = styled.div`
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
  background: #fdeaea;
  color: #a32020;
  font-size: 13px;
  font-family: ui-monospace, monospace;
`

const EmptyState = styled.div`
  padding: 40px;
  font-size: 14px;
`
