import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "../components/LanguageToggle";
import { getLocalCoachPassHistory } from "../hooks/useMangoalLedger";
import { useMiniPay } from "../hooks/useMiniPay";

const PASS_LABELS: Record<number, string> = {
  1: "Daily",
  2: "Weekly",
  3: "Campaign",
  4: "Season",
};

export function CoachPassHistory() {
  const navigate = useNavigate();
  const { address } = useMiniPay();
  const history = useMemo(() => getLocalCoachPassHistory(address), [address]);

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
        <div className="section-title">History</div>
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
                <strong>{PASS_LABELS[item.passType] ?? "Coach"} Pass</strong>
                <small>{new Date(item.purchasedAt).toLocaleString()}</small>
              </span>
              <span>{item.tokenSymbol}</span>
            </a>
          ))
        ) : (
          <div className="card" style={{ textAlign: "center" }}>
            <strong>No Coach Pass purchases on this device yet.</strong>
          </div>
        )}
      </div>
    </div>
  );
}
