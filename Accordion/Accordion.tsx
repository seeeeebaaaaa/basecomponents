import {
  ArticleWidth,
  ContentWidth,
  TextWidth,
  TextWidthExtended,
} from "@ta-interaktiv/react-disco-grid";
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

interface AccordionProps {
  /** Always visible content */
  header: React.ReactNode;
  /** Content that slides in/out */
  content: React.ReactNode;
  /** Custom trigger button - if not provided, header will be clickable */
  trigger?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  /** Whether to show a peek of the content when closed */
  showPeek?: boolean;
  /** Height of peek in pixels when showPeek is true */
  peekHeight?: number;
  /** Initial open state */
  defaultOpen?: boolean;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback when toggle state changes */
  onToggle?: (isOpen: boolean) => void;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** With from the Disco-Grid if not provided it will be 100% */
  width?: "TextWidth" | "TextWidthExtended" | "ContentWidth" | "ArticleWidth";
  /** Space after in pixels */
  spaceAfter?: number;
  /** Space before in pixels */
  spaceBefore?: number;
  /** gradinent color */
  gradientColor?: string;
}

/**
 * A reusable slide toggle component that shows/hides content with smooth animations
 */
const Accordion: React.FC<AccordionProps> = ({
  header,
  content,
  trigger,
  showPeek = false,
  peekHeight = 50,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  animationDuration = 300,
  width,
  spaceAfter = 50,
  spaceBefore = 0,
  gradientColor = "var(--site-background)",
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  const ContainerComponent =
    width === "TextWidth"
      ? TextWidth
      : width === "TextWidthExtended"
      ? TextWidthExtended
      : width === "ContentWidth"
      ? ContentWidth
      : width === "ArticleWidth"
      ? ArticleWidth
      : Container;
  // Use controlled state if provided, otherwise use internal state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Use ResizeObserver for more accurate height calculation
  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        // Force a reflow to get accurate measurements
        contentRef.current.style.height = "auto";

        // Get computed styles to account for margins and padding
        const computedStyle = window.getComputedStyle(contentRef.current);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;

        // Use getBoundingClientRect for more accurate measurement including margins
        const rect = contentRef.current.getBoundingClientRect();
        const height = Math.ceil(rect.height + marginTop + marginBottom + 5); // Add 5px buffer

        setContentHeight(height);
      }
    };

    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });

      resizeObserver.observe(contentRef.current);

      // Initial measurement
      updateHeight();

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [content]);

  // Recalculate height when opening to ensure accuracy
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.height = "auto";

          const computedStyle = window.getComputedStyle(contentRef.current);
          const marginTop = parseFloat(computedStyle.marginTop) || 0;
          const marginBottom = parseFloat(computedStyle.marginBottom) || 0;

          const rect = contentRef.current.getBoundingClientRect();
          const height = Math.ceil(rect.height + marginTop + marginBottom + 5);

          setContentHeight(height);
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  /**
   * Toggle the open/closed state
   */
  const handleToggle = () => {
    const newIsOpen = !isOpen;

    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newIsOpen);
    }

    onToggle?.(newIsOpen);
  };

  /**
   * Calculate the target height based on current state
   */
  const getTargetHeight = () => {
    if (isOpen) {
      return contentHeight + 10;
    }
    return showPeek ? peekHeight : 0;
  };

  return (
    <ContainerComponent style={{overflowX: 'visible'}}>
      <SpaceBefore style={{ marginTop: spaceBefore }} />
      <HeaderContainer
        onClick={trigger ? undefined : handleToggle}
        $isClickable={!trigger}
      >
        {header}
      </HeaderContainer>

      <ContentContainer
        $height={getTargetHeight()}
        $animationDuration={animationDuration}
      >
        <ContentInner ref={contentRef}>{content}</ContentInner>
        {showPeek && !isOpen && (
          <GradientOverlay
            $peekHeight={peekHeight}
            $gradientColor={gradientColor}
          />
        )}
      </ContentContainer>

      {trigger && !defaultOpen && (
        <TriggerContainer>
          <TriggerWrapper onClick={handleToggle}>
            {typeof trigger === "function" ? trigger(isOpen) : trigger}
          </TriggerWrapper>
        </TriggerContainer>
      )}
      <SpaceAfter style={{ marginBottom: spaceAfter }} />
    </ContainerComponent>
  );
};

const SpaceBefore = styled.div`
  display: block;
  width: 100%;
`;

const SpaceAfter = styled.div`
  display: block;
  width: 100%;
`;
const Container = styled.div`
  /* No visual styling - purely structural */
`;

const HeaderContainer = styled.div<{ $isClickable: boolean }>`
  width: 100%;
  overflow-x: visible;
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;

const TriggerContainer = styled.div`
  /* Container for the trigger button */
  margin-top: 5px;
  width: 100%;
  text-align: center;
  &:hover,
  *:hover {
    cursor: pointer;
  }
`;

const TriggerWrapper = styled.div`
  cursor: pointer;
`;

const ContentContainer = styled.div<{
  $height: number;
  $animationDuration: number;
}>`
  position: relative;
  height: ${({ $height }) => $height}px;
  overflow: hidden;
  transition: height ${({ $animationDuration }) => $animationDuration}ms
    ease-in-out;
`;

const ContentInner = styled.div`
  /* Inner container to measure actual content height */
  width: 100%;
`;

const GradientOverlay = styled.div<{
  $peekHeight: number;
  $gradientColor: string;
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ $peekHeight }) => Math.min($peekHeight, 60)}px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${({ $gradientColor }) => $gradientColor} 80%
  );
  pointer-events: none;
`;

export default Accordion;
