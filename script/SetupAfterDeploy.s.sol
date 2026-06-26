// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MangooalLedger.sol";

/**
 * Post-deployment setup for MangooalLedger.
 * Run this immediately after Deploy.s.sol. Configures pass prices,
 * grants ORACLE_ROLE, and creates the first campaign.
 *
 * Required env vars:
 *   LEDGER_ADDRESS     — checksummed address from Deploy.s.sol output
 *                        (run `cast to-checksum-address <addr>` first!)
 *
 * Optional env vars:
 *   ORACLE_ADDRESS     — wallet that submits official match results
 *                        (granted ORACLE_ROLE; skip if using the admin wallet)
 *
 * Run:
 *   LEDGER_ADDRESS=0x...       \
 *   ORACLE_ADDRESS=0x...       \
 *   ETHERSCAN_API_KEY=...      \
 *   forge script script/SetupAfterDeploy.s.sol \
 *     --rpc-url celo           \
 *     --broadcast              \
 *     --legacy
 *
 * Verify the campaign was created:
 *   cast call <LEDGER_ADDRESS> \
 *     "getCampaign(bytes32)((bytes32,uint64,uint64,bool))" \
 *     $(cast keccak "fifa-world-cup-2026") \
 *     --rpc-url https://forno.celo.org
 */
contract SetupAfterDeploy is Script {

    // ── Celo Mainnet stablecoin addresses ─────────────────────────────────────
    // Source: celopedia-skill/contracts.md (2026-04-15 snapshot)
    address constant USDM = 0x765DE816845861e75A25fCA122bb6898B8B1282a; // 18 dec
    address constant USDC = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C; //  6 dec
    address constant USDT = 0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e; //  6 dec
    address constant COPM = 0x8A567e2aE79CA692Bd748aB832081C45de4041eA; // 18 dec

    // ── Pass prices — mirrors PASS_AMOUNTS in useMangoalLedger.ts ─────────────
    // 18-decimal tokens (USDm, COPm): use `ether` keyword (= 10^18)
    //  6-decimal tokens (USDC, USDT): explicit integers
    uint256 constant DAILY_COPM    =    500 ether; // 500 COPm
    uint256 constant DAILY_USDC    =    100_000;   // $0.10 (6 dec)
    uint256 constant DAILY_USDT    =    100_000;
    uint256 constant DAILY_USDM    =  1 ether / 10; // 0.10 USDm (18 dec)

    uint256 constant WEEKLY_COPM   =  2_500 ether; // 2,500 COPm
    uint256 constant WEEKLY_USDC   =    500_000;   // $0.50
    uint256 constant WEEKLY_USDT   =    500_000;
    uint256 constant WEEKLY_USDM   =  1 ether / 2; // 0.50 USDm

    uint256 constant CAMP_COPM     =  8_000 ether; // 8,000 COPm
    uint256 constant CAMP_USDC     =  1_500_000;   // $1.50
    uint256 constant CAMP_USDT     =  1_500_000;
    uint256 constant CAMP_USDM     = 15 * 1 ether / 10; // 1.50 USDm

    uint256 constant SEASON_COPM   = 40_000 ether; // 40,000 COPm
    uint256 constant SEASON_USDC   =  7_000_000;   // $7.00
    uint256 constant SEASON_USDT   =  7_000_000;
    uint256 constant SEASON_USDM   =  7 ether;     // 7.00 USDm

    // ── FIFA World Cup 2026 campaign ──────────────────────────────────────────
    // campaignId must match keccak256(toHex("fifa-world-cup-2026")) used in the frontend.
    // Starts after all groups resolve (June 28); ends after the Final + 48h reveal window.
    uint64 constant CAMPAIGN_STARTS = 1782604800; // 2026-06-28 00:00 UTC
    uint64 constant CAMPAIGN_ENDS   = 1784678400; // 2026-07-22 00:00 UTC

    function run() external {
        MangooalLedger ledger  = MangooalLedger(vm.envAddress("LEDGER_ADDRESS"));
        address oracleAddr     = vm.envOr("ORACLE_ADDRESS", address(0));

        vm.startBroadcast();

        // ── 1. Grant ORACLE_ROLE ────────────────────────────────────────────
        if (oracleAddr != address(0)) {
            ledger.grantRole(ledger.ORACLE_ROLE(), oracleAddr);
            console.log("ORACLE_ROLE granted to:", oracleAddr);
        } else {
            console.log("ORACLE_ADDRESS not set, skipping ORACLE_ROLE grant");
        }

        // ── 2. Set pass prices (16 combinations: 4 types × 4 tokens) ───────
        // Daily (passType = 1)
        ledger.setPassPrice(1, COPM, DAILY_COPM);
        ledger.setPassPrice(1, USDC, DAILY_USDC);
        ledger.setPassPrice(1, USDT, DAILY_USDT);
        ledger.setPassPrice(1, USDM, DAILY_USDM);

        // Weekly (passType = 2)
        ledger.setPassPrice(2, COPM, WEEKLY_COPM);
        ledger.setPassPrice(2, USDC, WEEKLY_USDC);
        ledger.setPassPrice(2, USDT, WEEKLY_USDT);
        ledger.setPassPrice(2, USDM, WEEKLY_USDM);

        // Campaign (passType = 3)
        ledger.setPassPrice(3, COPM, CAMP_COPM);
        ledger.setPassPrice(3, USDC, CAMP_USDC);
        ledger.setPassPrice(3, USDT, CAMP_USDT);
        ledger.setPassPrice(3, USDM, CAMP_USDM);

        // Season (passType = 4)
        ledger.setPassPrice(4, COPM, SEASON_COPM);
        ledger.setPassPrice(4, USDC, SEASON_USDC);
        ledger.setPassPrice(4, USDT, SEASON_USDT);
        ledger.setPassPrice(4, USDM, SEASON_USDM);

        console.log("Pass prices configured (16 combinations)");

        // ── 3. Create FIFA World Cup 2026 campaign ───────────────────────────
        // keccak256(abi.encodePacked("fifa-world-cup-2026")) must equal
        // keccak256(toHex("fifa-world-cup-2026")) from the frontend — they hash
        // the same UTF-8 bytes, so the IDs will match.
        bytes32 campaignId   = keccak256(abi.encodePacked("fifa-world-cup-2026"));
        bytes32 metadataHash = keccak256(abi.encodePacked("FIFA World Cup 2026 - Mangooal"));

        ledger.createCampaign(campaignId, metadataHash, CAMPAIGN_STARTS, CAMPAIGN_ENDS);

        console.log("Campaign created:");
        console.logBytes32(campaignId);
        console.log("  startsAt:", CAMPAIGN_STARTS, "(see CAMPAIGN_STARTS constant)");
        console.log("  endsAt  :", CAMPAIGN_ENDS,   "(see CAMPAIGN_ENDS constant)");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Setup complete ===");
        console.log("Next steps:");
        console.log("  1. Set VITE_DEPLOY_BLOCK=<block> in Vercel env vars");
        console.log("  2. Redeploy frontend on Vercel");
        console.log("  3. Verify on Celoscan: https://celoscan.io/address/", address(ledger));
    }
}
