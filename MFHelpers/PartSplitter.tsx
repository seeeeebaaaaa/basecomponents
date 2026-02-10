import React from 'react';
import { LazyViz } from './LazyViz';

// Detect development mode
const isDev = window.location.hostname.includes("localhost");

interface PartProps {
  partId: string;
  currentPart: string;
  content: React.ReactNode;
  placeHolderHeight?: string | number;
  onVisible?: (name?: string) => void;
}

/**
 * Part - A component that conditionally renders content based on the part number
 * 
 * This component renders its content only if the current part matches the specified part
 * or if the application is in development mode.
 */
export const Part: React.FC<PartProps> = ({
  partId,
  currentPart,
  content,
  placeHolderHeight,
  onVisible
}) => {
  // Only render if this part matches the current part or if in development mode
  if (partId === currentPart || isDev) {
    return (<>{content}</>
      // <LazyViz
      //   name={`Part ${partId}`}
      //   placeHolderHeight={placeHolderHeight}
      //   onVisible={onVisible}
      // >
      //   {content}
      // </LazyViz>
    );
  }
  
  // Return null if this part doesn't match the current part
  return null;
};

interface PartSplitterProps {
  currentPart: string;
  parts: {
    [partId: string]: React.ReactNode;
  };
  placeHolderHeights?: {
    [partId: string]: string | number;
  };
  onVisible?: (name?: string) => void;
}

/**
 * PartSplitter - A component that renders parts based on the current part
 * 
 * This component maps through a dictionary of parts and renders only the one
 * that matches the current part, or all of them if in development mode.
 */
export const PartSplitter: React.FC<PartSplitterProps> = ({
  currentPart,
  parts,
  placeHolderHeights = {},
  onVisible
}) => {
  return (
    <>
      {Object.entries(parts).map(([partId, content]) => (
        <Part
          key={partId}
          partId={partId}
          currentPart={currentPart}
          content={content}
          placeHolderHeight={placeHolderHeights[partId]}
          onVisible={onVisible}
        />
      ))}
    </>
  );
};

export default PartSplitter;