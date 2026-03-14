import React from 'react'

export const DEFAULT_SIZE = 11
export const DEFAULT_LINE_THICKNESS = 3
export const DEFAULT_GRADIENT_BAR_BORDER_RADIUS = 10
export const DEFAULT_BAR_HEIGHT = 12
export const DEFAULT_GROUP_SPACING = 12
export const DEFAULT_ITEM_SPACE = 12
export const DEFAULT_ITEM_ROW_SPACE = 4

/** Default label styling. Extend or override via labelStyle prop. */
export const DEFAULT_LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  lineHeight: '1.5em'
}

/** Default group title styling. Extend or override via groupTitleStyle prop. */
export const DEFAULT_GROUP_TITLE_STYLE: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  opacity: 1,
  lineHeight: '2.5em'
}

/** Default bar labels styling (above gradient). Extend or override via barLabelsStyle prop. */
export const DEFAULT_BAR_LABELS_STYLE: React.CSSProperties = {
  fontSize: 12,
  lineHeight: '1.5em',
  fontWeight: 600,
  marginBottom: '0.5em'
}

/** Default color key title styling. Extend or override via titleStyle prop. */
export const DEFAULT_COLOR_KEY_TITLE_STYLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '2em'
  // marginBottom: 8,
}
