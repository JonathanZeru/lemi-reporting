// global.d.ts
interface GoogleTranslateElement {
    TranslateElement: any; // You can provide a more specific type if known
  }
  
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: GoogleTranslateElement;
    };
  }
  