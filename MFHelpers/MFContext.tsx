// react context for setting locale
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useWindowSize } from "usehooks-ts";

type Locale = Record<
  string,
  string | ReactNode | { [key: string]: string | ReactNode }
>;

interface MFContextType {
  _t: (
    key: string,
    params?: Record<string, string | number>
  ) => string | ReactNode;
  currentLocale: Locale;
  currentLanguage: "de" | "fr";
  colorMode: "light" | "dark";
  isMobile: boolean;
  tenantKey: string;
  windowHeight: number;
  trackEvent:
    | ((
        event: string,
        eventData: {
          [key: string]: any;
        }
      ) => void)
    | undefined;
  properties: {
    [key: string]: string;
  };
  customProps?: Record<string, any>;
  placeHolderHeight?: number;
}

const MFContext = createContext<MFContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current?.[key] !== undefined ? current[key] : undefined;
  }, obj);
}

const noopTrackEvent = () => {};

interface MFContextProviderProps {
  children?: ReactNode;
  locale: "de" | "fr";
  colorMode: "light" | "dark";
  translations: {
    de: Locale;
    fr?: Locale;
  };
  tenantKey: string;
  properties: {
    [key: string]: string;
  };
  trackEvent:
    | ((
        event: string,
        eventData: {
          [key: string]: any;
        }
      ) => void)
    | undefined;
  customProps?: { [key: string]: any };
  placeHolderHeight?: number;
}

export const MFContextProvider: React.FC<MFContextProviderProps> = ({
  children,
  locale,
  translations,
  colorMode,
  tenantKey,
  trackEvent,
  properties,
  customProps,
  placeHolderHeight = 300,
}) => {
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 768;
  const [windowHeight, setHeight] = useState(0);

  useEffect(() => {
    setHeight(windowSize.height + 100);
  }, []);
  /*

  Translations

  */
  const currentLocale =
    locale === "fr" && translations.fr ? translations.fr : translations.de;

  /**
   * Translates a key into the current locale's text, with optional parameter substitution
   * @param key - The translation key to look up in the currentLocale object. Supports dot notation for nested objects.
   * @param params - Optional object containing key-value pairs for parameter substitution.
   *                Parameters in the translation string should be formatted as {{paramName}}
   * @returns The translated string/ReactNode with parameters replaced, or "[key]" if translation is missing
   * @example
   * // With string translation "greeting": "Hello {{name}}!"
   * _t("greeting", { name: "John" }) // returns "Hello John!"
   *
   * // With nested object translation "educationLabels": { "0": "Primary", "1": "Secondary" }
   * _t("educationLabels.0") // returns "Primary"
   *
   * // With ReactNode translation
   * _t("component", { name: "John" }) // returns the ReactNode as-is
   *
   * // With missing translation
   * _t("missing_key") // returns "[missing_key]"
   */
  const _t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let translation = getNestedValue(currentLocale, key);

      if (translation === undefined) {
        console.log(
          "%cTranslation missing: " + key + " in " + locale,
          "color: red"
        );
        translation = "[" + key + "]";
      }
      if (params && typeof translation === "string") {
        translation = translation.replace(
          /\{\{(\w+)\}\}/g,
          (_, paramKey) => String(params[paramKey] ?? "{{" + paramKey + "}}")
        );
      } else if (params && typeof translation !== "string") {
        console.warn(
          `Parameter substitution not supported for ReactNode translation: ${key}`
        );
      }

      return typeof translation === "string"
        ? translation
        : typeof translation === "object"
          ? (translation as ReactNode)
          : `[${key}]`;
    },
    [currentLocale, locale]
  );

  const memoizedTrackEvent = trackEvent ?? noopTrackEvent;

  const value = useMemo(() => {
    return {
      _t,
      trackEvent: memoizedTrackEvent,
      currentLocale,
      currentLanguage: locale,
      colorMode,
      isMobile,
      tenantKey,
      windowHeight,
      properties,
      placeHolderHeight,
      customProps,
    };
  }, [
    _t,
    memoizedTrackEvent,
    currentLocale,
    locale,
    colorMode,
    isMobile,
    tenantKey,
    windowHeight,
    properties,
    placeHolderHeight,
    customProps,
  ]);

  return (
    <MFContext.Provider value={value}>
      {children}
    </MFContext.Provider>
  );
};

export const useMFContext = () => {
  const context = useContext(MFContext);
  if (context === undefined) {
    throw new Error("useMFContext must be used within a MFContextProvider");
  }
  return context;
};

/** Returns the full URL for a path in the public folder. */
export function url(pathInPublicFolder: string) {
  return import.meta.env.BASE_URL + pathInPublicFolder;
}
