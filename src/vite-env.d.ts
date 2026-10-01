/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add more custom env keys here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Google Translate Element (loaded from translate.google.com script). */
interface GoogleTranslateElementOptions {
  pageLanguage?: string;
  includedLanguages?: string;
  autoDisplay?: boolean;
}

interface Window {
  googleTranslateElementInit?: () => void;
  google?: {
    translate: {
      TranslateElement: new (
        options: GoogleTranslateElementOptions,
        elementId: string,
      ) => void;
    };
  };
}
