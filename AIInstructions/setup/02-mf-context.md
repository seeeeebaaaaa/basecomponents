# 02 MFContextProvider

Goal: replace `LocaleContext` with `MFContextProvider`. The provider supplies locale, translations, color mode, mobile state and CMS properties to all children.

## Steps

1. Delete `src/Contexts/LocaleContext.ts` and remove every import of it.
2. Replace `src/components/MainComponent/MainComponent.tsx` with:

```tsx
import styled from 'styled-components'
import { TamediaStyles, MicroFrontendProps } from '@ta-interaktiv/microfrontend-template-helpers'
import { MFContextProvider, PartSplitter } from '@/components/MFHelpers'
import ExampleComponent from '@/components/ExampleComponent'
import de from '@/Locale/de'
import fr from '@/Locale/fr'

const MainComponent = ({ tenant, colorMode, properties = {}, trackEvent }: MicroFrontendProps) => (
  <AppContainer $colorMode={colorMode}>
    <MFContextProvider
      locale={tenant.lang}
      colorMode={colorMode}
      translations={{ de, fr }}
      tenantKey={tenant.key}
      properties={properties}
      trackEvent={trackEvent}
    >
      <PartSplitter currentPart={properties.part} parts={{ mainmap: { content: <ExampleComponent /> } }} />
    </MFContextProvider>
  </AppContainer>
)

const AppContainer = styled(TamediaStyles)``

export default MainComponent
```

3. Read values inside components with `useMFContext()`:

```tsx
const { _t, isMobile, colorMode, currentLanguage, properties, trackEvent } = useMFContext()
```

## Context values

- `_t(key, params?)` translate, see `04-translations.md`
- `currentLanguage` `'de' | 'fr'`
- `currentLocale` the active locale object
- `colorMode` `'light' | 'dark'`
- `isMobile` true below 768px
- `windowHeight` window height plus 100px, set after mount
- `tenantKey` the CMS tenant key
- `properties` the CMS string properties
- `trackEvent` analytics callback, noop if missing
- `customProps` and `placeHolderHeight` optional, passed to the provider

## Rules

- `useMFContext()` throws outside `MFContextProvider`. Every component that uses it must render inside the provider.
- Do not read `tenant.lang` or `colorMode` from props inside child components. Use the context.
