import { 
  ElementSelector, 
  InjectionInstruction, 
  SelectionStrategy, 
  SelectionStep 
} from './ElementSelectorTypes';

/**
 * Fetches injection instructions from FTP server
 */
export const fetchInjectionInstructions = async (
  instructionUrl: string
): Promise<InjectionInstruction | null> => {
  try {
    const response = await fetch(instructionUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch instructions: ${response.status}`);
    }
    const instructions = await response.json();
    console.log('Loaded injection instructions from server:', instructions.version);
    return instructions;
  } catch (error) {
    console.error('Failed to load remote instructions:', error);
    return null;
  }
};

/**
 * Finds element based on selector configuration
 */
const findElementBySelector = (
  selector: ElementSelector, 
  context: Document | Element = document
): Element | null => {
  let elements: NodeListOf<Element> | Element[] = [];

  switch (selector.type) {
    case 'tag':
      elements = context.querySelectorAll(selector.value);
      break;
    case 'class':
      elements = context.querySelectorAll(`.${selector.value}`);
      break;
    case 'id':
      const idElement = context.querySelector(`#${selector.value}`);
      elements = idElement ? [idElement] : [];
      break;
    case 'css':
      elements = context.querySelectorAll(selector.value);
      break;
    case 'attribute':
      if (selector.attribute) {
        elements = context.querySelectorAll(`[${selector.attribute}="${selector.value}"]`);
      }
      break;
    case 'text':
      // Find elements containing specific text
      const allElements = context.querySelectorAll('*');
      elements = Array.from(allElements).filter(el => 
        el.textContent?.includes(selector.value)
      );
      break;
  }

  const elementsArray = Array.from(elements);
  const index = selector.index ?? 0;
  
  return elementsArray[index] || null;
};

/**
 * Executes a single selection step
 */
const executeSelectionStep = (
  step: SelectionStep, 
  currentElement: Element | null
): Element | null => {
  if (!currentElement && step.action !== 'find') {
    return null;
  }

  switch (step.action) {
    case 'find':
      return findElementBySelector(step.selector);
      
    case 'findWithin':
      return currentElement ? findElementBySelector(step.selector, currentElement) : null;
      
    case 'findParent':
      if (!currentElement) return null;
      let parent = currentElement.parentElement;
      while (parent) {
        if (matchesSelector(parent, step.selector)) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
      
    case 'findSibling':
      if (!currentElement) return null;
      const siblings = Array.from(currentElement.parentElement?.children || []);
      return siblings.find(sibling => 
        sibling !== currentElement && matchesSelector(sibling, step.selector)
      ) || null;
      
    default:
      return null;
  }
};

/**
 * Checks if element matches selector
 */
const matchesSelector = (element: Element, selector: ElementSelector): boolean => {
  switch (selector.type) {
    case 'tag':
      return element.tagName.toLowerCase() === selector.value.toLowerCase();
    case 'class':
      return element.classList.contains(selector.value);
    case 'id':
      return element.id === selector.value;
    case 'css':
      return element.matches(selector.value);
    case 'attribute':
      return selector.attribute ? 
        element.getAttribute(selector.attribute) === selector.value : false;
    case 'text':
      return element.textContent?.includes(selector.value) || false;
    default:
      return false;
  }
};

/**
 * Executes a complete selection strategy
 */
const executeStrategy = (strategy: SelectionStrategy): Element | null => {
  let currentElement: Element | null = null;
  
  console.log(`Trying strategy: ${strategy.name}`);
  
  for (const step of strategy.steps) {
    const result = executeSelectionStep(step, currentElement);
    
    if (!result && step.required) {
      console.log(`Strategy ${strategy.name} failed at step: ${step.action} ${step.selector.type}:${step.selector.value}`);
      return null;
    }
    
    currentElement = result;
  }
  
  if (currentElement) {
    console.log(`Strategy ${strategy.name} succeeded`);
  }
  
  return currentElement;
};

/**
 * Finds target element using instruction strategy
 */
export const findTargetElement = (instructions: InjectionInstruction): {
  element: Element | null;
  strategy: SelectionStrategy | null;
} => {
  const strategy = instructions.strategy;
  console.log(`Trying strategy: ${strategy.name}`);
  
  const element = executeStrategy(strategy);
  
  if (element) {
    console.log(`Strategy ${strategy.name} succeeded`);
    return { element, strategy };
  } else {
    console.error(`Strategy ${strategy.name} failed`);
    return { element: null, strategy: null };
  }
};

/**
 * Creates injection container
 */
export const createInjectionContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.id = 'inject-into-header-content';
  return container;
};

/**
 * Injects container into DOM based on strategy configuration
 */
export const injectContainer = (
  container: HTMLDivElement,
  targetElement: Element,
  strategy: SelectionStrategy
): boolean => {
  try {
    switch (strategy.injection.position) {
      case 'before':
        targetElement.parentElement?.insertBefore(container, targetElement);
        break;
      case 'after':
        targetElement.parentElement?.insertBefore(container, targetElement.nextSibling);
        break;
      case 'prepend':
        targetElement.insertBefore(container, targetElement.firstChild);
        break;
      case 'append':
        targetElement.appendChild(container);
        break;
      case 'replace':
        targetElement.parentElement?.replaceChild(container, targetElement);
        break;
      default:
        console.error(`Unknown injection position: ${strategy.injection.position}`);
        return false;
    }
    
    console.log(`Container injected using position: ${strategy.injection.position}`);
    return true;
  } catch (error) {
    console.error('Failed to inject container:', error);
    return false;
  }
};
