import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";

interface LazyVisualizationProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color, #f5f5f5);
  color: var(--text-color, #333);
`;

/**
 * LazyVisualization - A component that lazily renders its children when they enter the viewport
 *
 * @param {React.ReactNode} children - The visualization component to render
 * @param {React.ReactNode} placeholder - Optional placeholder to show while loading
 * @param {string} rootMargin - IntersectionObserver rootMargin, default "200px"
 * @param {number} threshold - IntersectionObserver threshold, default 0.1
 * @param {Function} onVisibilityChange - Optional callback when visibility changes
 */
const LazyVisualization: React.FC<LazyVisualizationProps> = ({
  children,
  placeholder,
  rootMargin = "200px",
  threshold = 0.1,
  onVisibilityChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const isVisibleRef = useRef(false);
  const onVisibilityChangeRef = useRef(onVisibilityChange);
  onVisibilityChangeRef.current = onVisibilityChange;
  hasLoadedRef.current = hasLoaded;
  isVisibleRef.current = isVisible;

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const newIsVisible = entry.isIntersecting;

        if (newIsVisible && !hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setIsVisible(true);
          setHasLoaded(true);
          onVisibilityChangeRef.current?.(true);
        } else if (newIsVisible !== isVisibleRef.current) {
          isVisibleRef.current = newIsVisible;
          setIsVisible(newIsVisible);
          onVisibilityChangeRef.current?.(newIsVisible);
        }
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(currentRef);
    return () => observer.unobserve(currentRef);
  }, [rootMargin, threshold]);

  return (
    <>
      {hasLoaded ? (
        <>{children}</>
      ) : (
        <Wrapper ref={ref}>
          {placeholder || <Placeholder>Loading visualization...</Placeholder>}
        </Wrapper>
      )}
    </>
  );
};

export default LazyVisualization;
