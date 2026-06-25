// PostHog analytics wrapper — safe, zero-dependency.
// Reads window.posthog which is initialized by the snippet in index.html
// when VITE_POSTHOG_KEY is set. All calls are no-ops if PostHog is absent.

type PH = {
  capture: (event: string, props?: Record<string, unknown>) => void;
  identify: (id: string) => void;
  opt_out_capturing: () => void;
};

function ph(): PH | undefined {
  return (window as typeof window & { posthog?: PH }).posthog;
}

export const analytics = {
  identify: (address: `0x${string}`) =>
    ph()?.identify(address.toLowerCase()),

  walletConnected: (source: "minipay" | "injected") =>
    ph()?.capture("wallet_connected", { source }),

  predictionCommitted: (campaignId: string, matchId: string) =>
    ph()?.capture("prediction_committed", { campaignId, matchId }),

  predictionRevealed: (campaignId: string, matchId: string) =>
    ph()?.capture("prediction_revealed", { campaignId, matchId }),

  coachPassPurchased: (passType: number, token: string) =>
    ph()?.capture("coach_pass_purchased", { pass_type: passType, token }),

  rewardClaimed: (campaignId: string, token: string) =>
    ph()?.capture("reward_claimed", { campaignId, token }),

  statsViewed: () =>
    ph()?.capture("stats_viewed"),
};
