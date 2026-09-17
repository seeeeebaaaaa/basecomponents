import React from 'react';
import { LazyViz } from './LazyViz';
import { MFPropertiesOverride } from './MFContext';

// Detect development mode
const isDev = import.meta.env.DEV;

interface PartVariant {
  id: string;
  properties: Record<string, string>;
}

interface PartDefinition {
  content: React.ReactNode;
  variants?: PartVariant[];
}

interface PartProps {
  partId: string;
  currentPart: string;
  definition: PartDefinition;
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
  definition,
  placeHolderHeight,
  onVisible
}) => {
  if (partId !== currentPart && !isDev) {
    return null;
  }

  if (!isDev || !definition.variants?.length) {
    return <>{definition.content}</>;
  }

  return (
    <>
      {definition.variants.map(({ id, properties }) => (
        <MFPropertiesOverride key={id} properties={properties}>
          {definition.content}
        </MFPropertiesOverride>
      ))}
    </>
  );
};

interface PartSplitterProps {
  currentPart: string;
  parts: {
    [partId: string]: PartDefinition;
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
      {Object.entries(parts).map(([partId, definition]) => (
        <Part
          key={partId}
          partId={partId}
          currentPart={currentPart}
          definition={definition}
          placeHolderHeight={placeHolderHeights[partId]}
          onVisible={onVisible}
        />
      ))}
    </>
  );
};

export default PartSplitter;