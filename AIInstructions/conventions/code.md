# Code conventions

## Components

- React functional components with implicit typing where possible.
- Import project code with the `@/` alias, for example `@/components/Chart`.

## Styling

- Use styled-components. Pass color mode with a transient prop: `styled.div<{ $colorMode: string }>`.
- Use `css` blocks for color-mode-dependent styles, following `AppContainer`.
- Do not write comments inside CSS. Do not use `//` in CSS template literals.

## Comments

- Do not add comments that narrate what code does.
- Keep comments for non-obvious decisions and constraints.

## Shadow DOM

The micro-frontend runs in a Shadow DOM.

- `document.querySelector` will not find elements inside the component.
- Use React refs or `host.shadowRoot.querySelector(...)`.
- Third-party libraries that query the global DOM need to be pointed at the shadow root.

## Dependencies

- React is externalized by the Vite config. Never bundle React.
- Check `package.json` before adding a dependency. Prefer what is already installed.
