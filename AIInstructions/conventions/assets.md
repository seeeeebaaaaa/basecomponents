# Image assets

Images, maps and graphic backgrounds exist in up to four variants. The file name is built from a base name and two suffixes.

## Naming

| Variant | Suffix |
| --- | --- |
| Light, desktop | none |
| Light, mobile | `_mob` |
| Dark, desktop | `_dm` |
| Dark, mobile | `_mob_dm` |

Example: `mainmap`, `mainmap_mob`, `mainmap_dm`, `mainmap_mob_dm`.

## Where the files live

Put the files in `public/`, for example `public/maps/`.

## Referencing files in code

Use `useVariantPath` from `@/components/MFHelpers`. It reads `isMobile` and `colorMode` from the context and returns the correct path, already prefixed by `url()`.

```tsx
const src = useVariantPath('maps/mainmap', 'jpg')
return <img src={src} alt="" />
```

For CSS, wrap the result in `url()`:

```tsx
const bg = useVariantPath('backgrounds/hero', 'jpg')
const Hero = styled.div`
  background-image: url("${bg}");
`
```

Outside a component, for example in a helper that receives its options as parameters, use `variantName` or `variantPath` with an explicit `{ isMobile, colorMode }`.

## Rules

- Use `useVariantPath`. Do not build suffixes by hand and do not check window width or the system color scheme yourself.
- Before you reference a variant, check that the file exists in `public/`. If a variant is missing, tell the user instead of falling back silently.
- Use the same base name in all variants so the component can switch between them without layout changes.
