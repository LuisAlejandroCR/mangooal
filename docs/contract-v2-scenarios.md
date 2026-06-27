# MangooalLedger v2 Scenario Checklist

This checklist defines the contract surface before another Celo Mainnet deployment. The goal is to make Picks, My Picks, Ranking, and Coach Pass read the same wallet state in MiniPay and browser without using Supabase as the canonical source of truth.

## Product Rules

- Mangooal predictions are free to submit.
- Coach Pass unlocks match context only. It must not change ranking, points, rewards, or pick eligibility.
- No odds, no staking, no user-funded prize pools, and no winner-takes-all mechanics.
- MiniPay transaction flows should support USDC, USDT, and USDm. COPm can remain a broader Celo product asset outside MiniPay when supported by the wallet.
- Celo Mainnet is chainId 42220.

## Contract Direction

The current commit-reveal contract proves that a wallet committed before lock, but exact scores are stored locally until reveal. That means the browser and MiniPay cannot show the same pending pick unless both devices share local storage.

For v2, store an editable public pick directly on Celo:

- `submitOrUpdatePick(campaignId, matchId, homeScore, awayScore)` writes the score before lock.
- The same wallet can update the pick until `lockedAt`.
- The contract emits every submit and update so the audit trail is still public.
- The UI can read `getPick(wallet, campaignId, matchId)` from any device.
- If private predictions become required later, add encryption or a backend sync layer. Commit-reveal alone does not solve cross-device exact pick display before reveal.

## Core Data Model

### Campaign

- `campaignId`
- `metadataHash` for API IDs, localized names, cup family, and provider references
- `startsAt`
- `endsAt`
- `active`
- `scoringMode`

### Match

- `matchId`
- `campaignId`
- `metadataHash` for ESPN or fallback provider IDs, teams, venue, and external references
- `kickoffAt`
- `lockedAt`, normally kickoff minus 30 minutes
- `status`: Scheduled, Live, Finished, Cancelled, Postponed, Void
- `homeScore`
- `awayScore`
- `resultSubmitted`

### Pick

- `wallet`
- `campaignId`
- `matchId`
- `homeScore`
- `awayScore`
- `status`: None, Submitted, Updated, Locked, Scored, Void
- `submittedAt`
- `updatedAt`
- `version`
- `points`

### Player Campaign Stats

- `totalPoints`
- `picksSubmitted`
- `exactHits`
- `resultHits`
- `lastPickAt`
- `lastScoredAt`

### Coach Pass

- `passType`: Daily, Weekly, Campaign, Season
- `token`
- `amount`
- `startsAt`
- `expiresAt`
- `purchaseIndex`

## Roles

- `DEFAULT_ADMIN_ROLE`: grant roles, pause, treasury, emergency controls.
- `OPERATOR_ROLE`: campaigns, matches, prices, token allowlist.
- `ORACLE_ROLE`: official results and scoring.
- Users: submit or update picks and buy Coach Pass.

## Picks Scenarios

- Wallet disconnected: frontend shows no app data and only a connect path outside MiniPay. Contract is not called.
- MiniPay wallet available: frontend auto-connects and reads wallet state without a connect popup.
- First pick before lock: accepted, stored, and emitted as `PickSubmitted`.
- Edit pick before lock: accepted, overwrites the previous score, increments version, and emits `PickUpdated`.
- Pick at or after lock: rejected.
- Pick for unknown campaign or match: rejected.
- Pick for inactive campaign: rejected.
- Pick for cancelled, postponed, finished, or void match: rejected.
- Score exceeds max score: rejected by configurable `maxScore`.
- Duplicate same score before lock: allowed as idempotent update or rejected with a clear custom error. Choose one before deploy.
- Cross-platform read: `getPick(wallet, campaignId, matchId)` returns the same score in browser and MiniPay.
- Historical audit: indexed events include wallet, campaignId, matchId, score, version, and timestamp.

## My Picks Scenarios

- Empty wallet history: return no picks for the wallet.
- Pending pick: show score, match, kickoff, and edit action if now is before `lockedAt`.
- Locked pick: show score without edit action.
- Scored pick: show result and awarded points.
- Void match: show pick as not scored.
- Historical campaign: wallet can paginate previous picks.
- Device change: reads from contract, not local storage.

Recommended functions:

```solidity
function getPick(address wallet, bytes32 campaignId, bytes32 matchId) external view returns (Pick memory);
function getUserPickCount(address wallet, bytes32 campaignId) external view returns (uint256);
function getUserPickAt(address wallet, bytes32 campaignId, uint256 index) external view returns (bytes32 matchId, Pick memory pick);
function getUserPicks(address wallet, bytes32 campaignId, uint256 offset, uint256 limit) external view returns (bytes32[] memory matchIds, Pick[] memory picks);
```

## Ranking Scenarios

- No scored matches: ranking shows empty state.
- First scored match: player appears after points are recorded.
- Exact score hit: points and exact-hit counters update.
- Result-only hit: points and result-hit counters update.
- Wrong pick: zero points can still count as submitted.
- Corrected official result: previous points are reversed and recalculated without double counting.
- Cancelled or void match: points are removed or never assigned.
- Tie-breakers must be deterministic: total points, exact hits, result hits, earliest last scored timestamp, then wallet address.
- Large campaigns: contract stores raw stats and player lists; frontend or an indexer sorts. The indexer can be a cache, but the chain remains the source.

Recommended functions:

```solidity
function getPlayerCampaignStats(address wallet, bytes32 campaignId) external view returns (PlayerCampaignStats memory);
function getCampaignPlayerCount(bytes32 campaignId) external view returns (uint256);
function getCampaignPlayerAt(bytes32 campaignId, uint256 index) external view returns (address);
function getCampaignPlayers(bytes32 campaignId, uint256 offset, uint256 limit) external view returns (address[] memory);
```

## Scoring Scenarios

- Oracle scores one pick after result.
- Oracle scores a batch after result to save operations.
- Scoring is idempotent: re-scoring the same pick adjusts from old points to new points.
- Result correction emits a correction event with old and new result.
- Points cannot be recorded before official result.
- Nonexistent picks are skipped or rejected. Choose one before deploy.

Recommended functions:

```solidity
function submitOfficialResult(bytes32 campaignId, bytes32 matchId, uint8 homeScore, uint8 awayScore) external;
function correctOfficialResult(bytes32 campaignId, bytes32 matchId, uint8 homeScore, uint8 awayScore, bytes32 reasonHash) external;
function recordPoints(bytes32 campaignId, bytes32 matchId, address wallet, uint32 points, uint8 outcomeCode) external;
function recordPointsBatch(bytes32 campaignId, bytes32 matchId, address[] calldata wallets, uint32[] calldata points, uint8[] calldata outcomeCodes) external;
```

## Coach Pass Scenarios

- Buy Daily, Weekly, Campaign, or Season pass.
- Active pass check works in browser and MiniPay from `hasActiveCoachPass(wallet)`.
- Same pass bought while active extends from current expiry.
- New pass bought after expiry starts from current block time.
- Pass history is readable onchain, not only from logs or local storage.
- Unsupported token is rejected.
- Wrong amount is rejected.
- Treasury receives stablecoin payment.
- Coach Pass does not change scoring, ranking, or prediction permissions.
- Expired pass keeps historical purchases but disables premium context.

Recommended functions:

```solidity
function purchaseCoachPass(uint8 passType, address token, uint256 maxAmount) external;
function hasActiveCoachPass(address wallet) external view returns (bool);
function getCoachPass(address wallet) external view returns (CoachPass memory);
function getCoachPassPurchaseCount(address wallet) external view returns (uint256);
function getCoachPassPurchase(address wallet, uint256 index) external view returns (CoachPassPurchase memory);
```

## Required Events

- `CampaignCreated`
- `CampaignUpdated`
- `CampaignStatusChanged`
- `MatchRegistered`
- `MatchUpdated`
- `MatchStatusChanged`
- `OfficialResultSubmitted`
- `OfficialResultCorrected`
- `PickSubmitted`
- `PickUpdated`
- `PickLocked`
- `PickScored`
- `PickVoided`
- `PlayerCampaignStatsUpdated`
- `CoachPassPurchased`
- `CoachPassPriceUpdated`
- `TokenAllowlistUpdated`
- `TreasuryUpdated`

## Anti-Redeploy Safeguards

- Use `bytes32 metadataHash` fields instead of hardcoding provider IDs, cup names, or localized text.
- Add pagination to all arrays that can grow.
- Add `contractVersion()`.
- Keep status enums with reserved values for future states.
- Add a configurable `maxScore`.
- Add pause and unpause.
- Keep token allowlist and pass prices configurable.
- Avoid hardcoding FIFA, UEFA, CONMEBOL, CAF, or one season into contract logic.
- Consider UUPS upgradeability only if the team is ready to manage proxy admin risk. A simple non-upgradeable contract with broad scenario coverage is easier to reason about.

## Frontend Migration Checklist

- Replace localStorage as source of truth for picks with `getPick` and user pick pagination.
- Keep local optimistic UI only as a temporary cache while a transaction is pending.
- Update My Picks to read wallet picks from Celo.
- Update Ranking to read campaign players and stats from Celo, then sort client-side.
- Update Coach Pass active state and purchase history from contract functions.
- Keep ESPN or fallback APIs for match data, flags, venues, and coach context, but not as the canonical wallet state.
- Keep MiniPay hidden wallet behavior: auto-connect when available, no connect popup.

## Test Matrix Before Deploy

- Submit pick, read in same browser.
- Submit pick, read in MiniPay with same wallet.
- Edit pick, read updated value in both clients.
- Try edit 29 minutes before kickoff: rejected.
- Try edit 31 minutes before kickoff: accepted.
- Score match and verify My Picks points.
- Correct result and verify total points adjust once.
- Buy Coach Pass and verify active in both clients.
- Expire Coach Pass and verify inactive.
- Read Coach Pass history with receipt proof.
- Ranking shows the selected campaign, not a hardcoded cup.
- Spanish and English UI read the same contract data.