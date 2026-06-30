import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "../components/LanguageToggle";
import { useLanguage } from "../i18n";

export function Support() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const c = language === "es" ? {
    title: "Legal y soporte",
    legal: "Terminos principales",
    body: "Mangooal es un juego gratis de predicciones deportivas. No es apuesta, no usa cuotas y no tiene pozos financiados por usuarios.",
    coach: "Coach Pass agrega contexto de partidos. No afecta puntos, ranking ni recompensas promocionales.",
    demo: "Tour demo",
    demoBody: "Mira el flujo de picks sin conectar wallet. Ideal para probar Mangooal desde navegador antes de abrir MiniPay.",
    demoAction: "Abrir demo",
    model: "Modelo Mangooal",
    modelBody: "Una sola accion principal: predice marcadores, compite y revisa tus picks. MiniPay conecta automaticamente; fuera de MiniPay, el usuario puede explorar primero y conectar despues.",
    notifications: "Notificaciones",
    note: "Las alertas se usan para recordatorios de partidos, estado de picks y recibos de Coach Pass.",
  } : {
    title: "Legal & support",
    legal: "Core terms",
    body: "Mangooal is a free sports prediction game. It is not betting, has no odds, and has no user-funded prize pools.",
    coach: "Coach Pass adds match context. It does not affect points, ranking, or promotional rewards.",
    demo: "Demo tour",
    demoBody: "Preview the pick flow without connecting a wallet. Useful from the public web before opening MiniPay.",
    demoAction: "Open demo",
    model: "Mangooal model",
    modelBody: "One core action: pick scores, compete, and track your picks. MiniPay connects automatically; outside MiniPay, people can explore first and connect later.",
    notifications: "Notifications",
    note: "Alerts are used for match reminders, pick status, and Coach Pass receipts.",
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-button" onClick={() => navigate(-1)} type="button" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="topbar-logo compact"><span>{c.title}</span></span>
        <LanguageToggle />
      </div>
      <div className="screen-body" style={{ paddingTop: 16 }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="section-title" style={{ marginTop: 0 }}>{c.demo}</div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{c.demoBody}</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate("/demo")} style={{ marginTop: 12 }}>
            {c.demoAction}
          </button>
        </div>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="section-title" style={{ marginTop: 0 }}>{c.model}</div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{c.modelBody}</p>
        </div>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="section-title" style={{ marginTop: 0 }}>{c.legal}</div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{c.body}</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>{c.coach}</p>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>{c.notifications}</div>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{c.note}</p>
        </div>
      </div>
    </div>
  );
}