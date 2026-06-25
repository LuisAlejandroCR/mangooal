// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MangooalLedger.sol";

/**
 * Register Copa América 2026 matches in MangooalLedger.
 * Run before each match window opens (lockedAt). Can be run repeatedly —
 * the contract reverts "match exists" if a matchId is already registered,
 * which is safe.
 *
 * matchId values mirror keccak256(toHex(slug)) from src/config/matches.ts:
 *   keccak256(abi.encodePacked("cop26-col-bra"))  ==  keccak256(toHex("cop26-col-bra"))
 * Both hash the same UTF-8 bytes, so on-chain IDs match the frontend.
 *
 * Required env vars:
 *   LEDGER_ADDRESS  — checksummed deployed MangooalLedger address
 *
 * Run:
 *   LEDGER_ADDRESS=0x...      \
 *   forge script script/RegisterMatches.s.sol \
 *     --rpc-url celo          \
 *     --broadcast             \
 *     --legacy
 *
 * To register a single match, comment out the others below.
 */
contract RegisterMatches is Script {

    function run() external {
        MangooalLedger ledger  = MangooalLedger(vm.envAddress("LEDGER_ADDRESS"));
        bytes32 campaignId     = keccak256(abi.encodePacked("copa-america-2026"));

        vm.startBroadcast();

        // ── Match 1: Colombia vs Brazil ───────────────────────────────────────
        // UPDATE timestamps to match the real schedule before deploying.
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("cop26-col-bra")),
            keccak256(abi.encodePacked("Colombia vs Brazil - Copa America 2026")),
            1782399600, // kickoffAt: 2026-06-25 15:00 UTC — UPDATE
            1782397800  // lockedAt:  2026-06-25 14:30 UTC
        );

        // ── Match 2: Argentina vs Mexico ──────────────────────────────────────
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("cop26-arg-mex")),
            keccak256(abi.encodePacked("Argentina vs Mexico - Copa America 2026")),
            1782496800, // kickoffAt: 2026-06-26 18:00 UTC — UPDATE
            1782495000  // lockedAt:  2026-06-26 17:30 UTC
        );

        // ── Match 3: Uruguay vs USA ───────────────────────────────────────────
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("cop26-uru-usa")),
            keccak256(abi.encodePacked("Uruguay vs USA - Copa America 2026")),
            1782594000, // kickoffAt: 2026-06-27 21:00 UTC — UPDATE
            1782592200  // lockedAt:  2026-06-27 20:30 UTC
        );

        vm.stopBroadcast();

        console.log("All matches registered.");
        console.log("Next: verify on Celoscan that getMatch() returns the correct data.");
    }

    function _register(
        MangooalLedger ledger,
        bytes32 campaignId,
        bytes32 matchId,
        bytes32 metadataHash,
        uint64  kickoffAt,
        uint64  lockedAt
    ) internal {
        try ledger.registerMatch(campaignId, matchId, metadataHash, kickoffAt, lockedAt) {
            console.log("Registered:");
            console.logBytes32(matchId);
        } catch {
            console.log("Already registered (skipped):");
            console.logBytes32(matchId);
        }
    }
}
