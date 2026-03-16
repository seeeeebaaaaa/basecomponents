import React, { ReactNode } from "react";
import styled from "styled-components";
import { ContentContainer, getOffset, useAnimateOnIntersect } from "./shared";

const defaultArrowStyle = {
  stroke: "var(--anno-connector-stroke)",
  strokeWidth: 2,
  strokeOpacity: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "var(--anno-connector-stroke)",
};

/** Renders a configurable arrow with rotation and an unrotated label. Use for north arrows, flow direction, etc. */
export const ArrowAnnotation = ({
  children,
  degrees = 0,
  length = 40,
  arrowSize,
  arrowStyle = {},
  offset = 0,
  textAnchor = "center",
  animate = false,
  animationDelay = 200,
  threshold = 0.1,
}: {
  children?: ReactNode;
  /** Arrow direction in degrees. 0 = right (east), 90 = down (south), 180 = left (west), 270 = up (north). */
  degrees?: number;
  /** Arrow length in pixels. */
  length?: number;
  /** Size of the arrowhead triangle in pixels. When provided, only affects the head, not the shaft. */
  arrowSize?: number;
  arrowStyle?: {
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    fill?: string;
  };
  /** Label offset from arrow center [horizontal, vertical] in pixels. */
  offset?: number | [number, number];
  textAnchor?: "left" | "center" | "right";
  animate?: boolean;
  animationDelay?: number;
  threshold?: number;
}) => {
  const { isVisible, shouldAnimate, ref } = useAnimateOnIntersect(animate, animationDelay, threshold);

  const [h, v] = getOffset(offset);
  const style = { ...defaultArrowStyle, ...arrowStyle };

  const headSize = arrowSize ?? Math.min(length * 0.35, 12);
  const shaftEnd = Math.max(0, length - headSize);

  let shiftLabelHorizontal = h >= 0 ? 0 : -100;
  if (textAnchor === "center") shiftLabelHorizontal = -50;
  if (textAnchor === "right") shiftLabelHorizontal = -100;
  if (textAnchor === "left") shiftLabelHorizontal = 0;
  const shaftPath = `M 0 0 L ${shaftEnd} 0`;
  const headPath = `M ${shaftEnd} ${-headSize / 2} L ${length} 0 L ${shaftEnd} ${headSize / 2} Z`;

  const size = length * 2;
  const center = length;

  return (
    <CenterAnchor style={{ width: size, height: size }} ref={ref}>
      <ArrowSvg
        width={size}
        height={size}
        viewBox={`${-length} ${-length} ${size} ${size}`}
        style={{ left: 0, top: 0 }}
        $isVisible={isVisible}
      >
        <g transform={`rotate(${degrees})`}>
          <ArrowPath
            d={shaftPath}
            style={{
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              strokeOpacity: style.strokeOpacity,
              strokeLinecap: style.strokeLinecap,
              fill: "none",
              vectorEffect: "non-scaling-stroke",
            }}
            $animate={animate}
            $isVisible={isVisible}
          />
          <ArrowPath
            d={headPath}
            style={{
              stroke: style.stroke,
              strokeWidth: style.strokeWidth,
              strokeOpacity: style.strokeOpacity,
              strokeLinejoin: style.strokeLinejoin,
              fill: style.fill,
              vectorEffect: "non-scaling-stroke",
            }}
            $animate={animate}
            $isVisible={isVisible}
          />
        </g>
      </ArrowSvg>
      <ContentContainer
        style={{
          minWidth: "max-content",
          left: center + h,
          top: center + v,
          transform: `translate(${shiftLabelHorizontal}%, -50%)`,
        }}
        $isVisible={isVisible}
        $shouldAnimate={shouldAnimate}
      >
        {children}
      </ContentContainer>
    </CenterAnchor>
  );
};

const CenterAnchor = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  overflow: visible;
  line-height: 1em;
`;

const ArrowSvg = styled.svg<{ $isVisible: boolean }>`
  position: absolute;
  overflow: visible;
  opacity: ${(p) => (p.$isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const ArrowPath = styled.path<{ $animate: boolean; $isVisible: boolean }>`
  ${(p) =>
    p.$animate
      ? `stroke-dasharray: 1000; stroke-dashoffset: ${p.$isVisible ? 0 : 1000}; transition: stroke-dashoffset 0.6s ease-in-out;`
      : ""}
`;
