// Types for flexible element selection instructions
export interface ElementSelector {
  type: 'tag' | 'class' | 'id' | 'attribute' | 'text' | 'css';
  value: string;
  index?: number; // For selecting nth element when multiple matches
  attribute?: string; // For attribute-based selection
}

export interface InjectionInstruction {
  version: string;
  description?: string;
  strategy: SelectionStrategy;
}

export interface SelectionStrategy {
  name: string;
  steps: SelectionStep[];
  injection: InjectionConfig;
}

export interface SelectionStep {
  action: 'find' | 'findWithin' | 'findParent' | 'findSibling';
  selector: ElementSelector;
  required: boolean; // If false, step failure won't fail entire strategy
}

export interface InjectionConfig {
  position: 'before' | 'after' | 'prepend' | 'append' | 'replace';
  elementToCenter?: string; // Tag name for the element to center (e.g., 'h1', 'h2', 'h3')
}

// Example instruction format
export const EXAMPLE_INSTRUCTION: InjectionInstruction = {
  version: "1.0.0",
  description: "Header injection for Tamedia articles",
  strategy: {
    name: "h2_parent_method",
    steps: [
      {
        action: "find",
        selector: { type: "tag", value: "h2", index: 0 },
        required: true
      },
      {
        action: "findParent",
        selector: { type: "tag", value: "div" },
        required: true
      }
    ],
    injection: {
      position: "before",
      elementToCenter: "h2"
    }
  }
};
