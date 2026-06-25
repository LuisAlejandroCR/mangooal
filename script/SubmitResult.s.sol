// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MangooalLedger.sol";

/**
 * Submit the official result for a Copa América 2026 match.
 * Must be run by a wallet with ORACLE_ROLE.
 *
 * Required env vars:
 *   LEDGER_ADDRESS   checksummed deployed MangooalLedger address
 *   MATCH_SLUG       match URL slug, e.g. "cop26-col-bra"
 *   HOME_SCORE       official home goals (uint8)
 *   AWAY_SCORE       official away goals (uint8)
 *
 * Run:
 *   LEDGER_ADDRESS=0x...   \
 *   MATCH_SLUG=cop26-col-bra \
 *   HOME_SCORE=2           \
 *   AWAY_SCORE=1           \
 *   forge script script/SubmitResult.s.sol \
 *     --rpc-url celo       \
 *     --broadcast          \
 *     --legacy
 *
 * After this succeeds:
 *   1. Verify on Celoscan: getMatch(matchId).resultSubmitted == true
 *   2. Run RecordPoints.s.sol with scores.json to award points
 */
contract SubmitResult is Script {

    function run() external {
        MangooalLedger ledger = MangooalLedger(vm.envAddress("LEDGER_ADDRESS"));
        string memory slug    = vm.envString("MATCH_SLUG");
        uint8  homeScore      = uint8(vm.envUint("HOME_SCORE"));
        uint8  awayScore      = uint8(vm.envUint("AWAY_SCORE"));

        bytes32 campaignId = keccak256(abi.encodePacked("copa-america-2026"));
        bytes32 matchId    = keccak256(abi.encodePacked(slug));

        console.log("Submitting result for match slug:", slug);
        console.log("Home score:", homeScore, "Away score:", awayScore);

        vm.startBroadcast();
        ledger.submitOfficialResult(campaignId, matchId, homeScore, awayScore);
        vm.stopBroadcast();

        console.log("Result submitted.");
        console.log("Next: run scripts/score-revealed.sh then RecordPoints.s.sol");
    }
}
