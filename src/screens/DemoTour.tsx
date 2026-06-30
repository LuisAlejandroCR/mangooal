import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "../components/LanguageToggle";
import { useMiniPay } from "../hooks/useMiniPay";
import { useLanguage } from "../i18n";

const TOUR_COPY = {
  en: {
    title: "Demo tour",
    eyebrow: "How Mangooal works",
    steps: [
      {
        title: "Pick a score before lock",
        body: "Choose a match, set the exact score, and submit it free. Picks close 30 minutes before kickoff.",
        tag: "Free pick",
      },
      {
        title: "Your wallet carries your picks",
        body: "Mangooal reads picks, My Picks, ranking, and Coach Pass from Celo so MiniPay and browser stay aligned.",
        tag: "Same wallet",
      },
      {
        title: "Coach adds context only",
        body: "Coach Pass can show public-data match context and suggested scores. It does not change points or ranking.",
        tag: "Context",
      },
      {
        title: "Built for MiniPay and web",
        body: "MiniPay auto-connects. Outside MiniPay, connect a Celo wallet or use this demo tour first.",
        tag: "Hybrid app",
      },
    ],
    miniPay: "MiniPay detected: wallet connects automatically.",
    web: "Public web: tour first, then connect a Celo wallet.",
    note: "Demo only. No wallet request or transaction is sent here.",
    back: "Back",
    next: "Next",
    start: "Start picks",
    support: "Support",
  },
  es: {
    title: "Tour demo",
    eyebrow: "Como funciona Mangooal",
    steps: [
      {
        title: "Predice antes del cierre",
        body: "Elige un partido, marca el resultado exacto y envialo gratis. Los picks cierran 30 minutos antes del inicio.",
        tag: "Pick gratis",
      },
      {
        title: "Tu wallet guarda tus picks",
        body: "Mangooal lee Picks, Mis Picks, ranking y Coach Pass desde Celo para alinear MiniPay y navegador.",
        tag: "Misma wallet",
      },
      {
        title: "Coach solo agrega contexto",
        body: "Coach Pass puede mostrar contexto publico del partido y marcadores sugeridos. No cambia puntos ni ranking.",
        tag: "Contexto",
      },
      {
        title: "Hecho para MiniPay y web",
        body: "MiniPay conecta automaticamente. Fuera de MiniPay, conecta una wallet de Celo o mira este tour primero.",
        tag: "App hibrida",
      },
    ],
    miniPay: "MiniPay detectado: la wallet conecta automaticamente.",
    web: "Web publica: mira el tour y luego conecta una wallet de Celo.",
    note: "Solo demo. Aqui no se pide wallet ni se envia transaccion.",
    back: "Atras",
    next: "Siguiente",
    start: "Empezar picks",
    support: "Soporte",
  },
} as const;

export function DemoTour() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isMiniPay } = useMiniPay();
  const [index, setIndex] = useState(0);
  const copy = TOUR_COPY[language];
  const step = copy.steps[index];
  const isLast = index === copy.steps.length - 1;

  const demoScores = useMemo(() => [
    { home: "Colombia", away: "Portugal", score: "2 - 1" },
    { home: "Ghana", away: "Croatia", score: "1 - 1" },
  ], []);

  function startPicks() {
    window.localStorage.setItem("mangooal:root-tab", "picks");
    window.dispatchEvent(new Event("mangooal:tab"));
    navigate("/");
  }

  return (
    <div className="screen demo-screen">
      <div className="topbar">
        <button className="topbar-logo compact" type="button" onClick={startPicks}>
          <span className="brand-ball-icon" aria-hidden="true" /> <span>Mangoo</span>al
        </button>
        <div className="topbar-actions">
          <LanguageToggle />
          <button className="icon-button" type="button" aria-label={copy.support} onClick={() => navigate("/support")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.1 9a3 3 0 1 1 5.8 1c-.4.9-1.2 1.4-2 2-.6.4-.9.8-.9 1.6" />
              <path d="M12 17h.01" />
            </svg>
          </button>
        </div>
      </div>

      <div className="screen-body demo-body">
        <section className="demo-hero-card">
          <div className="demo-hero-copy">
            <span className="demo-eyebrow">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{isMiniPay ? copy.miniPay : copy.web}</p>
          </div>
          <div className="demo-phone" aria-hidden="true">
            <div className="demo-phone-top" />
            {demoScores.map((match) => (
              <div className="demo-match" key={match.home}>
                <span>{match.home}</span>
                <strong>{match.score}</strong>
                <span>{match.away}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="demo-step-card">
          <div className="demo-step-header">
            <span>{step.tag}</span>
            <strong>{index + 1}/{copy.steps.length}</strong>
          </div>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
          <div className="demo-progress" aria-hidden="true">
            {copy.steps.map((item) => (
              <span key={item.title} className={item.title === step.title ? "active" : ""} />
            ))}
          </div>
        </section>

        <p className="demo-note">{copy.note}</p>

        <div className="demo-actions">
          <button className="btn btn-secondary" type="button" onClick={() => (index === 0 ? startPicks() : setIndex(index - 1))}>
            {copy.back}
          </button>
          <button className="btn btn-primary" type="button" onClick={() => (isLast ? startPicks() : setIndex(index + 1))}>
            {isLast ? copy.start : copy.next}
          </button>
        </div>
      </div>
    </div>
  );
}