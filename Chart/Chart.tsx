import {
  ArticleWidth,
  ContentWidth,
  TextWidth,
  TextWidthExtended,
  TextWidthExtendedFullMobile
} from '@ta-interaktiv/react-disco-grid'
import { CSSProperties, ReactNode } from 'react'
import styled from 'styled-components'
import { useMFContext } from '../MFHelpers'

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
  innerSpace = '15px',
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
  const { colorMode } = useMFContext()
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
        <Footer>
          {hint && <Hint colorMode={colorMode}>{hint}</Hint>}
          {source && <Source>{source}</Source>}
        </Footer>
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
  font-size: 14px;
  line-height: 23px;
  margin-bottom: 10px;
  @media screen and (max-width: 768px) {
    font-size: 12px;
    line-height: 1.6em;
  }
`

const Title = styled.h3`
  margin: 0;
  padding: 0;
  font-size: 21px;
  line-height: 28px;
  margin-bottom: 6px;
  @media screen and (max-width: 768px) {
    font-size: 20px;
    line-height: 1.4em;
  }
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 5px;
`
const Hint = styled.div<{ colorMode: 'light' | 'dark' }>`
  font-size: 11px;
  line-height: 18px;
  color: ${({ colorMode }) =>
    colorMode === 'light' ? 'var(--gray-1)' : 'var(--gray-4)'};
`
const Source = styled.div`
  font-size: 11px;
  line-height: 1.4em;
  color: var(--gray-3);

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
