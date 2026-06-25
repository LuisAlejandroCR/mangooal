import { http, createConfig } from "wagmi";
import { celo } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    // Injected covers MiniPay (window.ethereum.isMiniPay), MetaMask, Rabby, etc.
    injected({ target: "metaMask" }),
    injected(),
    ...(WC_PROJECT_ID
      ? [walletConnect({ projectId: WC_PROJECT_ID })]
      : []),
  ],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
