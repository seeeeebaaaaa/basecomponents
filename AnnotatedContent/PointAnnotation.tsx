import React, { ReactNode, useEffect, useId, useState } from "react";
import styled from "styled-components";
import { useIntersectionObserver } from "usehooks-ts";

const defaultConnectorStyle: Required<ConnectorSpecs> = {
  type: "straight",
  stroke: "var(--anno-connector-stroke)",
  width: 1,
  markerSize: 13,
  markerColor: "white",
  direction: "cw",
  strokeWidth: 1,
  strokeOpacity: 1,
  strokeLinecap: "butt",
  strokeLinejoin: "miter",
  strokeMiterlimit: 4,
  strokeDasharray: "none",
  strokeDashoffset: 0,
};

export const PointAnnotation = ({
  children,
  offset = 0,

  connectorStyle,

  endMarker = "none",
  startMarker = "none",
  customMarkers,

  padding = 0,
  textAnchor,
  animate = false,
  animationDelay = 200,
  threshold = 0.1,
}: {
  children?: ReactNode;
  connectorStyle?: ConnectorSpecs;
  endMarker?: "arrow" | "circle" | "triangle" | "none" | string;
  startMarker?: "arrow" | "circle" | "triangle" | "none" | string;
  customMarkers?: Record<string, ReactNode>;
  markerSize?: number;
  textAnchor?: "left" | "center" | "right";
  padding?: number;
  offset?: number | [number, number];
  animate?: boolean;
  animationDelay?: number;
  threshold?: number;
}) => {
  const id = useId();

  const [isVisible, setIsVisible] = useState(!animate);
  const [hasAnimated, setHasAnimated] = useState(!animate);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold,
    rootMargin: "50px",
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      setHasAnimated(true);
      setShouldAnimate(true);
      setTimeout(() => {
        setIsVisible(true);
      }, animationDelay);
    }
  }, [isIntersecting, animationDelay, hasAnimated]);

  const [h, v] = getOffset(offset);
  const connectorSettings: Required<ConnectorSpecs> = {
    ...defaultConnectorStyle,
    ...connectorStyle,
  };
  const connectorDirection = connectorSettings.direction;
  const direction: Direction = getDirection([h, v]);
  let shiftToTop =
    direction === "top" ||
    (direction === "top-left" && connectorDirection === "ccw") ||
    (direction === "top-right" && connectorDirection === "cw");

  let shiftToBottom =
    direction === "bottom" ||
    (direction === "bottom-left" && connectorDirection === "cw") ||
    (direction === "bottom-right" && connectorDirection === "ccw") ||
    (direction === "top-left" && connectorDirection === "cw");

  let shiftToRight =
    direction === "right" ||
    (direction === "top-right" && connectorDirection === "ccw") ||
    (direction === "bottom-right" && connectorDirection === "cw");

  let shiftToLeft =
    direction === "left" ||
    (direction === "top-left" && connectorDirection === "cw") ||
    (direction === "bottom-left" && connectorDirection === "ccw");

  const noshift =
    !shiftToTop && !shiftToBottom && !shiftToRight && !shiftToLeft;

  if (noshift && padding) {
    shiftToRight = true;
    shiftToBottom = true;
  }

  const markerSize = connectorSettings.markerSize;

  // Helper function to get marker URL based on marker type
  const getMarkerUrl = (markerType: string) => {
    if (markerType === "none") return "";
    if (markerType === "arrow") return `url(#arrow-${id})`;
    if (markerType === "circle") return `url(#circle-${id})`;
    if (markerType === "triangle") return `url(#triangle-${id})`;
    // Check if it's a custom marker
    if (customMarkers && customMarkers[markerType]) {
      return `url(#${markerType}-${id})`;
    }
    return "";
  };

  let shiftLabelHorizontal = h >= 0 ? 0 : -100;
  if (textAnchor === "center") shiftLabelHorizontal = -50;
  if (textAnchor === "right") shiftLabelHorizontal = -100;
  if (textAnchor === "left") shiftLabelHorizontal = 0;



  return (
    <AnnotationContainer className="annoContainer" ref={ref}>
      <LineSvg
        width={Math.max(4, Math.abs(h))}
        height={Math.max(4, Math.abs(v))}
        style={{
          left: h >= 0 ? 0 : h,
          top: v >= 0 ? 0 : v,
        }}
        $isVisible={isVisible}
      >
        <defs>
          <marker
            id={`arrow-${id}`}
            viewBox={`0 0 ${markerSize * 2} ${markerSize * 2}`}
            refX={markerSize}
            refY={markerSize}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient="auto-start-reverse"
          >
            <path
              d={`M 0 0 L ${markerSize * 2} ${markerSize} L 0 ${
                markerSize * 2
              } z`}
              fill={connectorSettings.markerColor || connectorSettings.stroke}
            />
          </marker>
          <marker
            id={`circle-${id}`}
            viewBox={`0 0 ${markerSize * 2} ${markerSize * 2}`}
            refX={markerSize}
            refY={markerSize}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient="auto-start-reverse"
          >
            <circle
              cx={markerSize}
              cy={markerSize}
              r={markerSize}
              fill={connectorSettings.markerColor || connectorSettings.stroke}
            />
          </marker>
          <marker
            id={`triangle-${id}`}
            viewBox={`0 0 ${markerSize * 2} ${markerSize * 2}`}
            refX={markerSize}
            refY={markerSize}
            markerWidth={markerSize}
            markerHeight={markerSize}
          >
            <path
              d={`M ${markerSize} 0 L ${markerSize * 2} ${markerSize * 2} L 0 ${markerSize * 2} z`}
              fill={connectorSettings.markerColor || connectorSettings.stroke}
            />
          </marker>
          {customMarkers && Object.entries(customMarkers).map(([key, markerContent]) => (
            <marker
              key={key}
              id={`${key}-${id}`}
              viewBox={`0 0 ${markerSize * 2} ${markerSize * 2}`}
          
              markerWidth={markerSize}
              markerHeight={markerSize}
              orient="auto-start-reverse"
              overflow="visible"
            >
              {markerContent}
            </marker>
          ))}
        </defs>
        <Path
          d={getLinePath(
            v,
            h,
            direction,
            connectorDirection,
            connectorSettings.type
          )}
          style={{
            stroke: connectorSettings.stroke,
            strokeWidth: connectorSettings.strokeWidth,
            strokeLinecap: connectorSettings.strokeLinecap,
            strokeLinejoin: connectorSettings.strokeLinejoin,
            strokeDasharray: connectorSettings.strokeDasharray,
            strokeDashoffset: connectorSettings.strokeDashoffset,
            strokeMiterlimit: connectorSettings.strokeMiterlimit,
            strokeOpacity: connectorSettings.strokeOpacity,
          }}
          fill="none"
          markerEnd={getMarkerUrl(startMarker)}
          markerStart={getMarkerUrl(endMarker)}
          $isVisible={isVisible}
        />
      </LineSvg>
      <ContentContainer
        style={{
          minWidth: "max-content",
          left: h,
          top: v,
          transform: `translate(${shiftLabelHorizontal}%,${
            v >= 0 ? 0 : "calc(-100%)"
          })`,
          marginTop:
            direction === "left" || direction === "right" ? "-0.75em" : 0,
          paddingRight: shiftToLeft ? padding + "px" : 0,
          paddingLeft: shiftToRight ? padding + "px" : 0,
          paddingBottom: shiftToTop ? padding + "px" : 0,
          paddingTop: shiftToBottom ? padding + "px" : 0,
        }}
        $isVisible={isVisible}
        $shouldAnimate={shouldAnimate}
      >
        {children}
      </ContentContainer>
    </AnnotationContainer>
  );
};

const AnnotationContainer = styled.div`
  display: inline-block;
  line-height: 1em;
  position: absolute;
`;

const ContentContainer = styled.div<{ $isVisible: boolean; $shouldAnimate: boolean }>`
  position: absolute;
  line-height: 1em;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  scale: ${(props) => (props.$isVisible ? 1 : 0)};
  transform: ${(props) => props.style?.transform};
  transform-origin: left center;
  transition: opacity 0.3s ease-in-out;
  * {
    line-height: unset;
  }

  animation: ${(props) =>
    props.$isVisible && props.$shouldAnimate
      ? `scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
      : "none"};

  @keyframes scaleUp {
    0% {
      scale: 0;
    }
    70% {
      scale: 1.2;
    }
    100% {
      scale: 1;
    }
  }
`;

const LineSvg = styled.svg<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const Path = styled.path<{ $isVisible: boolean }>`
  stroke-dasharray: 1000;
  stroke-dashoffset: ${(props) => (props.$isVisible ? 0 : 1000)};
  transition: stroke-dashoffset 0.6s ease-in-out;
`;

function getOffset(offset: number | [number, number]) {
  if (Array.isArray(offset)) {
    return offset;
  }
  return [offset, offset];
}

function getDirection(offset: [number, number]) {
  const [h, v] = offset;

  if (h === 0 && v === 0) return "center";
  if (h === 0) return v > 0 ? "bottom" : "top";
  if (v === 0) return h > 0 ? "right" : "left";

  if (h > 0) {
    return v > 0 ? "bottom-right" : "top-right";
  } else {
    return v > 0 ? "bottom-left" : "top-left";
  }
}

function getLinePoints(v: number, h: number) {
  const sx = h >= 0 ? 0 : Math.abs(h);
  const sy = v >= 0 ? 0 : Math.abs(v);
  const ex = h >= 0 ? h : 0;
  const ey = v >= 0 ? v : 0;
  return { sx, sy, ex, ey };
}

function getLinePath(
  v: number,
  h: number,
  direction: Direction,
  curveDirection: "cw" | "ccw",
  connectorStyle: "straight" | "curved"
) {
  const linePoints = getLinePoints(v, h);

  if (connectorStyle === "straight") {
    return `M ${linePoints.sx} ${linePoints.sy} L ${linePoints.ex} ${linePoints.ey}`;
  }

  const halfH = Math.abs(h / 2);
  const halfV = Math.abs(v / 2);

  let c1x, c1y, c2x, c2y;

  switch (direction) {
    case "top":
    case "top-right":
      if (curveDirection === "cw") {
        c1x = linePoints.sx + halfH;
        c1y = linePoints.sy;
        c2x = linePoints.ex;
        c2y = linePoints.sy - halfV;
      } else {
        c1x = linePoints.sx;
        c1y = linePoints.sy - halfV;
        c2x = linePoints.sx + halfH;
        c2y = linePoints.ey;
      }
      break;
    case "right":
    case "bottom-right":
      if (curveDirection === "cw") {
        c1x = linePoints.sx;
        c1y = linePoints.sy + halfV;
        c2x = linePoints.sx + halfH;
        c2y = linePoints.ey;
      } else {
        c1x = linePoints.sx + halfH;
        c1y = linePoints.sy;
        c2x = linePoints.ex;
        c2y = linePoints.sy + halfV;
      }
      break;
    case "bottom":
    case "bottom-left":
      if (curveDirection === "cw") {
        c1x = linePoints.sx - halfH;
        c1y = linePoints.sy;
        c2x = linePoints.ex;
        c2y = linePoints.sy + halfV;
      } else {
        c1x = linePoints.sx;
        c1y = linePoints.sy + halfV;
        c2x = linePoints.sx - halfH;
        c2y = linePoints.ey;
      }
      break;
    case "left":
    case "top-left":
      if (curveDirection === "cw") {
        c1x = linePoints.sx;
        c1y = linePoints.sy - halfV;
        c2x = linePoints.sx - halfH;
        c2y = linePoints.ey;
      } else {
        c1x = linePoints.sx - halfH;
        c1y = linePoints.sy;
        c2x = linePoints.ex;
        c2y = linePoints.sy - halfV;
      }
      break;
    default: // center or unknown
      if (curveDirection === "cw") {
        c1x = halfH;
        c1y = linePoints.sy;
        c2x = linePoints.ex;
        c2y = halfV;
      } else {
        c1x = linePoints.sx;
        c1y = halfV;
        c2x = halfH;
        c2y = linePoints.ey;
      }
  }

  return `M ${linePoints.sx} ${linePoints.sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${linePoints.ex} ${linePoints.ey}`;
}
