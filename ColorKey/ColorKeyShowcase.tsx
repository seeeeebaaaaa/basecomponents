import React from 'react'
import styled from 'styled-components'
import ColorKey, {
  type ColorKeyDiscreteScaleItem,
  type ColorKeyGroup,
  type ColorKeyGradientItem,
  type ColorKeyItem
} from './ColorKey'

const CUSTOM_SWATCH = (
  <span style={{ display: 'block', width: 14, height: 14, flexShrink: 0 }}>
    <svg
      width='14'
      height='14'
      viewBox='0 0 14 14'
      preserveAspectRatio='xMidYMid meet'
      style={{ display: 'block' }}
    >
      <path d='M7 1 L13 7 L7 13 L1 7 Z' fill='#9b59b6' />
    </svg>
  </span>
)

const SHOWCASE_ITEMS: ColorKeyGroup[] = [
  {
    title: 'Showcase Items',
    items: [
      { color: '#e74c3c', label: 'Circle', type: 'circle' },
      { color: '#3498db', label: 'Square', type: 'square' },
      { color: '#2ecc71', label: '45° Line', type: 'line' },
      { label: 'Custom', type: 'custom', customSwatch: CUSTOM_SWATCH }
    ]
  }
]

const SHOWCASE_ITEMS_MIXED_SIZE: ColorKeyItem[] = [
  { color: '#e74c3c', label: 'Small', type: 'circle', swatchSize: 10 },
  { color: '#3498db', label: 'Default', type: 'circle' },
  { color: '#2ecc71', label: 'Large', type: 'circle', swatchSize: 24 }
]

const SHOWCASE_ITEMS_OUTLINE: ColorKeyItem[] = [
  {
    color: '#e74c3c',
    label: 'Circle outline',
    type: 'circle',
    strokeWidth: 2,
    strokeColor: '#333'
  },
  {
    color: '#3498db',
    label: 'Square outline',
    type: 'square',
    strokeWidth: 1,
    strokeColor: '#000'
  }
]

const SHOWCASE_GRADIENT_ITEMS: ColorKeyGradientItem[] = [
  { color: '#e74c3c', value: 0, label: 'Low' },
  { color: '#f39c12', value: 25 },
  { color: '#2ecc71', value: 50, label: 'Mid' },
  { color: '#3498db', value: 75 },
  { color: '#9b59b6', value: 100, label: 'High' }
]

const SHOWCASE_DISCRETE_SCALE: ColorKeyDiscreteScaleItem[] = [
  { color: '#e74c3c' },
  { color: '#f39c12' },
  { color: '#2ecc71' },
  { color: '#3498db' },
  { color: '#9b59b6' }
]

const SHOWCASE_DISCRETE_SCALE_WITH_LABELS: ColorKeyDiscreteScaleItem[] = [
  { color: '#e74c3c', label: 'Low' },
  { color: '#f39c12' },
  { color: '#2ecc71', label: 'Mid' },
  { color: '#3498db' },
  { color: '#9b59b6', label: 'High' }
]

const SHOWCASE_GROUPS: ColorKeyGroup[] = [
  {
    title: 'Group A',
    items: [
      { color: '#e74c3c', label: 'Circle', type: 'circle' },
      { color: '#3498db', label: 'Square', type: 'square' }
    ]
  },
  {
    title: 'Group B',
    columns: 3,
    items: [
      {
        color: 'none',
        label: 'Line',
        type: 'circle',
        strokeWidth: 2,
        strokeColor: '#000'
      },
      { label: 'Custom', type: 'custom', customSwatch: CUSTOM_SWATCH },
      {
        color: 'none',
        label: 'Line',
        type: 'circle',
        strokeWidth: 2,
        strokeColor: '#000'
      },
      { label: 'Custom', type: 'custom', customSwatch: CUSTOM_SWATCH },
      {
        color: 'none',
        label: 'Line',
        type: 'circle',
        strokeWidth: 2,
        strokeColor: '#000'
      },
      { label: 'Custom', type: 'custom', customSwatch: CUSTOM_SWATCH }
    ]
  }
]

/**
 * Wrapper that renders all swatch type possibilities of ColorKey.
 */
export const ColorKeyShowcase = () => (
  <ShowcaseContainer>
    <ShowcaseSection>
      <ShowcaseTitle>Gradient</ShowcaseTitle>
      <ColorKey gradient items={SHOWCASE_GRADIENT_ITEMS} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Gradient (maxWidth, height, barLabels)</ShowcaseTitle>
      <ColorKey
        gradient
        items={SHOWCASE_GRADIENT_ITEMS}
        maxWidth={300}
        height={20}
        barLabels={['Min', 'Max']}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Discrete scale</ShowcaseTitle>
      <ColorKey
        discreteScale
        items={SHOWCASE_DISCRETE_SCALE}
        barLabels={['Low', 'High']}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Discrete scale (maxWidth, height)</ShowcaseTitle>
      <ColorKey
        discreteScale
        items={SHOWCASE_DISCRETE_SCALE}
        maxWidth={200}
        height={16}
        barLabels={['Min', 'Max']}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Discrete scale with labels below</ShowcaseTitle>
      <ColorKey
        discreteScale
        items={SHOWCASE_DISCRETE_SCALE_WITH_LABELS}
        maxWidth={200}
        barLabels={['Min', 'Max']}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ColorKey
        columns={2}
        groupGap={30}
        title='Mixed Gradient, Discrete Scale and Categories'
        items={[
          {
            title: 'Gradient',
            gradient: true,
            items: SHOWCASE_GRADIENT_ITEMS,
            barLabels: ['Low', 'High']
          },
          {
            title: 'Discrete scale',
            discreteScale: true,
            items: SHOWCASE_DISCRETE_SCALE_WITH_LABELS,
            barLabels: ['Min', 'Max']
          },
          {
            title: 'Categories',
            items: [
              { color: '#e74c3c', label: 'Aligator', type: 'circle' },
              { color: '#3498db', label: 'Brocolli', type: 'circle' },
              { color: '#2ecc71', label: 'Chameleon', type: 'circle' },
              { color: '#9b59b6', label: 'Duck', type: 'circle' },
              { color: '#f39c12', label: 'Elephant', type: 'circle' },
              { color: '#e74c3c', label: 'Fox', type: 'circle' },
              { color: '#3498db', label: 'Giraffe', type: 'circle' },
              { color: '#2ecc71', label: 'Hippo', type: 'circle' }
            ]
          },
          {
            title: 'Categories',
            columns: 2,
            items: [
              { color: '#e74c3c', label: 'Aligator', type: 'circle' },
              { color: '#3498db', label: 'Brocolli', type: 'circle' },
              { color: '#2ecc71', label: 'Chameleon', type: 'circle' },
              { color: '#9b59b6', label: 'Duck', type: 'circle' },
              { color: '#f39c12', label: 'Elephant', type: 'circle' },
              { color: '#e74c3c', label: 'Fox', type: 'circle' },
              { color: '#3498db', label: 'Giraffe', type: 'circle' },
              { color: '#2ecc71', label: 'Hippo', type: 'circle' }
            ]
          },
          {
            title: 'Gradient',
            gradient: true,
            items: SHOWCASE_GRADIENT_ITEMS,
            barLabels: ['Low', 'High']
          }
        ]}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ColorKey items={SHOWCASE_ITEMS} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Grid (2 item columns)</ShowcaseTitle>
      <ColorKey items={SHOWCASE_ITEMS} itemColumns={2} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>swatchSize (8px)</ShowcaseTitle>
      <ColorKey items={SHOWCASE_ITEMS} swatchSize={8} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Per-item swatchSize</ShowcaseTitle>
      <ColorKey items={SHOWCASE_ITEMS_MIXED_SIZE} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Outline (strokeWidth + strokeColor)</ShowcaseTitle>
      <ColorKey items={SHOWCASE_ITEMS_OUTLINE} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Groups (per-group layout)</ShowcaseTitle>
      <ColorKey items={SHOWCASE_GROUPS} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Groups in 2 columns</ShowcaseTitle>
      <ColorKey items={SHOWCASE_GROUPS} columns={2} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Groups in 2 columns with groupGap</ShowcaseTitle>
      <ColorKey items={SHOWCASE_GROUPS} columns={2} groupGap={24} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Color key with title</ShowcaseTitle>
      <ColorKey title='Legend' items={SHOWCASE_ITEMS} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Color key with titleStyle</ShowcaseTitle>
      <ColorKey
        title='Custom Styled Title'
        titleStyle={{ fontSize: 18, color: '#e74c3c' }}
        items={SHOWCASE_ITEMS}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ColorKey
        title='Mixed Gradient and Categories'
        items={[
          {
            title: 'Gradient',
            gradient: true,
            items: SHOWCASE_GRADIENT_ITEMS,
            barLabels: ['Low', 'High']
          },
          {
            title: 'Categories',
            items: [
              { color: '#e74c3c', label: 'Aligator', type: 'circle' },
              { color: '#3498db', label: 'Brocolli', type: 'circle' },
              { color: '#2ecc71', label: 'Chameleon', type: 'circle' },
              { color: '#9b59b6', label: 'Duck', type: 'circle' },
              { color: '#f39c12', label: 'Elephant', type: 'circle' },
              { color: '#e74c3c', label: 'Fox', type: 'circle' },
              { color: '#3498db', label: 'Giraffe', type: 'circle' },
              { color: '#2ecc71', label: 'Hippo', type: 'circle' },
              { color: '#9b59b6', label: 'Iguana', type: 'circle' },
              { color: '#f39c12', label: 'Jaguar', type: 'circle' },
              { color: '#e74c3c', label: 'Kangaroo', type: 'circle' },
              { color: '#e74c3c', label: 'Aligator', type: 'circle' },
              { color: '#3498db', label: 'Brocolli', type: 'circle' },
              { color: '#2ecc71', label: 'Chameleon', type: 'circle' },
              { color: '#9b59b6', label: 'Duck', type: 'circle' },
              { color: '#f39c12', label: 'Elephant', type: 'circle' },
              { color: '#e74c3c', label: 'Fox', type: 'circle' },
              { color: '#3498db', label: 'Giraffe', type: 'circle' },
              { color: '#2ecc71', label: 'Hippo', type: 'circle' },
              { color: '#9b59b6', label: 'Iguana', type: 'circle' },
              { color: '#f39c12', label: 'Jaguar', type: 'circle' },
              { color: '#e74c3c', label: 'Kangaroo', type: 'circle' }
            ]
          }
        ]}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>Groups with groupSpacing</ShowcaseTitle>
      <ColorKey items={SHOWCASE_GROUPS} groupSpacing={10} itemSpace={10} />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>groupTitleStyle</ShowcaseTitle>
      <ColorKey
        items={[
          {
            title: 'Group A',
            groupTitleStyle: { color: '#e74c3c', fontSize: 14 },
            items: [
              { color: '#e74c3c', label: 'Circle', type: 'circle' },
              { color: '#3498db', label: 'Square', type: 'square' }
            ]
          },
          {
            title: 'Group B (default)',
            items: [{ color: '#2ecc71', label: 'Line', type: 'line' }]
          }
        ]}
        groupTitleStyle={{ fontWeight: 400 }}
      />
    </ShowcaseSection>
    <ShowcaseSection>
      <ShowcaseTitle>labelStyle (global, group, per-item)</ShowcaseTitle>
      <ColorKey
        items={[
          {
            title: 'Group A',
            labelStyle: { fontWeight: 600 },
            items: [
              { color: '#e74c3c', label: 'Bold', type: 'circle' },
              {
                color: '#3498db',
                label: 'Small',
                type: 'circle',
                labelStyle: { fontSize: 12 }
              }
            ]
          },
          {
            items: [{ color: '#2ecc71', label: 'Default', type: 'circle' }]
          }
        ]}
        labelStyle={{ color: 'red', fontSize: 32 }}
      />
    </ShowcaseSection>
  </ShowcaseContainer>
)

const ShowcaseSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
`

const ShowcaseTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
`

const ShowcaseContainer = styled.div`
  margin-top: 80px;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`
