import styled from 'styled-components'
import type { ShowcaseVariant } from './showcases'

/** Renders the labelled sections every showcase used to repeat for itself. */
export const VariantList = ({ variants }: { variants: ShowcaseVariant[] }) => (
  <List>
    {variants.map(({ title, description, element }, index) => (
      <Section key={title ?? index}>
        {title && <Title>{title}</Title>}
        {description && <Description>{description}</Description>}
        {element}
      </Section>
    ))}
  </List>
)

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px 0 80px;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 40px;
  border-bottom: 1px solid currentColor;
  border-bottom-color: rgba(128, 128, 128, 0.3);
`

const Title = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
`

const Description = styled.span`
  font-size: 13px;
  opacity: 0.6;
`
