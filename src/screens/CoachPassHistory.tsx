import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "../components/LanguageToggle";
import { useLanguage } from "../i18n";
import { useCoachPassHistory } from "../hooks/useMangoalLedger";
import { useMiniPay } from "../hooks/useMiniPay";

const PASS_LABELS = {
  en: { 1: "Daily", 2: "Weekly", 3: "Campaign", 4: "Season" },
  es: { 1: "Diario", 2: "Semanal", 3: "Campana", 4: "Temporada" },
} as const;

export function CoachPassHistory() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const labels = PASS_LABELS[language];
  const { address } = useMiniPay();
  const { items: history, isLoading } = useCoachPassHistory(address as `0x${string}` | undefined);

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-button" onClick={() => navigate(-1)} type="button" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="topbar-logo compact">
          <span>Coach Pass</span>
        </span>
        <LanguageToggle />
      </div>

      <div className="screen-body" style={{ paddingTop: 16 }}>
        <div className="section-title">{language === "es" ? "Historial" : "History"}</div>
        {isLoading && <div className="card" style={{ marginBottom: 12 }}>{language === "es" ? "Cargando..." : "Loading..."}</div>}
        {history.length > 0 ? (
          history.map((item) => (
            <a
              className="history-row"
              href={`https://celoscan.io/tx/${item.txHash}`}
              key={item.txHash}
              rel="noreferrer"
              target="_blank"
            >
              <span>
                <strong>{labels[item.passType as keyof typeof labels] ?? "Coach"} Pass</strong>
                <small>{new Date(item.purchasedAt).toLocaleString()}</small>
              </span>
              <span>{item.tokenSymbol}</span>
            </a>
          ))
        ) : (
          <div className="card" style={{ textAlign: "center" }}>
            <strong>{language === "es" ? "Aun no hay compras de Coach Pass para esta cuenta." : "No Coach Pass purchases for this account yet."}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
