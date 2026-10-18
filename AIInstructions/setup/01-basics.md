# 01 Basics

Goal: copy the base components into the project and make sure all dependencies are installed.

## Steps

1. Run `grab basics` in the project root. This copies `Chart`, `ColorKey` and `MFHelpers` into `src/components/`.
2. Check that `package.json` contains `usehooks-ts`. `MFHelpers` imports it. If it is missing, run `bun add usehooks-ts`.
3. Run `bun run build` and fix type errors before continuing.

## Notes

- Do not edit files in `src/components/MFHelpers`, `Chart` or `ColorKey` in the project. Fix them in basecomponents and copy again.
- `MFHelpers` exports `MFContextProvider`, `useMFContext`, `PartSplitter`, `LazyViz` and `url`.
