# 01 Setup with mfsetup

Setup of a new project is done by one shell command, not by the agent. Do not redo these steps manually.

## Command

Run in the project root:

```
mfsetup
```

## What it does

1. Copies `Chart`, `ColorKey` and `MFHelpers` into `src/components/` (`grab basics`).
2. Copies these instructions into `docs/ai/` (`grab AIInstructions`).
3. Deletes `src/Contexts/LocaleContext.ts`.
4. Replaces `src/components/MainComponent/MainComponent.tsx` with the MFContextProvider version.
5. Adds `usehooks-ts` if missing.
6. Runs `bun run build`.

## If it fails

- Read the message printed by the failing step.
- Do not run the replaced steps by hand unless the message says a specific step failed.
- Fix type errors reported by the build, then run `bun run build` again.

## Rules

- `mfsetup` overwrites `MainComponent.tsx`. Only run it in a project where that file has no custom content yet.
