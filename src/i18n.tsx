import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "es";

type Copy = {
  common: {
    all: string;
    soon: string;
  };
  nav: {
    picks: string;
    ranking: string;
    myPicks: string;
    coachPass: string;
    wallet: string;
  };
  predictions: {
    currentCup: string;
    now: string;
    comingSoon: string;
    freePredictions: string;
    promoRewards: string;
    open: string;
    live: string;
    schedule: string;
    actionAll: string;
    noMatches: string;
    roadmapTitle: string;
    currentSource: string;
    futureSource: string;
    tapToSwitch: string;
    complianceLine1: string;
    complianceLine2: string;
    fallbackNote: string;
  };
  matches: {
    live: string;
    hoursLeft: (hours: number) => string;
    locked: string;
    dateLocale: string;
    confirmedSchedule: string;
    notRegistered: string;
    yourPick: string;
  };
};

const COPY: Record<Language, Copy> = {
  en: {
    common: {
      all: "All",
      soon: "Soon",
    },
    nav: {
      picks: "Picks",
      ranking: "Ranking",
      myPicks: "My Picks",
      coachPass: "Coach Pass",
      wallet: "Wallet",
    },
    predictions: {
      currentCup: "Selected cup",
      now: "Now",
      comingSoon: "Coming soon",
      freePredictions: "free picks",
      promoRewards: "Promotional rewards available",
      open: "open",
      live: "Live",
      schedule: "Schedule",
      actionAll: "All",
      noMatches: "No matches in this view yet. Try Schedule or another cup.",
      roadmapTitle: "Switch cup",
      currentSource: "Live schedule and scores from ESPN.",
      futureSource: "Future fixtures are previews until the cup is opened on-chain.",
      tapToSwitch: "Tap a cup below to switch the match list.",
      complianceLine1: "Mangooal is a free-to-play sports prediction game. Not betting. Not gambling.",
      complianceLine2: "No entry fees - No user-funded prize pools - No odds",
      fallbackNote: "ESPN is the live source. football-data.org is the documented backup candidate for fixtures.",
    },
    matches: {
      live: "Live",
      hoursLeft: (hours) => `${hours}h left`,
      locked: "Locked",
      dateLocale: "en",
      confirmedSchedule: "Confirmed schedule",
      notRegistered: "Preview only. Predictions open when this cup is registered on Celo.",
      yourPick: "Your pick is recorded",
    },
  },
  es: {
    common: {
      all: "Todo",
      soon: "Pronto",
    },
    nav: {
      picks: "Picks",
      ranking: "Ranking",
      myPicks: "Mis Picks",
      coachPass: "Coach Pass",
      wallet: "Billetera",
    },
    predictions: {
      currentCup: "Copa seleccionada",
      now: "Ahora",
      comingSoon: "Proximamente",
      freePredictions: "predicciones gratis",
      promoRewards: "Recompensas promocionales disponibles",
      open: "abiertos",
      live: "En vivo",
      schedule: "Calendario",
      actionAll: "Todo",
      noMatches: "No hay partidos en esta vista. Prueba Calendario u otra copa.",
      roadmapTitle: "Cambiar copa",
      currentSource: "Calendario y marcadores en vivo desde ESPN.",
      futureSource: "Los proximos partidos son una vista previa hasta abrir la copa on-chain.",
      tapToSwitch: "Toca una copa abajo para cambiar la lista de partidos.",
      complianceLine1: "Mangooal es un juego gratis de predicciones deportivas. No es apuestas ni gambling.",
      complianceLine2: "Sin pagos de entrada - Sin pozos financiados por usuarios - Sin cuotas",
      fallbackNote: "ESPN es la fuente en vivo. football-data.org es el candidato de respaldo documentado para calendarios.",
    },
    matches: {
      live: "En vivo",
      hoursLeft: (hours) => `${hours}h restantes`,
      locked: "Cerrado",
      dateLocale: "es",
      confirmedSchedule: "Calendario confirmado",
      notRegistered: "Vista previa. Las predicciones abren cuando esta copa este registrada en Celo.",
      yourPick: "Tu prediccion esta registrada",
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
