import React, { useCallback } from "react";
import LazyVisualization from "./LazyVisualization";
import styled from "styled-components";
import { useMFContext } from ".";

// Loading placeholder that adapts to the color mode
const LoadingPlaceholder = styled.div<{ height?: string | number }>`
  width: 100%;
  height: ${(props) =>
    props.height
      ? typeof props.height === "number"
        ? `${props.height}px`
        : props.height
      : "300px"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface LazyVizProps {
  children: React.ReactNode;
  name?: string;
  placeHolderHeight?: string | number;
  onVisible?: (name?: string) => void;
}

/**
 * LazyViz - A simplified lazy-loaded visualization wrapper
 *
 * This component wraps a visualization with LazyVisualization and provides a
 * standardized loading placeholder.
 */

export const LazyViz: React.FC<LazyVizProps> = ({
  children,
  name,
  placeHolderHeight,
  onVisible,
}) => {
  const { placeHolderHeight: placeHolderHeightContext } = useMFContext();
  const handleVisibilityChange = useCallback(
    (isVisible: boolean) => {
      if (isVisible) onVisible?.(name);
    },
    [onVisible, name]
  );

  return (
    <LazyVisualization
      placeholder={
        <LoadingPlaceholder
          height={placeHolderHeight ?? placeHolderHeightContext}
        />
      }
      rootMargin="100px"
      onVisibilityChange={handleVisibilityChange}
    >
      {children}
    </LazyVisualization>
  );
};
