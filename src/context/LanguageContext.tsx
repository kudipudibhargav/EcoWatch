import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'te';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    dashboard: "Dashboard",
    geoExplorer: "Geo Explorer",
    analytics: "Analytics",
    spaceMonitor: "Space Monitor",
    alerts: "Alerts",
    settings: "Settings",
    searchPlaceholder: "Search city, village, or coordinates...",
    systemSettings: "System Settings",
    appearance: "Appearance",
    language: "Language",
    languageDesc: "Select your preferred language",
    units: "Measurement Units",
    alertsPrivacy: "Alerts & Privacy",
    guestUser: "Guest User",
    ecoUser: "Eco User"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    geoExplorer: "भू-अन्वेषक",
    analytics: "एनालिटिक्स",
    spaceMonitor: "स्काई मॉनिटर",
    alerts: "अलर्ट",
    settings: "सेटिंग्स",
    searchPlaceholder: "शहर, गांव या निर्देशांक खोजें...",
    systemSettings: "सिस्टम सेटिंग्स",
    appearance: "दिखावट",
    language: "भाषा",
    languageDesc: "अपनी पसंदीदा भाषा चुनें",
    units: "मापन इकाइयाँ",
    alertsPrivacy: "अलर्ट और गोपनीयता",
    guestUser: "अतिथि",
    ecoUser: "इको सदस्य"
  },
  te: {
    dashboard: "డ్యాష్‌బోర్డ్",
    geoExplorer: "జియో ఎక్స్‌ప్లోరర్",
    analytics: "విశ్లేషణలు",
    spaceMonitor: "స్పేస్ మానిటర్",
    alerts: "హెచ్చరికలు",
    settings: "సెట్టింగ్‌లు",
    searchPlaceholder: "నగరం, గ్రామం లేదా అక్షాంశాలను శోధించండి...",
    systemSettings: "సిస్టమ్ సెట్టింగ్‌లు",
    appearance: "స్వరూపం",
    language: "భాష",
    languageDesc: "మీకు ఇష్టమైన భాషను ఎంచుకోండి",
    units: "కొలత యూనిట్లు",
    alertsPrivacy: "హెచ్చరికలు & గోప్యత",
    guestUser: "అతిథి",
    ecoUser: "ఎకో యూజర్"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('eco_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eco_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
