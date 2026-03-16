import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useIntersectionObserver } from "usehooks-ts";

/** Normalizes a scalar or tuple offset into a [horizontal, vertical] tuple. */
export function getOffset(offset: number | [number, number]): [number, number] {
  if (Array.isArray(offset)) return offset;
  return [offset, offset];
}

/** Triggers visibility animation when the element scrolls into view. */
export function useAnimateOnIntersect(
  animate: boolean,
  animationDelay: number,
  threshold: number
) {
  const [isVisible, setIsVisible] = useState(!animate);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const hasAnimatedRef = useRef(!animate);
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold,
    rootMargin: "50px",
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (!isIntersecting || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    setShouldAnimate(true);
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [isIntersecting, animationDelay]);

  return { isVisible, shouldAnimate, ref };
}

export const ContentContainer = styled.div<{
  $isVisible: boolean;
  $shouldAnimate: boolean;
  $transformOrigin?: string;
}>`
  position: absolute;
  line-height: 1em;
  opacity: ${(p) => (p.$isVisible ? 1 : 0)};
  scale: ${(p) => (p.$isVisible ? 1 : 0)};
  transform-origin: ${(p) => p.$transformOrigin ?? "left center"};
  transition: opacity 0.3s ease-in-out;
  * {
    line-height: unset;
  }
  animation: ${(p) =>
    p.$isVisible && p.$shouldAnimate
      ? "annoScaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
      : "none"};
  @keyframes annoScaleUp {
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
