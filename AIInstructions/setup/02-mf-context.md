# 02 MFContextProvider

`mfsetup` already installed the provider in `MainComponent.tsx`. Read this file when you build or change components that use context values.

## Reading values

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
- Do not reintroduce `LocaleContext`.
