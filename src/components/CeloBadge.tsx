interface CeloBadgeProps {
  variant?: "connected" | "network" | "powered" | "built";
}

const COPY: Record<string, string> = {
  connected: "Connected to Celo",
  network: "Celo Mainnet",
  powered: "Powered by Celo stablecoins",
  built: "Built on Celo",
};

export function CeloBadge({ variant = "network" }: CeloBadgeProps) {
  return (
    <span className="badge badge-celo">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="6" fill="#35D07F" />
        <circle cx="6" cy="6" r="3" fill="white" />
      </svg>
      {COPY[variant]}
    </span>
  );
}
