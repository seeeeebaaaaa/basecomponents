import {
  ArticleWidth,
  ContentWidth,
  TextWidth,
  TextWidthExtended,
  TextWidthExtendedFullMobile
} from '@ta-interaktiv/react-disco-grid'
import { CSSProperties, ReactNode } from 'react'
import styled from 'styled-components'

const WidthCompoenents = {
  TextWidth,
  TextWidthExtended,
  ContentWidth,
  ArticleWidth,
  TextWidthExtendedFullMobile,
  FullWidth: styled.div`
    width: 100%;
  `
}

const Chart = ({
  children,
  meta,
  frameWidth = 'TextWidth',
  contentWidth = 'TextWidthExtendedFullMobile',
  spaceBefore = '30px',
  spaceAfter = '60px',
  innerSpace = '30px',
  addToHead,
  titleStyle
}: {
  children: ReactNode
  meta: ChartMeta
  frameWidth?:
    | 'TextWidth'
    | 'TextWidthExtended'
    | 'ContentWidth'
    | 'ArticleWidth'
    | 'TextWidthExtendedFullMobile'
    | 'FullWidth'
  contentWidth?:
    | 'TextWidth'
    | 'TextWidthExtended'
    | 'ContentWidth'
    | 'ArticleWidth'
    | 'TextWidthExtendedFullMobile'
    | 'FullWidth'

  spaceBefore?: string | number
  spaceAfter?: string | number
  innerSpace?: string | number
  addToHead?: ReactNode
  titleStyle?: CSSProperties
}) => {
  const { title, subtitle, source, hint } = meta
  const MetaWidth = WidthCompoenents[frameWidth]

  const MainWidth = WidthCompoenents[contentWidth]

  return (
    <>
      <Spacer style={{ paddingTop: spaceBefore }} />
      <MetaWidth className='chart-meta'>
        {title && <Title style={titleStyle}>{title}</Title>}
        {subtitle && <Sub>{subtitle}</Sub>}

        {addToHead && <HeadAddition>{addToHead}</HeadAddition>}
      </MetaWidth>
      <Spacer style={{ paddingTop: innerSpace }} />
      <MainWidth>{children as any}</MainWidth>
      <Spacer style={{ paddingTop: innerSpace }} />
      <MetaWidth>
        {/* {hint && <Hint>{hint}</Hint>} */}

        {source && <Source>{source}</Source>}
      </MetaWidth>
      <Spacer style={{ paddingTop: spaceAfter }} />
    </>
  )
}

const HeadAddition = styled.div`
  width: 100%;
  margin-top: 15px;
  @media screen and (max-width: 768px) {
    max-width: calc(100% - 40px);
  }
`

const Spacer = styled.div`
  width: 100%;
`

export default Chart

const Sub = styled.div`
  font-size: 15px;
  line-height: 1.6em;
  margin-bottom: 2em;
  @media screen and (max-width: 768px) {
    font-size: 12px;
    line-height: 1.6em;
    max-width: calc(100% - 40px);
  }
`

const Title = styled.h3`
  margin: 0;
  padding: 0;
  font-size: 20px;
  line-height: 1.5em;
  margin-bottom: 0.5em;
  max-width: 550px;
  @media screen and (max-width: 768px) {
    font-size: 20px;
    line-height: 1.4em;
    max-width: calc(100% - 40px);
  }
`

const Hint = styled.div`
  font-size: 14px;
  line-height: 1.4em;
  color: var(--gray-3);
  margin-bottom: 10px;
`
const Source = styled.div`
  font-size: 11px;
  line-height: 1.4em;
  color: var(--gray-3);
  margin-top: 5px;
  a {
    text-decoration: none;
    font-size: 10px;
    color: var(--gray-3) !important;
  }
  @media screen and (max-width: 768px) {
    line-height: 1.3em;
    font-size: 10px;
    padding-left: 20px;
  }
`
