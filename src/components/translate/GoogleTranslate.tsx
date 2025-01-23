import React, { useEffect } from 'react';

const FloatingLanguageButton: React.FC = () => {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;

      script.onload = () => {
        console.log('Google Translate script loaded');
      };
      script.onerror = () => {
        console.error('Error loading Google Translate script');
      };

      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en', // The default language of the website
            includedLanguages: 'am,ti,om,en', // Include languages you want to offer
            layout: window.google.translate.TranslateElement.FloatPosition.TOP_LEFT,
          },
          'google_translate_element'
        );
      };
    };

    addGoogleTranslateScript();
  }, []);

  return (
    <div  className="fixed bottom-8 right-8 z-50" id="google_translate_element"></div> 
  );
};

export default FloatingLanguageButton;
