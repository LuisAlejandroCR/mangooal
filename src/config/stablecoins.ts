/**
 * Mangoal stablecoin registry — Celo Mainnet.
 *
 * Addresses verified from celopedia-skill/contracts.md (2026-04-15).
 * Source: https://docs.celo.org/build-on-celo/build-with-local-stablecoin
 *
 * TICKER COLLISION WARNINGS:
 *   Mento COPm  0x8A567… ≠ Minteo COPM 0xC92E… — always match on address, not symbol.
 *   Mento XOFm  (canonical m-suffix, NOT "eXOF" in user-facing copy)
 *   Mountain Protocol USDM ≠ Mento USDm — different contracts, different backing.
 *
 * MINIPAY TRANSACTION TOKENS:
 *   MiniPay only supports USDT / USDC / USDm for user-facing transactions.
 *   COPm and other regional tokens can be displayed as reference/reward assets
 *   but must fall back to USDC/USDT/USDm for actual on-chain payment flows.
 *
 * FEE ABSTRACTION (CIP-64):
 *   USDC and USDT require ADAPTER addresses in the feeCurrency field (not the token address).
 *   USDm uses the same address for both token and feeCurrency.
 */

export type StablecoinInfo = {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  feeCurrencyAddress: `0x${string}`;
  miniPayCore: boolean; // true = supported for MiniPay transactions
  flagEmoji: string;
};

export const STABLECOINS: Record<string, StablecoinInfo> = {
  USDm: {
    symbol: "USDm",
    name: "Mento Dollar",
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    decimals: 18,
    feeCurrencyAddress: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    miniPayCore: true,
    flagEmoji: "🇺🇸",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    decimals: 6,
    // USDC needs the adapter for feeCurrency — NOT the token address
    feeCurrencyAddress: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
    miniPayCore: true,
    flagEmoji: "🇺🇸",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    decimals: 6,
    // USDT needs the adapter for feeCurrency — NOT the token address
    feeCurrencyAddress: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72",
    miniPayCore: true,
    flagEmoji: "🟢",
  },
  COPm: {
    symbol: "COPm",
    name: "Mento Colombian Peso",
    address: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
    decimals: 18,
    feeCurrencyAddress: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
    miniPayCore: false, // Display/reward asset; use USDC/USDT/USDm for MiniPay txs
    flagEmoji: "🇨🇴",
  },
  EURm: {
    symbol: "EURm",
    name: "Mento Euro",
    address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    decimals: 18,
    feeCurrencyAddress: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    miniPayCore: false,
    flagEmoji: "🇪🇺",
  },
  BRLm: {
    symbol: "BRLm",
    name: "Mento Brazilian Real",
    address: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
    decimals: 18,
    feeCurrencyAddress: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
    miniPayCore: false,
    flagEmoji: "🇧🇷",
  },
  KESm: {
    symbol: "KESm",
    name: "Mento Kenyan Shilling",
    address: "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
    decimals: 18,
    feeCurrencyAddress: "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
    miniPayCore: false,
    flagEmoji: "🇰🇪",
  },
  NGNm: {
    symbol: "NGNm",
    name: "Mento Nigerian Naira",
    address: "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
    decimals: 18,
    feeCurrencyAddress: "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
    miniPayCore: false,
    flagEmoji: "🇳🇬",
  },
  XOFm: {
    symbol: "XOFm",
    name: "Mento West African CFA Franc",
    address: "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
    decimals: 18,
    feeCurrencyAddress: "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
    miniPayCore: false,
    flagEmoji: "🌍",
  },
  GHSm: {
    symbol: "GHSm",
    name: "Mento Ghanaian Cedi",
    address: "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
    decimals: 18,
    feeCurrencyAddress: "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
    miniPayCore: false,
    flagEmoji: "🇬🇭",
  },
  PHPm: {
    symbol: "PHPm",
    name: "Mento Philippine Peso",
    address: "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
    decimals: 18,
    feeCurrencyAddress: "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
    miniPayCore: false,
    flagEmoji: "🇵🇭",
  },
  ZARm: {
    symbol: "ZARm",
    name: "Mento South African Rand",
    address: "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
    decimals: 18,
    feeCurrencyAddress: "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
    miniPayCore: false,
    flagEmoji: "🇿🇦",
  },
};

/** Tokens valid for MiniPay transaction flows (USDT / USDC / USDm only) */
export const MINIPAY_TX_TOKENS = Object.values(STABLECOINS).filter(
  (t) => t.miniPayCore
);

/** Tokens valid for Coach Pass payment on Celo Mainnet (broader list) */
export const COACH_PASS_TOKENS = Object.values(STABLECOINS);

/** COPm first-class tokens for Mangoal display (used in selector, balance view, rewards) */
export const FEATURED_TOKENS: StablecoinInfo[] = [
  STABLECOINS.COPm,
  STABLECOINS.USDC,
  STABLECOINS.USDT,
  STABLECOINS.USDm,
];

export function getStablecoin(symbol: string): StablecoinInfo | undefined {
  return STABLECOINS[symbol];
}
