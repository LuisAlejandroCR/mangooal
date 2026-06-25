// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import "../contracts/MangooalLedger.sol";

/**
 * Deploy MangooalLedger to Celo Mainnet.
 *
 * Setup (one-time):
 *   forge install foundry-rs/forge-std --no-commit
 *   forge install OpenZeppelin/openzeppelin-contracts --no-commit
 *
 * Deploy to Celo Mainnet:
 *   ADMIN_ADDRESS=0x...   \
 *   TREASURY_ADDRESS=0x...  \
 *   CELOSCAN_API_KEY=...     \
 *   forge script script/Deploy.s.sol \
 *     --rpc-url celo \
 *     --broadcast \
 *     --verify \
 *     --legacy
 *
 * The --legacy flag is required on Celo (no EIP-1559 on the OP L2 sequencer).
 *
 * After deployment:
 *   1. Copy the deployed address into src/hooks/useMangoalLedger.ts → MANGOAL_LEDGER_ADDRESS
 *   2. Grant OPERATOR_ROLE to the backend oracle wallet
 *   3. Grant ORACLE_ROLE to the result-submission wallet
 *   4. Call setPassPrice() for each pass type × token combination
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
