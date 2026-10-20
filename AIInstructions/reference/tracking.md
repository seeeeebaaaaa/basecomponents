# Tracking reference (GA4 events)

Applies to all interactives of the Interaktiv team.

## Route

Interactives do not push to the `dataLayer` themselves. They call `trackEvent` from the context. The host receives the call and maps the data to the `dataLayer` for Google Tag Manager.

```ts
const { trackEvent } = useMFContext()
```

`trackEvent` has this type:

```ts
trackEvent?: (event: string, eventData: { [key: string]: any }) => void
```

## Event name

The first argument is always `'Interactions'`. It is confirmed by the host team.

## Fixed values

- The event category is set by Google Tag Manager, not in the code.
- Keys in `eventData`: `event_action`, `event_label`, `event_value`, plus the video keys listed below.

## Allowed values

These values come from the team documentation. They describe the usual pattern. They are not a validated list, so propose new values to the user instead of inventing them.

### Scroll events

- `event_action`: `vertical-scroll`
- `event_label`: `startReading`, `contentBottom`, `pageBottom`, or a two-digit milestone such as `50ContentRead`

### Video and audio

- `event_action`: `video` or `audio`
- `event_label`: `play`
- `event_value`: not defined yet
- `video_url`: page where the video plays, as `domain.tld/path`
- `video_id`: numeric video ID
- `creation_time`: Unix timestamp of video creation
- `video_title`: video or audio title

Video specifications are kept separately in the team documentation.

### General interactions

- `event_action`: `hover`, `click`, `selection`, `drag`, or `input`
- `event_label`: project-specific IDs of the objects users interact with. The page is assumed to be tracked already.

## Payload example

```ts
const { trackEvent } = useMFContext()

trackEvent('Interactions', {
  event_action: 'click',
  event_label: 'example-object-id',
})
```

## Rules

- Send an event only when the interaction actually happens: click, scroll milestone reached, video started. Never on page load.
- Call `trackEvent` only from the context. Do not use a prop or a global.
- Do not write to `window.dataLayer` directly.
- Always pass `'Interactions'` as the first argument.
- In development (`import.meta.env.DEV`), log events to the console only. Do not call `trackEvent`, so test data does not reach the analytics.
- Do not invent event names, actions or labels for elements that are not interactive.
