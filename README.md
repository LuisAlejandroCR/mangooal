# Mangooal

Mangooal is a MiniPay-native football prediction app for one narrow Celo Mainnet flow across rotating cup campaigns:

`predict or edit the score before lock, read it from Celo anywhere, and score it on-chain`

The app connects to the user's MiniPay or Celo wallet, lists matches for the current cup,
lets the user submit or edit a free score prediction before lock, and records the pick directly on Celo Mainnet so MiniPay and browser show the same wallet state. Mangooal does not custody funds or private keys.
It is free to play: no entry fees, no odds, no user-funded prize pools, and no staking.

The source of truth for match schedules and live scores is external football data APIs.
Local files keep only app configuration such as enabled competitions, contract addresses,
stablecoins, and registered campaign IDs.

## Campaign model

| Field | Value |
|---|---|
| Network | Celo Mainnet (chainId 42220) |
| Current campaign | FIFA World Cup 2026 |
| Campaign families | FIFA World Cup, UEFA competitions, CAF competitions, Copa America / CONMEBOL |
| Campaign rule | One active cup at a time; future cups can preview schedules until enabled for picks |
| Game action | Free score predictions before each match lock |
| On-chain proof | Editable public picks, wallet pick history, ranking stats, and Coach Pass history |
| Paid feature | Coach Pass for analytics and UX only |
| Rewards | Optional operator-funded promotional claims |
| Core MiniPay payment assets | USDC, USDT, USDm |
| Display/reward focus | COPm plus other Mento regional stablecoins |

### Campaign activation guidelines

Use one current campaign for picks and keep future cups as preview/schedule surfaces until
they are ready. FIFA World Cup 2026 is the active proof campaign. UEFA, CAF, and Copa
America / CONMEBOL should move from preview to active only when the app has reliable API
coverage, registered campaign IDs, match locks, Spanish/English copy, support coverage,
and a clear growth metric such as repeat picks, returning users, or regional retention.

Do not hardcode future match data to make a cup look ready. Fixtures, scores, flags, venues,
and status should come from the provider layer; local config should only describe which
competitions are enabled and how they map to the provider.

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
FIFA World Cup 2026 is the current campaign, not the product boundary. UEFA, CAF, and
Copa America / CONMEBOL are supported campaign families for the same pick loop when
their schedules are available and the growth signal justifies activating them.

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
current FIFA World Cup 2026 campaign. The public repo and Vercel deployment are the developer and
auditor entry points, while MiniPay is the user entry point. The same campaign model should
serve LATAM, Africa, and Europe through Copa America / CONMEBOL, CAF, and UEFA competitions
after the current cup proves repeat picks and retention.

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

## Mangooal solution

Mangooal should stay small enough to pass the mom test:

`Pick scores. Compete. Track your picks.`

That is the whole first version. The app should not become a giant sports portal, casino, wallet dashboard, or analytics terminal. The winning shape is one simple loop that a football fan understands in seconds: choose a match, predict the score, come back for the result, and see the ranking.

### Product rule

Keep every feature under this test: does it make people submit more free picks, return for results, invite friends, or understand the next match faster? If not, cut it or move it to support/stats. UX matters more than Celo terminology. The user-facing copy should lead with play, compete, picks, reminders, ranking, and optional rewards. Use stablecoin names only in balance and payment contexts, and keep Celo/on-chain language as proof, not the headline.

Coach Pass is the paid layer, but it only unlocks better match context from public football data. It must never change points, ranking, eligibility, match outcomes, or the free pick loop. Treat it as a coach beside the user, not as an advantage engine.

### MiniPay mode

MiniPay is the primary distribution surface. Inside MiniPay, Mangooal should auto-connect, hide wallet setup, avoid seed phrase or network explanations, use only MiniPay-supported payment assets for transactions, keep screens short, and make the app name, support, terms, and privacy reachable from the visible UI. The Mini App should feel like a football game first and a Celo app second.

The main MiniPay path should stay short:

`Open app -> pick match -> submit score -> check My Picks -> return for result`

Do not show a connect-wallet education flow in MiniPay. MiniPay users should feel they are playing, not learning infrastructure.

### MiniPay launch readiness

Do not submit a half-built Mini App. Stage 1 should be a clean intake-ready product:
the core pick loop works, MiniPay auto-connect is tested on device, support/terms/privacy
are reachable from visible icons, and the UI fits a 360x640 review viewport without hidden
primary actions. Stage 2 should add the full readiness polish: production URL, 24h support
path, PageSpeed review, legal links, screenshots, and copy that avoids crypto education.

User-facing MiniPay copy should say `network fee`, `deposit`, `withdraw`, `stablecoin`, or
`digital dollar` when those concepts are needed. Do not lead with gas, onramp, offramp,
crypto, seed phrases, raw addresses, or chain jargon. The app can prove activity on Celo,
but the player should understand the flow as football first.

### Public web mode

The public web app is discovery, demo, trust, and support. It should not block new visitors with wallet requirements. `/demo` is the wallet-free tour for first-time users, reviewers, and social traffic from X, Telegram, WhatsApp, TikTok, Instagram, and friends. After the demo, users can connect a Celo wallet to play from the browser, while `/support`, `/stats`, `/matches`, and audit links stay available as public support and proof surfaces.

For users outside MiniPay, Mangooal can support a normal Celo wallet connection. If the public audience grows beyond Celo-native users, evaluate embedded wallet providers for onboarding, but keep MiniPay auto-connect as the cleanest path inside MiniPay.

### Contract and metrics model

The contract architecture should keep user actions direct whenever possible. Picks, edits, Coach Pass purchases, reward claims, and ranking-relevant actions should be attributable to the user's wallet on Celo so MiniPay and browser stay aligned and Proof of Ship metrics reflect real users instead of only backend or paymaster activity.

Avoid a setup where a backend, relayer, or paymaster becomes the only visible actor for user activity. If gas sponsorship is added later, preserve direct user attribution in events and analytics. The product scorecard should watch daily active users, direct user transactions, repeat picks, network fees paid, failed transaction rate, and retention by campaign.

### Growth model

Start with the smallest loop and one strongest market. For Mangooal, that means free score picks around the active cup, Spanish-first LATAM distribution when that market is growing, and English as the second language. FIFA World Cup 2026 is the current proof campaign; UEFA, CAF, and Copa America / CONMEBOL are expansion candidates for the same loop, not separate products. Add more competitions, languages, Coach features, or rewards only when they improve retention, direct user transactions, or daily active users.

Do not add languages or modes just because they are easy to build. Each one has an operating cost: copy, support, moderation, rewards, QA, and marketing. If Spanish users in Colombia/LATAM are growing fastest, deepen that loop before expanding. Retaining current users is cheaper than acquiring cold users.

Distribution needs budget. Promotional rewards and creator campaigns should be treated as runway, not as a feature checklist. Early growth comes from friends, X, Telegram, WhatsApp, family, community, and your own audience. When that ceiling appears, use creator campaigns with explicit caps and metrics, for example approved short videos with a fixed cost per view and maximum payout per creator.

Kill slow loops early. It is easier to remove a small feature than to maintain a monster that took months to build. Mangooal should earn expansion by proving that one cup, one pick loop, and one market can generate repeat play.

### Traceable product blocks

These blocks convert the product direction into testable guardrails. Keep each ID in sync with `src/config/productGuardrails.ts` and `npm test`.

| ID | Direction | Testable promise |
|---|---|---|
| MG-CORE-001 | One simple loop | Pick scores, compete, and track picks before adding secondary product surfaces. |
| MG-UX-001 | Mom-test UX | Copy leads with play, compete, picks, reminders, ranking, and optional rewards. |
| MG-MINIPAY-001 | MiniPay first | MiniPay users auto-connect and complete the pick loop without wallet setup education. |
| MG-LAUNCH-001 | MiniPay launch readiness | Do not submit until the MiniPay loop, support/legal links, 360x640 UI, and no-crypto copy are review-ready. |
| MG-WEB-001 | Public web discovery | Demo, support, matches, stats, and proof links stay reachable before wallet connection. |
| MG-CAMPAIGN-001 | Rotating cup discipline | Only one current campaign accepts picks; future cups stay preview/schedule until API, support, and growth signals are ready. |
| MG-CONTRACT-001 | Direct user attribution | User actions stay attributable to the user's wallet on Celo for MiniPay, browser, and Proof of Ship metrics. |
| MG-GROWTH-001 | Earn expansion | New markets, languages, competitions including UEFA, CAF, and Copa America / CONMEBOL, and rewards must improve retention or repeat picks. |
| MG-COACH-001 | Coach context only | Coach Pass unlocks public-data match context without changing points, ranking, eligibility, or outcomes. |

## Competitive landscape

The reference set is the top-ranked Celo MiniPay projects on Talent.app (all-time window, July 2026).

| App | Core loop | Engagement hook | Gap vs Mangooal |
|---|---|---|---|
| **AkibaMiles** | Earn loyalty points by using MiniPay and Mini Apps | Instant points on every action | Mangooal has delayed gratification — points only after match result |
| **Tradcast** | Simulated trading game, 4-minute sessions, $1 000 starter balance | Fast feedback loop, leaderboard | Mangooal sessions are short but results take hours; no mid-session hook |
| **Focus Pet** | Productivity pet that grows when you stay focused | Daily care ritual, visual progress | Mangooal has no between-match daily habit |
| **CeloClicker** | Idle clicker with global leaderboard | Instant feedback, streak-like climb | Mangooal ranking only updates after oracle scores each match |
| **onchaingm** | One daily check-in as a web3 ritual | Daily return trigger, identity layer | Mangooal has no equivalent "come back today" pull outside match days |
| **Chainstreak** | Activity streak across 100+ EVM chains | Streak loss anxiety, daily habit | No streak mechanic in Mangooal yet |
| **Predinex** | Decentralised prediction market | Capital at risk, market odds | Mangooal is free — no risk also means less skin-in-the-game tension |
| **Trickle** | Per-second payroll streaming | Real financial utility | Different category; Mangooal is entertainment-first |

### Where Mangooal leads

**Real-world event gravity.** No other top Celo app rides an external event with billions of existing fans. FIFA World Cup 2026 brings pre-built intent; Mangooal does not need to create interest, only capture it. Every match is a natural re-engagement trigger that no loyalty points or streak mechanic can manufacture.

**Free and compliance-safe.** Predinex requires capital at risk. Mangooal is free to play, so adoption in MiniPay's 16M-wallet base has no entry barrier and no gambling liability.

**On-chain proof as social proof.** A submitted pick is a timestamped public record on Celo. No other entertainment app in this set lets users say "I called Brazil 2-1 Japan before kickoff, here is the Celoscan link." That permanence is the moat.

**LATAM depth.** Spanish-first copy, COPm rewards framing, and MiniPay's Colombia/LATAM user base give Mangooal a regional identity that generic gaming apps on Base or Stacks cannot replicate cheaply.

**Coach Pass monetisation without pay-to-win.** Most Celo gaming apps have no monetisation or use NFT drops. Coach Pass is recurring, compliance-safe, and keeps the free loop intact.

### Where Mangooal needs to close the gap

**Delayed gratification.** Top apps give instant feedback — points, clicks, streaks. Mangooal makes users wait 90+ minutes for a result. This gap should be bridged by creating moments of engagement before and after the wait, not by shortening the wait.

**No viral moment.** After submitting a pick, there is nothing to share or show. Every correct prediction is a missed social ad. The share mechanic is the single highest-leverage feature not yet shipped.

**No return trigger between matches.** onchaingm and Focus Pet pull users back daily. Mangooal only pulls users back when a match is close to lock or when results arrive. The gap is a notification or daily moment that keeps the app sticky between campaigns.

**Discovery outside MiniPay.** The app is invisible to anyone not already in MiniPay. Public web mode and social sharing are the only off-MiniPay surfaces. Both need sharpening before the WC knockout rounds peak.

## Differential features to ship

These are ordered by leverage — the ratio of engagement gain to build cost. Ship the first three before expanding competitions.

### 1. Pick share card (highest leverage, ~1 day)

After a user submits a pick, generate a shareable image or link card:

```
🟢 My Mangooal pick
Brazil 2 – 1 Japan
FIFA World Cup 2026 · Round of 32
Submitted on Celo before kickoff
mangooal.app/audit/wc26-r32-01
```

Add a share button (Web Share API on mobile, copy-link fallback on desktop) to `PredictionDetail` after submission and to the success card in `SubmittedView`. One tap produces a card the user can paste into WhatsApp, X, or Instagram Stories. This converts every pick into organic distribution. The Celoscan audit link makes it verifiable, which is Mangooal's differentiator vs every other sports app.

Implementation: generate the card as a styled `<div>` captured with `html2canvas` or produce a server-side OG image from `/api/og?match=wc26-r32-01&home=2&away=1&wallet=0x...`. The wallet is optional — the match and score are enough.

### 2. Result flex card (social proof loop, ~1 day)

When the oracle records an official result, users who predicted the exact score or correct outcome see a "you called it" screen the next time they open My Picks:

```
You called it.
Brazil 2 – 1 Japan ✓ Exact score
+5 pts · Ranked #14
[Share your prediction]
```

This is the payoff moment the user waited 90 minutes for. Make it feel earned. Add confetti (same pattern as the existing `TransactionSuccessScreen`), a large score display, their rank movement, and a share button. This is when users want to show off, and that share is free acquisition.

### 3. Match countdown notification (re-engagement, ~2 days)

Send a push notification 30 minutes before each match lock:

```
⚽ Lock in 30 min
Brazil vs Japan · Today 12:00 PM
Your pick: not submitted yet
[Pick now]
```

Options in order of effort:
- **Telegram bot** — user types `/start`, bot sends a message before each match. Easiest, no OS permission needed, huge LATAM reach.
- **MiniPay push** — use MiniPay's push notification API when available.
- **PWA push** — service worker + VAPID. Works on Android, limited on iOS.

The Telegram bot is the fastest path: one Cloudflare Worker, one `/api/notify` cron, zero OS permission friction. LATAM users are already on Telegram.

### 4. Prediction streak (daily habit, ~1 day)

Track how many consecutive matches a user has submitted a pick for. Display it on My Picks:

```
🔥 Pick streak: 7 matches in a row
```

Store the streak in local storage first (no contract change needed), then optionally record it on-chain as part of the ranking event for leaderboard tie-breaking. A broken streak creates return anxiety — the same psychological mechanism that makes Duolingo and Chainstreak sticky.

### 5. Head-to-head challenge (~3 days)

Let a user challenge a friend on a specific match:

```
mangooal.app/challenge/wc26-r32-01?challenger=0x...
```

Opening the link shows the challenger's pick hidden behind a "Submit your pick to reveal" gate. After both submit, both see each other's prediction. This creates a bilateral commitment that neither party wants to lose — and it drives installs from the challenged friend who may not have the app.

### 6. Community pick distribution (transparency hook, free)

After match lock, show a bar on the match card:

```
Community picks  Brazil ██████ 62%  Draw ██ 22%  Japan ███ 16%
```

Read this from on-chain `PredictionCommitted` events — no new data needed, just an aggregation view. This gives users context for how contrarian or aligned their pick is, creates conversation, and increases the perceived value of the existing data layer.

### Priority order for WC 2026 knockout rounds

The Round of 16 begins approximately July 7. The window to maximise WC engagement is the next 10 days.

| Feature | Effort | WC impact | Ship by |
|---|---|---|---|
| Pick share card | 1 day | Viral acquisition | Today |
| Result flex card | 1 day | Retention, sharing | Today |
| Match countdown (Telegram) | 2 days | Re-engagement | Jul 3 |
| Prediction streak | 1 day | Daily habit | Jul 4 |
| Community pick bar | 1 day | Engagement, trust | Jul 5 |
| Head-to-head challenge | 3 days | Viral growth | Jul 7 |

Features that should wait until after WC:
- Additional languages beyond EN/ES
- New competition activation (UEFA, CAF, Copa América)
- Embedded wallet for non-MiniPay users
- Coach Pass expansion

Those belong to the next campaign cycle, after this WC proves retention numbers.

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
