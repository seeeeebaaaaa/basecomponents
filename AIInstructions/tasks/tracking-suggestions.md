# Task: suggest tracking events

Read this only when the user asks for tracking suggestions, usually shortly before a project is finished. Read `reference/tracking.md` first.

## Steps

1. Read the existing code of the interactive: components, event handlers, scroll logic and media elements.
2. Suggest which interactions and events should be tracked. Assign each suggestion to one of the types in the reference.
3. For each suggestion give `event_action`, `event_label`, `event_value` if relevant, and the place in the code where the event fires.
4. Do not implement tracking until the user confirms the suggestions.

## Rules

- If an interaction type is missing in the code, report it. Do not add it.
- Use only the allowed values from the reference. If none fits, propose a new value and mark it as new.
