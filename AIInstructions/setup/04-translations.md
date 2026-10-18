# 04 Translations

Goal: all user-facing strings come from `src/Locale/de.ts` and `src/Locale/fr.ts` and are read with `_t`.

## Steps

1. Add the string to `de.ts` and `fr.ts`. `fr` must have the same keys, typed as `typeof de`.
2. Read it in a component:

```tsx
const { _t } = useMFContext()
return <p>{_t('chart.title')}</p>
```

## Features

- Nested keys with dot notation: `_t('educationLabels.0')`
- Parameters with double braces in the string: `'Hello {{name}}!'` used as `_t('greeting', { name })`
- Translations can be ReactNode or objects, but parameters only work with strings.

## Rules

- Missing keys return `[key]` and log a message. Treat that as a bug.
- Never hardcode German or French text in components.
- Do not import `de` or `fr` directly in components. Use `_t`.
