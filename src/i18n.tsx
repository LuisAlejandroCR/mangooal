import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "es";

type Copy = {
  common: {
    all: string;
    soon: string;
    back: string;
  };
  nav: {
    picks: string;
    ranking: string;
    myPicks: string;
    coachPass: string;
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
    finished: string;
    actionAll: string;
    noMatches: string;
    roadmapTitle: string;
    currentSource: string;
    futureSource: string;
    tapToSwitch: string;
    complianceLine1: string;
    complianceLine2: string;
    fallbackNote: string;
    tapBannerToSwitch: string;
    scheduleFallback: string;
    loading: string;
    nextMatches: string;
    seeAll: string;
    allMatches: string;
  };
  matches: {
    live: string;
    timeLeft: (hours: number, minutes: number) => string;
    hoursLeft: (hours: number) => string;
    locked: string;
    missedPick: string;
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
      back: "Back",
    },
    nav: {
      picks: "Picks",
      ranking: "Ranking",
      myPicks: "My Picks",
      coachPass: "Coach Pass",
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
      finished: "Finished",
      actionAll: "All",
      noMatches: "No matches in this view yet. Try Schedule or another cup.",
      roadmapTitle: "Switch cup",
      currentSource: "Live schedule and scores.",
      futureSource: "Future fixtures preview.",
      tapToSwitch: "Tap this card to switch cups.",
      complianceLine1: "Free picks. No entry fee, odds, or user-funded prize pools.",
      complianceLine2: "Coach Pass adds match context only.",
      fallbackNote: "Schedule backup is ready.",
      tapBannerToSwitch: "Tap to switch cups",
      scheduleFallback: "Live schedule is taking longer than expected. Showing saved matches.",
      loading: "Loading matches...",
      nextMatches: "Next matches",
      seeAll: "See all",
      allMatches: "All matches",
    },
    matches: {
      live: "Live",
      timeLeft: (hours, minutes) => `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} left`,
      hoursLeft: (hours) => `${hours}h left`,
      locked: "Locked",
      missedPick: "You did not pick this match.",
      dateLocale: "en",
      confirmedSchedule: "Confirmed schedule",
      notRegistered: "Preview only. Predictions open when this cup is ready.",
      yourPick: "Your pick is recorded",
    },
  },
  es: {
    common: {
      all: "Todo",
      soon: "Pronto",
      back: "Volver",
    },
    nav: {
      picks: "Picks",
      ranking: "Ranking",
      myPicks: "Mis Picks",
      coachPass: "Coach Pass",
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
      finished: "Finalizados",
      actionAll: "Todo",
      noMatches: "No hay partidos en esta vista. Prueba Calendario u otra copa.",
      roadmapTitle: "Cambiar copa",
      currentSource: "Calendario y marcadores en vivo.",
      futureSource: "Vista previa de proximos partidos.",
      tapToSwitch: "Toca esta tarjeta para cambiar de copa.",
      complianceLine1: "Picks gratis. Sin pagos de entrada, cuotas ni pozos de usuarios.",
      complianceLine2: "Coach Pass solo agrega contexto de partidos.",
      fallbackNote: "El respaldo de calendario esta listo.",
      tapBannerToSwitch: "Toca para cambiar de copa",
      scheduleFallback: "El calendario esta tardando mas de lo esperado. Mostrando partidos guardados.",
      loading: "Cargando partidos...",
      nextMatches: "Proximos partidos",
      seeAll: "Ver todos",
      allMatches: "Todos los partidos",
    },
    matches: {
      live: "En vivo",
      timeLeft: (hours, minutes) => `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} restantes`,
      hoursLeft: (hours) => `${hours}h restantes`,
      locked: "Cerrado",
      missedPick: "No hiciste pick en este partido.",
      dateLocale: "es",
      confirmedSchedule: "Calendario confirmado",
      notRegistered: "Vista previa. Las predicciones abren cuando esta copa este lista.",
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
