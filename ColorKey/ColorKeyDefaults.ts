import React from 'react'

export const DEFAULT_SWATCH_SIZE = 11
export const DEFAULT_SWATCH_SHAPE = 'circle'
export const DEFAULT_LINE_THICKNESS = 3
export const DEFAULT_BAR_HEIGHT = 12
export const DEFAULT_BAR_BORDER_RADIUS = 10
export const DEFAULT_SECTION_GAP = 12
export const DEFAULT_ITEM_GAP = 12
export const DEFAULT_ROW_GAP = 4

/** Default label styling. Extend or override via styles.label. */
export const DEFAULT_LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  lineHeight: '1.5em'
}

/** Default section title styling. Extend or override via styles.sectionTitle. */
export const DEFAULT_SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  opacity: 1,
  lineHeight: '2.5em'
}

/** Default styling for the pair of labels above a bar. Extend or override via styles.endLabel. */
export const DEFAULT_END_LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  lineHeight: '1.5em',
  fontWeight: 600,
  marginBottom: '0.5em'
}

/** Default color key title styling. Extend or override via styles.title. */
export const DEFAULT_TITLE_STYLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '2em'
}
