# Mangooal

Mangooal is a MiniPay-native football prediction app for one narrow Celo Mainnet flow:

`predict or edit the score before lock, read it from Celo anywhere, and score it on-chain`

The app connects to the user's MiniPay or Celo wallet, lists FIFA World Cup 2026 matches,
lets the user submit or edit a free score prediction before lock, and records the pick directly on Celo Mainnet so MiniPay and browser show the same wallet state. Mangooal does not custody funds or private keys.
It is free to play: no entry fees, no odds, no user-funded prize pools, and no staking.

The source of truth for match schedules and live scores is external football data APIs.
Local files keep only app configuration such as enabled competitions, contract addresses,
stablecoins, and registered campaign IDs.

## Campaign

| Field | Value |
|---|---|
| Network | Celo Mainnet (chainId 42220) |
| Campaign | FIFA World Cup 2026 |
| Game action | Free score predictions before each match lock |
| On-chain proof | Editable public picks, wallet pick history, ranking stats, and Coach Pass history |
| Paid feature | Coach Pass for analytics and UX only |
| Rewards | Optional operator-funded promotional claims |
| Core MiniPay payment assets | USDC, USDT, USDm |
| Display/reward focus | COPm plus other Mento regional stablecoins |

## How the flow works

1. User opens Mangooal in MiniPay or a Celo wallet browser.
2. Mangooal loads active and upcoming matches from the server-side scores API.
3. User chooses a match, enters an exact score, and confirms with their wallet.
4. `submitOrUpdatePick` stores the public score pick on `MangooalLedger` before the match lock time.
5. The same wallet can edit the pick until lock, normally 30 minutes before kickoff.
6. Browser and MiniPay read the same `getPick` / `getUserPicks` state from Celo.
7. An oracle submits official results and records idempotent points after the match result is known.
8. Rankings, stats, audits, Coach Pass state, and reward claims are re-read from the chain.

The Coach Pass unlocks deeper match context, not better odds or better points. Promotional
rewards are operator-signed and operator-funded; they are not funded by player entry fees.

## Match and coach data

Mangooal keeps competition metadata locally, but fixtures and scores should come from APIs.

| Layer | Source |
|---|---|
| Live schedules and scores | `/api/scores`, backed by ESPN's soccer scoreboard endpoint |
| Documented fixture backup | `/api/fixtures?provider=football-data`, backed by football-data.org v4 |
| Broad fixture/livescore backup | `/api/fixtures?provider=sportmonks`, backed by Sportmonks Football API v3 |
| Coach context | Public football data from the same provider layer, gated by Coach Pass for deeper analysis |

Provider keys are kept server-side in Vercel environment variables. The client should not
hardcode future fixtures, API keys, or provider URLs.

Scoreboard data refreshes automatically in the client every minute. The World Cup view requests a rolling scoreboard window from two days back through the next eight days, so live, recent finished, and weekend schedule rows can appear even before those matches are registered for on-chain picks. Match cards show the pick deadline as `hh:mm left` and lock 30 minutes before kickoff. `/api/scores` tries ESPN first and falls back to football-data.org for supported competitions when `FOOTBALL_DATA_API_KEY` is configured. Finished matches are available through the `finished` filter for recent results, with the full list reachable from `/matches`.

When the user switches the app to Spanish, the client sends `lang=es` to `/api/scores`.
The proxy forwards `lang=es&region=co` to the football provider so country/team names and
status text can be localized by the API instead of by a hardcoded translation table.

## Blockchain contract

Mangooal uses one Celo Mainnet contract as the source of truth for campaigns, matches, editable picks, My Picks history, ranking stats, Coach Pass purchases, and promotional reward claims.

| Contract | Current address | Role |
|---|---|---|
| MangooalLedger v1 | `0xCF00CaE3610cA8C410948C240b930c9cE3C03d66` | Current deployed ledger. Replace with the v2 deployment before using cross-platform picks as the canonical source. |

### Contract responsibilities

`MangooalLedger` registers campaigns and matches, stores editable public picks before lock, exposes wallet pick history for My Picks, tracks ranking stats, handles Coach Pass purchases with on-chain purchase history, and validates operator-signed promotional reward claims. It is intentionally not a betting contract:

- No user-funded prize pools
- No winner-takes-all mechanics
- No odds
- No staking
- Coach Pass is analytics/UX only
- Promotional rewards are operator-distributed, not user-funded

### Contract v2 planning

Before redeploying `MangooalLedger`, use [`docs/contract-v2-scenarios.md`](docs/contract-v2-scenarios.md) as the product and contract checklist. The v2 direction is to store editable public picks on Celo so Picks, My Picks, Ranking, and Coach Pass all read the same wallet state in MiniPay and browser without Supabase as the canonical source.

### Pick source of truth

```text
User wallet
  -> picks or edits a match score before lock
  -> submitOrUpdatePick stores the score on Celo
  -> browser and MiniPay read the same getPick / getUserPicks state
  -> oracle records official result and idempotent points
  -> ranking, My Picks, and audit screens read chain state
```

The legacy `commitPrediction` / `revealPrediction` functions remain in the ABI for compatibility, but v2 product flows should use `submitOrUpdatePick` so pending picks are portable across devices.

## Distribution model

The initial distribution surface is a MiniPay Mini App for football fans following the
FIFA World Cup 2026 campaign. The public repo and Vercel deployment are the developer and
auditor entry points, while MiniPay is the user entry point.

Mangooal should keep the prediction flow simple before expanding campaigns: wallet connection,
match list, editable pick, on-chain audit, official results, points,
ranking, Coach Pass, and optional promotional claims.

Required production env vars:

```bash
VITE_DEPLOY_BLOCK=0
FOOTBALL_DATA_API_KEY=
SPORTMONKS_API_KEY=
```

`VITE_DEPLOY_BLOCK` should be set to the MangooalLedger deployment block in production so
log reads can be scoped to the contract's lifetime.

## MiniPay and public web model

Mangooal now includes a wallet-free `/demo` tour for first-time users and reviewers. Use [`docs/minipay-and-web-model.md`](docs/minipay-and-web-model.md) as the product model for keeping the MiniPay flow auto-connected and lightweight while the public web flow supports discovery, support, stats, and connected-wallet play.

## Public routes

| Route | Purpose |
|---|---|
| `/` | MiniPay app entry point. Main tabs keep the visible URL at `/` and store tab state locally. Legacy `?tab=` links are accepted and replaced back to `/`. |
| `/demo` | Wallet-free demo tour for first-time users, reviewers, and public web visitors |
| `/matches` | Full match list for the selected cup and filter |
| `/match/:id` | Score prediction screen for one match |
| `/coach/:id` | Coach insight and Coach Pass upsell |
| `/coach-pass` | Coach Pass purchase flow |
| `/coach-pass/history` | Coach Pass purchase history from Celo events plus this device fallback, with Celoscan proof links and QR receipts |
| `/ranking` | Direct leaderboard route kept for support/deep links; bottom navigation stays on `/` |
| `/my-picks` | Direct pick-history route kept for support/deep links; bottom navigation stays on `/` |
| `/audit/:id` | On-chain prediction audit screen |
| `/claim` | Operator-signed promotional reward claim |
| `/stats` | On-chain campaign stats |
| `/support` | Legal, support, and notification guidance |

## Frontend architecture

```text
src/
  components/
    BottomNav.tsx          shared mobile navigation
    CeloBadge.tsx          hidden compatibility wrapper for old imports
    MatchCard.tsx          match list card
  config/
    competitions.ts        enabled cups and API league mapping
    matches.ts             campaign, match IDs, kickoff and lock times
    stablecoins.ts         Celo Mainnet stablecoin registry and fee-currency notes
    wagmi.ts               wagmi + Celo Mainnet config
  contracts/
    erc20.abi.ts           ERC-20 ABI for approvals and balances
    mangoalLedger.abi.ts   MangooalLedger ABI
  hooks/
    useMiniPay.ts          MiniPay detection and wallet state
    useMangoalLedger.ts    commit, reveal, Coach Pass, and reward writes
    useMyPicks.ts          user prediction reads
    useOnChainRanking.ts   ranking event reads
    useOnChainStats.ts     campaign stats event reads
    useTokenBalances.ts    stablecoin balance reads
  lib/
    analytics.ts           local analytics hooks
  screens/
    Predictions.tsx        active campaign and match list
    AllMatches.tsx         full match list for one competition
    PredictionDetail.tsx   score input and commit transaction
    CoachInsight.tsx       match context and Coach Pass gate
    CoachPass.tsx          paid analytics pass purchase
    OnChainAudit.tsx       commitment and transaction proof
    Ranking.tsx            leaderboard
    RewardClaim.tsx        promotional reward claim flow
    StablecoinBalances.tsx  compact stablecoin balance grid for Picks
  App.tsx                  route shell and providers
contracts/
  MangooalLedger.sol       Celo Mainnet ledger contract
script/
  Deploy.s.sol             Foundry deployment script
  SetupAfterDeploy.s.sol   campaign and match setup
  RegisterMatches.s.sol    match registration helper
  SubmitResult.s.sol       official result submission helper
  RecordPoints.s.sol       oracle points helper
  SignReward.s.sol         reward signature helper
```

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL in a browser. For signing, use MiniPay or another wallet browser on
Celo Mainnet (chainId 42220).

## Validate

```bash
npm run build
forge build
```

## Configure contracts

Foundry is configured for Solidity `0.8.24` with optimizer enabled.

```bash
forge build
forge script script/Deploy.s.sol --rpc-url celo --broadcast
forge script script/SetupAfterDeploy.s.sol --rpc-url celo --broadcast
```

After deployment:

1. Update `MANGOAL_LEDGER_ADDRESS` in `src/hooks/useMangoalLedger.ts`.
2. Set `VITE_DEPLOY_BLOCK` in Vercel or `.env.local`.
3. Register the active campaign and matches.
4. Configure Coach Pass prices for the allowed payment tokens.
5. Grant oracle/operator roles to the accounts that submit results, record points, and sign rewards.

## Stablecoins and MiniPay notes

Mangooal keeps a broad Celo stablecoin registry for display, rewards, and future expansion:
USDm, USDC, USDT, COPm, EURm, BRLm, KESm, NGNm, XOFm, GHSm, PHPm, and ZARm.

MiniPay user-facing transaction flows should use USDC, USDT, or USDm. COPm is first-class in
the product experience and reward language, but transaction support should respect MiniPay's
current token support.

## Compliance and privacy

Mangooal is free to play, not gambling or betting. Predictions are free for
everyone, Coach Pass does not affect points or ranking, and promotional rewards are distributed
only from operator-funded pools.

The app does not store private keys or custody user funds. Prediction reveal data is kept in the
user's browser storage so the user can later reveal the same score and salt that produced the
on-chain commitment.
