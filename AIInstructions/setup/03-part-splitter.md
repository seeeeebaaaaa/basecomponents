# 03 PartSplitter

Goal: render different parts of the micro-frontend depending on the CMS property `part`.

## Steps

1. Pass the current part from the CMS properties:

```tsx
<PartSplitter
  currentPart={properties.part}
  parts={{
    mainmap: { content: <MainMap /> },
    details: { content: <Details />, variants: [{ id: 'mobile', properties: { isMobilePreview: 'true' } }] },
  }}
/>
```

2. Each key in `parts` is a part id. Set the CMS property `part` to that id to show it.

## Behavior

- Outside development, only the part whose id equals `currentPart` renders.
- In development (`import.meta.env.DEV`), all parts render.
- If a part has `variants`, in development it renders once per variant wrapped in `MFPropertiesOverride`, so the component sees the variant's properties through `useMFContext()`.
- `placeHolderHeights` and `onVisible` are accepted by `PartSplitter` but are not applied yet. Do not rely on them until `Part` uses them.

## Rules

- Keep part ids lowercase and stable. They are referenced by the CMS.
- Do not conditionally render parts yourself. Use `PartSplitter`.
