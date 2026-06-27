import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useMiniPay } from "../hooks/useMiniPay";
import { useLanguage } from "../i18n";

export function WalletRequired() {
  const { language } = useLanguage();
  const { isMiniPay } = useMiniPay();
  const { connect, isPending } = useConnect();
  const copy = language === "es"
    ? {
        title: "Conecta tu wallet",
        body: "Mangooal muestra picks, ranking y Coach Pass cuando tu wallet esta lista.",
        miniPay: "Abre Mangooal desde MiniPay para conectar automaticamente.",
        action: "Conectar wallet",
        pending: "Conectando...",
      }
    : {
        title: "Connect wallet",
        body: "Mangooal shows picks, ranking, and Coach Pass once your wallet is ready.",
        miniPay: "Open Mangooal inside MiniPay to connect automatically.",
        action: "Connect wallet",
        pending: "Connecting...",
      };

  return (
    <div className="screen-body locked-body">
      <div className="card wallet-required-card">
        <div className="brand-ball-icon large" aria-hidden="true" />
        <h1>{copy.title}</h1>
        <p>{isMiniPay ? copy.miniPay : copy.body}</p>
        {!isMiniPay && (
          <button
            className="btn btn-primary"
            type="button"
            disabled={isPending}
            onClick={() => connect({ connector: injected() })}
          >
            {isPending ? copy.pending : copy.action}
          </button>
        )}
      </div>
    </div>
  );
}