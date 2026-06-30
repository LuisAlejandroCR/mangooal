# Mangooal MiniPay and Public Web Model

Mangooal should run as one product with two entry modes: a MiniPay-native mode for users who are ready to play, and a public web mode for discovery, demo, support, stats, and connected-wallet play outside MiniPay.

## Inspiration, Not Copy

The references point to a useful onboarding pattern: short demo first, visible brand, clear wallet state, language selection, and low-friction entry. Mangooal should adapt that pattern to football score picks instead of copying another app's theme, mechanics, or visual identity.

References reviewed:

- https://www.zorrito.app/
- https://github.com/csacanam/freaking-grammar
- https://github.com/hdezdav/Mini-Card

## Entry Modes

### MiniPay Mode

- Detect `window.ethereum.isMiniPay`.
- Auto-connect with the injected provider.
- Do not show a connect wallet button inside MiniPay.
- Keep transaction assets to USDC, USDT, and USDm for user-facing MiniPay flows.
- Do not show CELO as a token option.
- Use MiniPay copy rules: Network fee, Deposit, Withdraw, Stablecoin.
- Keep the main path short: Picks -> Match -> Submit -> My Picks.

### Public Web Mode

- Show the app, support, stats, terms, and demo tour without a wallet.
- Require a connected Celo wallet before showing wallet-owned app data.
- Keep `/demo`, `/support`, `/stats`, `/terms`, and direct support links available without the bottom navigation requirement.
- Treat local demo state as preview only. Picks, ranking, My Picks, and Coach Pass should come from Celo once the wallet is connected.

## Recommended Product Model

1. Free score picks are the core loop.
2. Celo stores editable picks, My Picks, ranking stats, and Coach Pass state.
3. Football APIs provide match schedules, live status, flags, venues, and coach context, but not wallet-owned truth.
4. Coach Pass is a paid context layer only. It does not affect points, ranking, eligibility, or promotional rewards.
5. Public web is the learning and trust surface: demo tour, legal, stats, support, contract proofs.
6. MiniPay is the fastest play surface: auto-connect, supported stablecoins, short flows.

## Demo Tour Role

The demo tour should answer four questions before a user connects:

- What do I do? Pick an exact score before lock.
- Is it paid? Picks are free; Coach Pass is optional context.
- Where is my data? Wallet-owned state is read from Celo.
- Can I use it outside MiniPay? Yes, with a Celo wallet; MiniPay auto-connects.

The tour must not simulate a real transaction, imply a prize pool, show odds, or make a prediction look guaranteed.

## MiniPay Readiness Notes

Before submitting to MiniPay intake:

- Test the app at 360 x 640.
- Keep app name and logo visible.
- Keep support and legal links reachable.
- Verify the new contract on Celoscan after deployment.
- Collect sample transaction hashes for pick submit/update and Coach Pass purchase.
- Prepare a network/origin manifest for APIs, RPCs, analytics, and assets.
- Keep the demo tour available for reviewers without requiring a wallet.