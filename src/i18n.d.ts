
type Locale = 'en' | 'fr' | 'de'; 
type Namespace = 'translation' | 'common' | 'validation'; 

type TranslationKeys = {
  [key in Namespace]: {
    [subKey: string]: string; 
  };
};

declare module 'react-i18next' {
  // Custom type for translation functions
  interface TFunction {
    (key: keyof TranslationKeys['translation'], options?: Record<string, unknown>): string;
  }

  interface UseTranslationResponse {
    t: TFunction;
    i18n: {
      language: Locale;
      changeLanguage: (lng: Locale) => Promise<void>;
    };
  }
}
