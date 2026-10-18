# Prompt: Harvest reusable components from a project

Paste this into a fresh chat with the project repo open. Replace `<BASE_REPO>` if the
base component library lives somewhere other than `~/Sites/basecomponents`.

---

I keep reusable components in `<BASE_REPO>` (default: `/Users/seba/Sites/basecomponents`).
It is a flat library: one folder per component, each with the component file, an
`index.ts` barrel, and any assets it needs. There is **no build step, no bundler and no
path aliases** — folders get copied into consuming projects as-is.

Go through `src/` in this project and work out which components belong in that library.

## 1. Inventory first

List every component in this project, then diff it against `<BASE_REPO>`:

- **Already there** — diff the files. Report any local improvement worth back-porting
  (new helpers, bug fixes) and any change that is only project styling and should *not*
  go back.
- **New candidate** — assess as below.

## 2. Classify each candidate by coupling

Sort into three tiers. For each, list its actual imports so I can see the coupling.

- **Tier 1 — drop-in.** Imports nothing beyond `react`, `styled-components` and
  standard libs. Already generic props.
- **Tier 2 — generic core, thin coupling.** The logic is reusable but it reaches into
  project scaffolding. Fixable with a contained change.
- **Tier 3 — project shell.** Hardwired to this project's data shape, endpoints, global
  state or copy. Say so and move on; do not propose a speculative rewrite. If a
  *pattern* inside it is genuinely valuable (an interaction model, a positioning
  algorithm), name it and say it would be a refactor, not an adjustment.

Coupling smells to check for explicitly:

- path-alias imports (`@/...`) — these break in the library
- project data files, JSON lookups, API base URLs, dataset-specific parse formats
- global state / app context hooks, project locale or translation files
- design tokens with no fallback (`var(--purple-main)`, brand colors)
- hardcoded language in default prop values
- magic numbers repeated across the file (breakpoints especially)

## 3. Ask before changing anything

Report the findings as a short table plus prose. Then **ask me which components to
prepare** and let me decide on any judgement calls (how to decouple, whether to
back-port, how to handle bugs you found).

## 4. Make the adjustments in *this* repo, not the library

I copy folders over myself, so the component must be library-ready while still working
here. Apply the minimum change that achieves both:

- Replace alias imports with relative ones; **co-locate** the data/assets a component
  owns inside its folder, and re-export them from its `index.ts` so existing consumers
  keep one import path. Update every consumer.
- Hoist project theming into CSS variables **with the current value as the fallback**
  (`var(--x-button-bg, var(--text-color))`) so behaviour here is unchanged.
- Hoist repeated magic numbers to a module constant and interpolate it, including into
  media queries and `matchMedia` calls, so there is one place to change it.
- Make baked-in language overridable via props, and keep default strings consistent in
  one language rather than a mix.
- Thread locale-sensitive operations (`toLocaleLowerCase`, `toLocaleString`) through a
  `locale` prop, defaulting to the current hardcoded value.
- Remove dead imports and unreachable code you introduced or found *within* the
  component being extracted.

Rules: no behaviour change in this project unless I approve it. Do not reformat, rename
or tidy anything unrelated. Prefer fewer, smaller edits.

## 5. Flag bugs, do not silently fix them

If you find a real bug (unreachable branch, dead guard, wrong dependency array), add a
`TODO:` comment explaining it and tell me. Only fix it if I say so.

## 6. Verify and report

Run the typecheck and confirm the dev server is clean. Then give me:

- what changed, per file, and why
- the exact list of folders to copy into `<BASE_REPO>`
- the back-ports to apply in the other direction, with file and line references
- anything I still need to decide
