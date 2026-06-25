// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import "../contracts/MangooalLedger.sol";

/**
 * Deploy MangooalLedger to Celo Mainnet.
 *
 * ── One-time Foundry setup ────────────────────────────────────────────────
 *   forge install foundry-rs/forge-std --no-commit
 *   forge install OpenZeppelin/openzeppelin-contracts --no-commit
 *
 * ── Deploy ────────────────────────────────────────────────────────────────
 *   ADMIN_ADDRESS=0x...          \
 *   TREASURY_ADDRESS=0x...       \
 *   ETHERSCAN_API_KEY=...        \
 *   forge script script/Deploy.s.sol \
 *     --rpc-url celo             \
 *     --broadcast                \
 *     --verify                   \
 *     --legacy
 *
 *   Flags:
 *     --legacy   Required on Celo — OP L2 sequencer only accepts legacy txs.
 *     --verify   Verifies source on Celoscan. Needs ETHERSCAN_API_KEY
 *                (Celoscan uses the Etherscan V2 unified API; get a free key
 *                 at https://etherscan.io/register).
 *
 * ── After deployment ──────────────────────────────────────────────────────
 *   1. Checksum the deployed address (viem enforces strict EIP-55):
 *        cast to-checksum-address <deployed-address>
 *
 *   2. Paste into src/hooks/useMangoalLedger.ts → MANGOAL_LEDGER_ADDRESS
 *
 *   3. Get the deploy block number (for VITE_DEPLOY_BLOCK env var):
 *        cast receipt --rpc-url https://forno.celo.org <tx-hash> | grep blockNumber
 *
 *   4. Run post-deploy setup (pass prices + Copa América campaign + ORACLE_ROLE):
 *        LEDGER_ADDRESS=<checksummed>   \
 *        ORACLE_ADDRESS=<oracle-wallet>  \
 *        ETHERSCAN_API_KEY=...           \
 *        forge script script/SetupAfterDeploy.s.sol \
 *          --rpc-url celo --broadcast --legacy
 *
 *   5. Set VITE_DEPLOY_BLOCK=<block-number> in Vercel env vars, then redeploy.
 */
contract DeployMangooalLedger is Script {
    function run() external {
        address admin    = vm.envAddress("ADMIN_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast();

        MangooalLedger ledger = new MangooalLedger(admin, treasury);

        console.log("MangooalLedger deployed at:", address(ledger));
        console.log("Admin:", admin);
        console.log("Treasury:", treasury);

        vm.stopBroadcast();
    }
}
