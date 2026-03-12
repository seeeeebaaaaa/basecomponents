import React, { ReactNode, useEffect, useId, useState } from "react";
import styled from "styled-components";
import { useIntersectionObserver } from "usehooks-ts";

const defaultConnectorStyle: Required<Omit<ConnectorSpecs, "markerSize" | "markerColor">> = {
  type: "straight",
  stroke: "var(--anno-connector-stroke)",
  width: 1,
  direction: "cw",
  strokeWidth: 1,
  strokeOpacity: 1,
  strokeLinecap: "butt",
  strokeLinejoin: "miter",
  strokeMiterlimit: 4,
  strokeDasharray: "none",
  strokeDashoffset: 0,
};

const defaultMarkerStyle: Required<MarkerStyle> = {
  size: 13,
  fill: "white",
  stroke: "var(--anno-connector-stroke)",
  strokeWidth: 1,
};

export const PointAnnotation = ({
  children,
  offset = 0,

  connectorStyle,
  markerStyle,

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
  markerStyle?: MarkerStyle;
  endMarker?: "arrow" | "circle" | "triangle" | "none" | string;
  startMarker?: "arrow" | "circle" | "triangle" | "none" | string;
  customMarkers?: Record<string, ReactNode>;
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
  const connectorSettings = {
    ...defaultConnectorStyle,
    ...connectorStyle,
  };
  const markerSettings: Required<MarkerStyle> = {
    ...defaultMarkerStyle,
    ...markerStyle,
    ...(connectorStyle?.markerSize != null && { size: connectorStyle.markerSize }),
    ...(connectorStyle?.markerColor != null && { fill: connectorStyle.markerColor }),
    ...(markerStyle?.strokeWidth == null && {
      strokeWidth: Number(connectorSettings.strokeWidth) || 1,
    }),
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

  const { size: markerSize } = markerSettings;

  const hasPaddingOnPathEnd =
    padding > 0 &&
    (shiftToLeft || shiftToRight || shiftToTop || shiftToBottom);
  const markerRadius = markerSize / 2;
  const startInset =
    (startMarker !== "none" ? markerRadius : 0) +
    (startMarker !== "none" && hasPaddingOnPathEnd ? padding : 0);
  const endInset =
    (endMarker !== "none" ? markerRadius : 0) +
    (hasPaddingOnPathEnd ? padding : 0);

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
            markerUnits="userSpaceOnUse"
            viewBox={`0 0 ${markerSize} ${markerSize}`}
            refX={markerSize}
            refY={markerSize / 2}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient="auto-start-reverse"
            overflow="visible"
          >
            <path
              d={`M 0 0 L ${markerSize} ${markerSize / 2} L 0 ${markerSize} z`}
              fill={markerSettings.fill}
              stroke={markerSettings.stroke}
              strokeWidth={markerSettings.strokeWidth}
            />
          </marker>
          <marker
            id={`circle-${id}`}
            markerUnits="userSpaceOnUse"
            viewBox={`0 0 ${markerSize} ${markerSize}`}
            refX={markerSize / 2}
            refY={markerSize / 2}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient="auto-start-reverse"
            overflow="visible"
          >
            <circle
              cx={markerSize / 2}
              cy={markerSize / 2}
              r={markerSize / 2}
              fill={markerSettings.fill}
              stroke={markerSettings.stroke}
              strokeWidth={markerSettings.strokeWidth}
            />
          </marker>
          <marker
            id={`triangle-${id}`}
            markerUnits="userSpaceOnUse"
            viewBox={`0 0 ${markerSize} ${markerSize}`}
            refX={markerSize / 2}
            refY={markerSize}
            markerWidth={markerSize}
            markerHeight={markerSize}
            orient="auto-start-reverse"
            overflow="visible"
          >
            <path
              d={`M ${markerSize / 2} 0 L ${markerSize} ${markerSize} L 0 ${markerSize} z`}
              fill={markerSettings.fill}
              stroke={markerSettings.stroke}
              strokeWidth={markerSettings.strokeWidth}
            />
          </marker>
          {customMarkers &&
            Object.entries(customMarkers).map(([key, markerContent]) => (
              <marker
                key={key}
                id={`${key}-${id}`}
                markerUnits="userSpaceOnUse"
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={markerSize / 2}
                refY={markerSize / 2}
                markerWidth={markerSize}
                markerHeight={markerSize}
                orient="auto-start-reverse"
                overflow="visible"
              >
                {markerContent}
              </marker>
            ))}
        </defs>
        {/* Marker path: full length so markers stay at original positions */}
        <Path
          d={getLinePath(
            v,
            h,
            direction,
            connectorDirection,
            connectorSettings.type
          )}
          style={{ stroke: "none" }}
          fill="none"
          markerStart={getMarkerUrl(startMarker)}
          markerEnd={getMarkerUrl(endMarker)}
          $isVisible={isVisible}
        />
        {/* Line path: shortened to respect markerSize and padding */}
        <Path
          d={getLinePath(
            v,
            h,
            direction,
            connectorDirection,
            connectorSettings.type,
            startInset,
            endInset
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

/** Shortens a line segment by moving endpoints inward along the segment direction. */
function shortenSegment(
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  startInset: number,
  endInset: number
) {
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { sx, sy, ex, ey };
  const ux = dx / len;
  const uy = dy / len;
  const newSx = sx + ux * Math.min(startInset, len / 2);
  const newSy = sy + uy * Math.min(startInset, len / 2);
  const newEx = ex - ux * Math.min(endInset, len / 2);
  const newEy = ey - uy * Math.min(endInset, len / 2);
  return { sx: newSx, sy: newSy, ex: newEx, ey: newEy };
}

/** Shortens curved path endpoints using tangent direction at each end. */
function shortenCurvedEndpoints(
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  startInset: number,
  endInset: number
) {
  let nsx = sx,
    nsy = sy,
    nex = ex,
    ney = ey;
  if (startInset > 0) {
    const tx = c1x - sx;
    const ty = c1y - sy;
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    nsx = sx + (tx / len) * startInset;
    nsy = sy + (ty / len) * startInset;
  }
  if (endInset > 0) {
    const tx = ex - c2x;
    const ty = ey - c2y;
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    nex = ex - (tx / len) * endInset;
    ney = ey - (ty / len) * endInset;
  }
  return { sx: nsx, sy: nsy, ex: nex, ey: ney };
}

function getLinePath(
  v: number,
  h: number,
  direction: Direction,
  curveDirection: "cw" | "ccw",
  connectorStyle: "straight" | "curved",
  startInset = 0,
  endInset = 0
) {
  const linePoints = getLinePoints(v, h);
  let { sx, sy, ex, ey } = linePoints;

  if (connectorStyle === "straight") {
    if (startInset > 0 || endInset > 0) {
      ({ sx, sy, ex, ey } = shortenSegment(
        sx,
        sy,
        ex,
        ey,
        startInset,
        endInset
      ));
    }
    return `M ${sx} ${sy} L ${ex} ${ey}`;
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

  if (startInset > 0 || endInset > 0) {
    ({ sx, sy, ex, ey } = shortenCurvedEndpoints(
      linePoints.sx,
      linePoints.sy,
      linePoints.ex,
      linePoints.ey,
      c1x,
      c1y,
      c2x,
      c2y,
      startInset,
      endInset
    ));
  } else {
    sx = linePoints.sx;
    sy = linePoints.sy;
    ex = linePoints.ex;
    ey = linePoints.ey;
  }

  return `M ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`;
}
