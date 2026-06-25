// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

/**
 * Generate the ECDSA operator signature for claimPromotionalReward.
 *
 * The signature authorises exactly ONE wallet to claim ONE reward from
 * the contract. It is single-use (rewardClaimed[wallet][campaignId] is
 * set on-chain after the first claim).
 *
 * Required env vars:
 *   OPERATOR_PRIVATE_KEY   private key of OPERATOR_ROLE signer (hex, no 0x prefix)
 *   RECIPIENT              wallet address that will claim the reward
 *   TOKEN                  token contract address (must be in contract allowlist)
 *   AMOUNT                 raw token amount in smallest unit
 *                          (e.g. 500000000000000000000 for 500 COPm at 18 dec,
 *                                        150000 for $1.50 USDC at 6 dec)
 *   LABEL                  human-readable label for the deep link (URL-encoded)
 *                          e.g. "Copa%20Am%C3%A9rica%202026"
 *
 * Run (no --broadcast needed — generates signature only, no on-chain tx):
 *   OPERATOR_PRIVATE_KEY=abc...  \
 *   RECIPIENT=0x...              \
 *   TOKEN=0x8A567...             \
 *   AMOUNT=500000000000000000000 \
 *   LABEL=Copa%20Am%C3%A9rica%202026 \
 *   forge script script/SignReward.s.sol --rpc-url celo
 *
 * Output:
 *   Deep link to send to the recipient:
 *   /claim?cid=0x...&token=0x...&amount=...&sig=0x...&label=...
 *
 * Security:
 *   - Never commit OPERATOR_PRIVATE_KEY to git.
 *   - Store in a password manager; load via `export OPERATOR_PRIVATE_KEY=$(pass show mangooal/operator)`.
 *   - The signature is specific to the recipient address — it cannot be reused by another wallet.
 */
contract SignReward is Script {

    function run() external view {
        address recipient = vm.envAddress("RECIPIENT");
        address token     = vm.envAddress("TOKEN");
        uint256 amount    = vm.envUint("AMOUNT");
        string  memory label = vm.envString("LABEL");

        bytes32 campaignId = keccak256(abi.encodePacked("copa-america-2026"));

        // Mirror _verifyOperatorClaim in MangooalLedger.sol:
        //   msgHash = keccak256(abi.encodePacked(wallet, campaignId, token, amount))
        //   ethHash = keccak256("\x19Ethereum Signed Message:\n32" || msgHash)
        bytes32 msgHash = keccak256(abi.encodePacked(recipient, campaignId, token, amount));
        bytes32 ethHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            vm.envUint("OPERATOR_PRIVATE_KEY"),
            ethHash
        );
        bytes memory sig = abi.encodePacked(r, s, v);

        console.log("=== Mangooal Reward Signature ===");
        console.log("Recipient:  "); console.logAddress(recipient);
        console.log("Token:      "); console.logAddress(token);
        console.log("Amount:     "); console.logUint(amount);
        console.log("CampaignId: "); console.logBytes32(campaignId);
        console.log("Signature:  "); console.logBytes(sig);

        // Encode deep-link URL components (Solidity can't URL-encode so we output parts)
        console.log("\n=== Deep Link (assemble and send to recipient) ===");
        console.log("/claim");
        console.log("  ?cid="); console.logBytes32(campaignId);
        console.log("  &token="); console.logAddress(token);
        console.log("  &amount="); console.logUint(amount);
        console.log("  &sig="); console.logBytes(sig);
        console.log("  &label=", label);
        console.log("\nVerify the recipient address before sending!");
    }
}
