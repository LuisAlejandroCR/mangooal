// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MangooalLedger.sol";

/**
 * Register FIFA World Cup 2026 Round of 32 matches in MangooalLedger.
 *
 * RUN ON JUNE 28 — after all group stage results are confirmed.
 * Kickoff times are fixed (sourced from ESPN API June 25, 2026).
 * Teams marked "TBD" must be filled in src/config/matches.ts before
 * re-deploying the frontend — on-chain matchIds use neutral slugs so
 * no re-registration is needed when teams are resolved.
 *
 * To get the final R32 bracket on June 28:
 *   for d in 20260629 20260630 20260701 20260702 20260703; do
 *     echo "=== $d ===" && \
 *     curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=$d" \
 *       | python3 -c "import json,sys; d=json.load(sys.stdin); \
 *         [print(e['date'], \
 *           e['competitions'][0]['competitors'][0]['team']['shortDisplayName'], 'vs', \
 *           e['competitions'][0]['competitors'][1]['team']['shortDisplayName']) \
 *         for e in d.get('events',[])]" 2>/dev/null
 *   done
 *
 * matchId = keccak256(abi.encodePacked("wc26-r32-NN"))
 * Must match keccak256(toHex("wc26-r32-NN")) in src/config/matches.ts.
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
 * Script is idempotent — "match exists" reverts are caught and skipped.
 */
contract RegisterMatches is Script {

    function run() external {
        MangooalLedger ledger  = MangooalLedger(vm.envAddress("LEDGER_ADDRESS"));
        bytes32 campaignId     = keccak256(abi.encodePacked("fifa-world-cup-2026"));

        vm.startBroadcast();

        // ── 0. OPERATOR_ROLE pre-granted by Safe ──────────────────────────────
        // Safe executed grantRole(OPERATOR_ROLE, deployer) before this script runs.
        // No self-grant needed (self-grant requires DEFAULT_ADMIN_ROLE which is gone).
        // At the end we renounceRole — role holders can renounce without admin rights.
        address me = msg.sender;
        console.log("Registering matches as:", me);

        // ── Round of 32 (June 29 – July 3, 2026) ─────────────────────────────
        // Kickoff times confirmed via ESPN API (June 25, 2026).
        // lockedAt = kickoffAt - 1800 (predictions lock 30 min before kickoff).

        // wc26-r32-01: Brazil vs TBD (Group F Runner-up)
        // UPDATE: replace TBD in src/config/matches.ts on June 28.
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-01")),
            keccak256(abi.encodePacked("wc26-r32-01")),
            1782752400, // kickoffAt: 2026-06-29 17:00 UTC — NRG Stadium, Houston TX
            1782750600  // lockedAt:  2026-06-29 16:30 UTC
        );

        // wc26-r32-02: Germany vs TBD (Best 3rd from Groups A/B/C/D/F)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-02")),
            keccak256(abi.encodePacked("wc26-r32-02")),
            1782765000, // kickoffAt: 2026-06-29 20:30 UTC — Gillette Stadium, Foxborough MA
            1782763200  // lockedAt:  2026-06-29 20:00 UTC
        );

        // wc26-r32-03: TBD (Group F Winner) vs Morocco
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-03")),
            keccak256(abi.encodePacked("wc26-r32-03")),
            1782781200, // kickoffAt: 2026-06-30 01:00 UTC — Estadio BBVA, Guadalupe MX
            1782779400  // lockedAt:  2026-06-30 00:30 UTC
        );

        // wc26-r32-04: TBD (Group I Runner-up) vs TBD (Group E Runner-up)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-04")),
            keccak256(abi.encodePacked("wc26-r32-04")),
            1782838800, // kickoffAt: 2026-06-30 17:00 UTC — AT&T Stadium, Arlington TX
            1782837000  // lockedAt:  2026-06-30 16:30 UTC
        );

        // wc26-r32-05: TBD (Best 3rd from Groups C/D/F/G/H) vs TBD (Group I Winner)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-05")),
            keccak256(abi.encodePacked("wc26-r32-05")),
            1782853200, // kickoffAt: 2026-06-30 21:00 UTC — MetLife Stadium, East Rutherford NJ
            1782851400  // lockedAt:  2026-06-30 20:30 UTC
        );

        // wc26-r32-06: TBD (Best 3rd from Groups C/E/F/H/I) vs Mexico
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-06")),
            keccak256(abi.encodePacked("wc26-r32-06")),
            1782867600, // kickoffAt: 2026-07-01 01:00 UTC — Estadio BBVA, Guadalupe MX
            1782865800  // lockedAt:  2026-07-01 00:30 UTC
        );

        // wc26-r32-07: TBD (Group L Winner) vs TBD (Best 3rd from Groups E/H/I/J/K)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-07")),
            keccak256(abi.encodePacked("wc26-r32-07")),
            1782921600, // kickoffAt: 2026-07-01 16:00 UTC — Mercedes-Benz Stadium, Atlanta GA
            1782919800  // lockedAt:  2026-07-01 15:30 UTC
        );

        // wc26-r32-08: TBD (Group G Winner) vs TBD (Best 3rd from Groups A/E/H/I/J)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-08")),
            keccak256(abi.encodePacked("wc26-r32-08")),
            1782936000, // kickoffAt: 2026-07-01 20:00 UTC — Lumen Field, Seattle WA
            1782934200  // lockedAt:  2026-07-01 19:30 UTC
        );

        // wc26-r32-09: TBD (Group H Winner) vs TBD (Group J Runner-up)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-09")),
            keccak256(abi.encodePacked("wc26-r32-09")),
            1783018800, // kickoffAt: 2026-07-02 19:00 UTC — SoFi Stadium, Inglewood CA
            1783017000  // lockedAt:  2026-07-02 18:30 UTC
        );

        // wc26-r32-10: TBD (Group K Runner-up) vs TBD (Group L Runner-up)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-10")),
            keccak256(abi.encodePacked("wc26-r32-10")),
            1783033200, // kickoffAt: 2026-07-02 23:00 UTC — BMO Field, Toronto CA
            1783031400  // lockedAt:  2026-07-02 22:30 UTC
        );

        // wc26-r32-11: Switzerland vs TBD (Best 3rd from Groups E/F/G/I/J)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-11")),
            keccak256(abi.encodePacked("wc26-r32-11")),
            1783047600, // kickoffAt: 2026-07-03 03:00 UTC — BC Place, Vancouver CA
            1783045800  // lockedAt:  2026-07-03 02:30 UTC
        );

        // wc26-r32-12: USA vs Bosnia-Herz (Jul 2 00:00 UTC)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-12")),
            keccak256(abi.encodePacked("wc26-r32-12")),
            1782950400, // kickoffAt: 2026-07-02 00:00 UTC — SoFi Stadium, Inglewood CA
            1782948600  // lockedAt:  2026-07-01 23:30 UTC
        );

        // wc26-r32-13: Australia vs TBD (Group G Runner-up)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-13")),
            keccak256(abi.encodePacked("wc26-r32-13")),
            1783101600, // kickoffAt: 2026-07-03 18:00 UTC — Lincoln Financial Field, Philadelphia PA
            1783099800  // lockedAt:  2026-07-03 17:30 UTC
        );

        // wc26-r32-14: Argentina vs TBD (Group H Runner-up)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-14")),
            keccak256(abi.encodePacked("wc26-r32-14")),
            1783116000, // kickoffAt: 2026-07-03 22:00 UTC — Levi's Stadium, Santa Clara CA
            1783114200  // lockedAt:  2026-07-03 21:30 UTC
        );

        // wc26-r32-15: TBD (Group K Winner) vs TBD (Best 3rd Groups D/E/I/J/L)
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-15")),
            keccak256(abi.encodePacked("wc26-r32-15")),
            1783128600, // kickoffAt: 2026-07-04 01:30 UTC — Estadio Akron, Guadalajara MX
            1783126800  // lockedAt:  2026-07-04 01:00 UTC
        );

        // wc26-r32-16: Canada vs Morocco
        _register(ledger, campaignId,
            keccak256(abi.encodePacked("wc26-r32-16")),
            keccak256(abi.encodePacked("wc26-r32-16")),
            1783184400, // kickoffAt: 2026-07-04 17:00 UTC
            1783182600  // lockedAt:  2026-07-04 16:30 UTC
        );

        // ── Cleanup ──────────────────────────────────────────────────────────
        // renounceRole = role holder gives up own role. No admin rights needed.
        ledger.renounceRole(ledger.OPERATOR_ROLE(), me);
        console.log("OPERATOR_ROLE renounced by broadcaster");

        vm.stopBroadcast();

        console.log("Matches registered (wc26-r32-01 through wc26-r32-16). R32 complete.");
        console.log("Next: Safe revokes DEFAULT_ADMIN_ROLE from deployer.");
        console.log("  revokeRole(0x00...0, 0x8cCb6982f9786C1AC3fF6E4BA18541917A82e0F1)");
        console.log("Then: set VITE_DEPLOY_BLOCK in Vercel + LEDGER_ADDRESS in GitHub.");
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
        } catch Error(string memory reason) {
            if (keccak256(bytes(reason)) == keccak256(bytes("match exists"))) {
                console.log("Already registered (skipped):");
                console.logBytes32(matchId);
            } else {
                revert(string.concat("registerMatch reverted: ", reason));
            }
        } catch (bytes memory) {
            revert("registerMatch: unexpected low-level revert");
        }
    }
}
