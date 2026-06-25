// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MangooalLedger.sol";

/**
 * Generate the EIP-712 operator signature for claimPromotionalReward.
 *
 * The signature authorises exactly ONE wallet to claim ONE reward from
 * the contract. Each claim increments rewardNonces[wallet] on-chain,
 * so the signature cannot be replayed even if rewardClaimed is reset.
 *
 * Required env vars:
 *   LEDGER_ADDRESS       deployed MangooalLedger (checksummed)
 *   OPERATOR_PRIVATE_KEY private key of OPERATOR_ROLE signer (hex, no 0x prefix)
 *   RECIPIENT            wallet address that will claim the reward
 *   TOKEN                token contract address (must be in contract allowlist)
 *   AMOUNT               raw token amount in smallest unit
 *                        (e.g. 500000000000000000000 for 500 COPm at 18 dec,
 *                                       150000 for $1.50 USDC at 6 dec)
 *   LABEL                human-readable label for the deep link (URL-encoded)
 *                        e.g. "Copa%20Am%C3%A9rica%202026"
 *
 * Run (no --broadcast needed — read-only, generates signature only):
 *   LEDGER_ADDRESS=0x...          \
 *   OPERATOR_PRIVATE_KEY=abc...   \
 *   RECIPIENT=0x...               \
 *   TOKEN=0x8A567...              \
 *   AMOUNT=500000000000000000000  \
 *   LABEL=FIFA%20World%20Cup%202026 \
 *   forge script script/SignReward.s.sol --rpc-url celo
 *
 * Output:
 *   Deep link to send to the recipient:
 *   /claim?cid=0x...&token=0x...&amount=...&nonce=...&sig=0x...&label=...
 *
 * Security:
 *   - Never commit OPERATOR_PRIVATE_KEY to git.
 *   - Load via: export OPERATOR_PRIVATE_KEY=$(pass show mangooal/operator)
 *   - The nonce is read live from the contract — run this script last,
 *     immediately before sending the deep link to the recipient.
 *   - The signature is bound to chain 42220 + this contract address.
 *     It cannot be replayed on testnet or a different deployment.
 */
contract SignReward is Script {

    bytes32 private constant CLAIM_TYPEHASH = keccak256(
        "Claim(address wallet,bytes32 campaignId,address token,uint256 amount,uint256 nonce)"
    );

    function run() external view {
        MangooalLedger ledger = MangooalLedger(vm.envAddress("LEDGER_ADDRESS"));
        address recipient     = vm.envAddress("RECIPIENT");
        address token         = vm.envAddress("TOKEN");
        uint256 amount        = vm.envUint("AMOUNT");
        string  memory label  = vm.envString("LABEL");

        bytes32 campaignId = keccak256(abi.encodePacked("fifa-world-cup-2026"));

        // Read current nonce for this recipient — sign this exact value
        uint256 nonce = ledger.rewardNonces(recipient);

        // EIP-712 digest — mirrors _verifyOperatorClaim in MangooalLedger.sol
        bytes32 domainSep  = ledger.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(abi.encode(
            CLAIM_TYPEHASH,
            recipient,
            campaignId,
            token,
            amount,
            nonce
        ));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSep, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            vm.envUint("OPERATOR_PRIVATE_KEY"),
            digest
        );
        bytes memory sig = abi.encodePacked(r, s, v);

        console.log("=== Mangooal Reward Signature (EIP-712) ===");
        console.log("Contract:   "); console.logAddress(address(ledger));
        console.log("Recipient:  "); console.logAddress(recipient);
        console.log("Token:      "); console.logAddress(token);
        console.log("Amount:     "); console.logUint(amount);
        console.log("CampaignId: "); console.logBytes32(campaignId);
        console.log("Nonce:      "); console.logUint(nonce);
        console.log("Signature:  "); console.logBytes(sig);

        console.log("\n=== Deep Link (send to recipient) ===");
        console.log("/claim");
        console.log("  ?cid=");    console.logBytes32(campaignId);
        console.log("  &token=");  console.logAddress(token);
        console.log("  &amount="); console.logUint(amount);
        console.log("  &nonce=");  console.logUint(nonce);
        console.log("  &sig=");    console.logBytes(sig);
        console.log("  &label=",  label);
        console.log("\nVerify the recipient address before sending!");
    }
}
