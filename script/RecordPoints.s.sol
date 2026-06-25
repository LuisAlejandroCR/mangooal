// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/StdJson.sol";
import "../contracts/MangooalLedger.sol";

/**
 * Batch-record prediction points for a match after the official result is submitted.
 * Must be run by a wallet with ORACLE_ROLE.
 *
 * Workflow:
 *   1. Run SubmitResult.s.sol to record the official score on-chain.
 *   2. Run scripts/score-revealed.sh to compute per-wallet points:
 *        LEDGER_ADDRESS=0x...  MATCH_SLUG=cop26-col-bra  \
 *        HOME_SCORE=2  AWAY_SCORE=1                       \
 *        bash scripts/score-revealed.sh > scores.json
 *   3. Run this script:
 *        LEDGER_ADDRESS=0x...    \
 *        MATCH_SLUG=cop26-col-bra \
 *        SCORES_JSON=scores.json  \
 *        forge script script/RecordPoints.s.sol \
 *          --rpc-url celo --broadcast --legacy
 *
 * scores.json format (two parallel arrays):
 *   {"wallets":["0xABC...","0xDEF..."],"pts":[5,2]}
 *
 * The script is idempotent: recordPoints overwrites any prior value for the
 * same wallet+match — safe to re-run if interrupted.
 */
contract RecordPoints is Script {
    using stdJson for string;

    function run() external {
        MangooalLedger ledger = MangooalLedger(vm.envAddress("LEDGER_ADDRESS"));
        string memory slug    = vm.envString("MATCH_SLUG");
        string memory path    = vm.envString("SCORES_JSON");

        bytes32 campaignId = keccak256(abi.encodePacked("fifa-world-cup-2026"));
        bytes32 matchId    = keccak256(abi.encodePacked(slug));

        string memory json = vm.readFile(path);

        // Decode two parallel arrays from {"wallets":[...],"pts":[...]}
        address[] memory wallets = abi.decode(vm.parseJson(json, ".wallets"), (address[]));
        uint256[] memory ptsList = abi.decode(vm.parseJson(json, ".pts"),    (uint256[]));
        require(wallets.length == ptsList.length, "array length mismatch");

        console.log("Recording points for", wallets.length, "wallets");
        console.log("Match:", slug);

        vm.startBroadcast();
        uint256 recorded = 0;
        uint256 skipped  = 0;
        for (uint256 i = 0; i < wallets.length; i++) {
            try ledger.recordPoints(campaignId, matchId, wallets[i], uint32(ptsList[i])) {
                recorded++;
            } catch Error(string memory reason) {
                if (keccak256(bytes(reason)) == keccak256(bytes("already recorded"))) {
                    skipped++;
                } else {
                    revert(string.concat("recordPoints reverted: ", reason));
                }
            } catch (bytes memory) {
                revert("recordPoints: unexpected low-level revert");
            }
        }
        vm.stopBroadcast();

        console.log("Done. Recorded:", recorded, "  Skipped (already recorded):", skipped);
        console.log("PointsRecorded events now appear on Celoscan.");
        console.log("Ranking leaderboard updates within 2 minutes.");
    }
}
