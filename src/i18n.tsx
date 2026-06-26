import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "es";

type Copy = {
  common: {
    soon: string;
  };
  predictions: {
    currentCup: string;
    now: string;
    comingSoon: string;
    freePredictions: string;
    promoRewards: string;
    open: string;
    openPredictions: string;
    inProgress: string;
    noOpen: string;
    roadmapTitle: string;
    complianceLine1: string;
    complianceLine2: string;
  };
  matches: {
    live: string;
    hoursLeft: (hours: number) => string;
    locked: string;
    dateLocale: string;
  };
};

const COPY: Record<Language, Copy> = {
  en: {
    common: {
      soon: "Soon",
    },
    predictions: {
      currentCup: "Current cup",
      now: "Now",
      comingSoon: "Coming soon",
      freePredictions: "matches · Predictions are free for everyone",
      promoRewards: "Promotional rewards available",
      open: "open",
      openPredictions: "Open predictions",
      inProgress: "In progress",
      noOpen: "No open matches right now. Check back soon — new rounds are coming.",
      roadmapTitle: "Coming next on Mangooal",
      complianceLine1: "Mangooal is a free-to-play sports prediction game. Not betting. Not gambling.",
      complianceLine2: "No entry fees · No user-funded prize pools · No odds",
    },
    matches: {
      live: "Live",
      hoursLeft: (hours) => `${hours}h left`,
      locked: "Locked",
      dateLocale: "en",
    },
  },
  es: {
    common: {
      soon: "Pronto",
    },
    predictions: {
      currentCup: "Copa actual",
      now: "Ahora",
      comingSoon: "Pronto",
      freePredictions: "partidos · Las predicciones son gratis para todos",
      promoRewards: "Recompensas promocionales disponibles",
      open: "abiertos",
      openPredictions: "Predicciones abiertas",
      inProgress: "En progreso",
      noOpen: "No hay partidos abiertos ahora. Vuelve pronto: vienen nuevas rondas.",
      roadmapTitle: "Lo próximo en Mangooal",
      complianceLine1: "Mangooal es un juego de predicciones deportivas gratis. No es apuestas ni gambling.",
      complianceLine2: "Sin pagos de entrada · Sin pozos financiados por usuarios · Sin cuotas",
    },
    matches: {
      live: "En vivo",
      hoursLeft: (hours) => `${hours}h restantes`,
      locked: "Cerrado",
      dateLocale: "es",
    },
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Copy;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("mangooal:language");
  if (stored === "en" || stored === "es") return stored;
  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem("mangooal:language", language);
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, copy: COPY[language] }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
