// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * MangooalLedger — single on-chain contract for Mangooal sports prediction Mini App.
 * Celo Mainnet (Chain ID 42220).
 *
 * Responsibilities:
 *   - Campaign and match registration
 *   - Commit-reveal prediction audit trail
 *   - Coach Pass purchase and validity tracking
 *   - Optional promotional reward claim tracking
 *   - Stablecoin payment allowlist (COPm, USDm, USDC, USDT, EURm, BRLm, KESm, etc.)
 *
 * COMPLIANCE DECLARATION:
 *   This contract is NOT a betting contract.
 *   - No user-funded prize pools
 *   - No winner-takes-all mechanics
 *   - No odds
 *   - No staking
 *   - Coach Pass is analytics/UX only — does not affect points or ranking
 *   - Promotional rewards are operator-distributed, not user-funded
 *
 * Stablecoin addresses (celopedia-skill/contracts.md, 2026-04-15):
 *   USDm  0x765DE816845861e75A25fCA122bb6898B8B1282a (18 dec)
 *   USDC  0xcebA9300f2b948710d2653dD7B07f33A8B32118C (6 dec)
 *   USDT  0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e (6 dec)
 *   COPm  0x8A567e2aE79CA692Bd748aB832081C45de4041eA (18 dec) ← first-class
 *   EURm  0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73 (18 dec)
 *   BRLm  0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787 (18 dec)
 *   KESm  0x456a3D042C0DbD3db53D5489e98dFb038553B0d0 (18 dec)
 *   NGNm  0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71 (18 dec)
 *   XOFm  0x73F93dcc49cB8A239e2032663e9475dd5ef29A08 (18 dec)
 *   GHSm  0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313 (18 dec)
 *   PHPm  0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B (18 dec)
 *   ZARm  0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6 (18 dec)
 */
contract MangooalLedger is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Roles ───────────────────────────────────────────────────────────────
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant ORACLE_ROLE   = keccak256("ORACLE_ROLE");

    // ─── Pass type constants ──────────────────────────────────────────────────
    uint8 public constant PASS_DAILY    = 1;
    uint8 public constant PASS_WEEKLY   = 2;
    uint8 public constant PASS_CAMPAIGN = 3;
    uint8 public constant PASS_SEASON   = 4;

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct Campaign {
        bytes32 metadataHash;
        uint64  startsAt;
        uint64  endsAt;
        bool    active;
    }

    struct Match {
        bytes32 campaignId;
        bytes32 metadataHash;
        uint64  kickoffAt;
        uint64  lockedAt;
        bool    resultSubmitted;
        uint8   homeScore;
        uint8   awayScore;
    }

    struct PredictionCommit {
        bytes32 predictionHash; // keccak256(wallet, campaignId, matchId, homeScore, awayScore, salt)
        uint64  committedAt;
        uint64  revealedAt;
        uint8   homeScore;
        uint8   awayScore;
        bool    revealed;
    }

    struct CoachPassEntry {
        uint8   passType;
        address token;
        uint256 amount;
        uint64  startsAt;
        uint64  expiresAt;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    mapping(bytes32 => Campaign)   public campaigns;
    mapping(bytes32 => Match)      public matches;

    // wallet => campaignId => matchId => PredictionCommit
    mapping(address => mapping(bytes32 => mapping(bytes32 => PredictionCommit))) public predictions;

    // wallet => latest CoachPassEntry
    mapping(address => CoachPassEntry) public coachPasses;

    // wallet => campaignId => claimed
    mapping(address => mapping(bytes32 => bool)) public rewardClaimed;

    // wallet => campaignId => matchId => points
    mapping(address => mapping(bytes32 => mapping(bytes32 => uint32))) public points;

    // Allowed stablecoins for Coach Pass payment (verified Celo Mainnet addresses)
    mapping(address => bool) public allowedTokens;

    // Coach Pass pricing: passType => token => price in token's native units
    mapping(uint8 => mapping(address => uint256)) public passPrices;

    address public treasury;

    // ─── Events ───────────────────────────────────────────────────────────────

    event CampaignCreated(
        bytes32 indexed campaignId,
        bytes32 metadataHash,
        uint64 startsAt,
        uint64 endsAt
    );
    event MatchRegistered(
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint64 kickoffAt,
        uint64 lockedAt
    );
    event PredictionCommitted(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        bytes32 predictionHash,
        uint64  committedAt
    );
    event PredictionRevealed(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint8  homeScore,
        uint8  awayScore,
        uint64 revealedAt
    );
    event MatchLocked(bytes32 indexed campaignId, bytes32 indexed matchId);
    event ResultSubmitted(
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint8 homeScore,
        uint8 awayScore
    );
    event PointsRecorded(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint32 pts
    );
    event CoachPassPurchased(
        address indexed wallet,
        uint8   passType,
        address token,
        uint256 amount,
        uint64  expiresAt
    );
    event RewardClaimed(
        address indexed wallet,
        bytes32 indexed campaignId,
        uint256 amount,
        address token
    );
    event TokenAllowlistUpdated(address indexed token, bool allowed);
    event TreasuryUpdated(address indexed treasury);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address admin, address _treasury) {
        require(admin != address(0), "zero admin");
        require(_treasury != address(0), "zero treasury");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        treasury = _treasury;

        // Seed allowlist — Celo Mainnet verified addresses (celopedia-skill 2026-04-15)
        _allow(0x765DE816845861e75A25fCA122bb6898B8B1282a); // USDm  (18 dec)
        _allow(0xcebA9300f2b948710d2653dD7B07f33A8B32118C); // USDC  (6 dec)
        _allow(0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e); // USDT  (6 dec)
        _allow(0x8A567e2aE79CA692Bd748aB832081C45de4041eA); // COPm  (18 dec) ← first-class
        _allow(0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73); // EURm  (18 dec)
        _allow(0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787); // BRLm  (18 dec)
        _allow(0x456a3D042C0DbD3db53D5489e98dFb038553B0d0); // KESm  (18 dec)
        _allow(0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71); // NGNm  (18 dec)
        _allow(0x73F93dcc49cB8A239e2032663e9475dd5ef29A08); // XOFm  (18 dec)
        _allow(0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313); // GHSm  (18 dec)
        _allow(0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B); // PHPm  (18 dec)
        _allow(0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6); // ZARm  (18 dec)
    }

    function _allow(address token) private {
        allowedTokens[token] = true;
        emit TokenAllowlistUpdated(token, true);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "zero address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setTokenAllowlist(address token, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[token] = allowed;
        emit TokenAllowlistUpdated(token, allowed);
    }

    function setPassPrice(uint8 passType, address token, uint256 amount) external onlyRole(OPERATOR_ROLE) {
        require(_validPassType(passType), "invalid pass type");
        require(allowedTokens[token], "token not allowed");
        passPrices[passType][token] = amount;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ─── Campaign management ──────────────────────────────────────────────────

    function createCampaign(
        bytes32 campaignId,
        bytes32 metadataHash,
        uint64  startsAt,
        uint64  endsAt
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(campaigns[campaignId].startsAt == 0, "campaign exists");
        require(endsAt > startsAt, "invalid window");
        campaigns[campaignId] = Campaign({
            metadataHash: metadataHash,
            startsAt:     startsAt,
            endsAt:       endsAt,
            active:       true
        });
        emit CampaignCreated(campaignId, metadataHash, startsAt, endsAt);
    }

    function registerMatch(
        bytes32 campaignId,
        bytes32 matchId,
        bytes32 metadataHash,
        uint64  kickoffAt,
        uint64  lockedAt
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(campaigns[campaignId].active, "unknown campaign");
        require(lockedAt <= kickoffAt, "lock must precede kickoff");
        require(matches[matchId].kickoffAt == 0, "match exists");
        matches[matchId] = Match({
            campaignId:      campaignId,
            metadataHash:    metadataHash,
            kickoffAt:       kickoffAt,
            lockedAt:        lockedAt,
            resultSubmitted: false,
            homeScore:       0,
            awayScore:       0
        });
        emit MatchRegistered(campaignId, matchId, kickoffAt, lockedAt);
    }

    // ─── Commit-reveal prediction flow ────────────────────────────────────────

    /**
     * Phase 1 — commit.
     * predictionHash = keccak256(abi.encodePacked(msg.sender, campaignId, matchId, homeScore, awayScore, salt))
     * Call this before lockedAt. One commit per wallet per match.
     */
    function commitPrediction(
        bytes32 campaignId,
        bytes32 matchId,
        bytes32 predictionHash
    ) external whenNotPaused {
        Match storage m = matches[matchId];
        require(m.kickoffAt > 0, "unknown match");
        require(m.campaignId == campaignId, "match/campaign mismatch");
        require(block.timestamp < m.lockedAt, "predictions locked");
        require(!m.resultSubmitted, "result already submitted");

        PredictionCommit storage p = predictions[msg.sender][campaignId][matchId];
        require(p.committedAt == 0, "already committed");

        p.predictionHash = predictionHash;
        p.committedAt    = uint64(block.timestamp);

        emit PredictionCommitted(msg.sender, campaignId, matchId, predictionHash, uint64(block.timestamp));
    }

    /**
     * Phase 2 — reveal.
     * Call after lockedAt. Verifies the hash matches the committed one.
     */
    function revealPrediction(
        bytes32 campaignId,
        bytes32 matchId,
        uint8   homeScore,
        uint8   awayScore,
        bytes32 salt
    ) external whenNotPaused {
        Match storage m = matches[matchId];
        require(m.kickoffAt > 0, "unknown match");
        require(block.timestamp >= m.lockedAt, "reveal window not open");

        PredictionCommit storage p = predictions[msg.sender][campaignId][matchId];
        require(p.committedAt > 0, "no commit found");
        require(!p.revealed, "already revealed");

        bytes32 expected = keccak256(
            abi.encodePacked(msg.sender, campaignId, matchId, homeScore, awayScore, salt)
        );
        require(expected == p.predictionHash, "hash mismatch — scores or salt incorrect");

        p.homeScore  = homeScore;
        p.awayScore  = awayScore;
        p.revealed   = true;
        p.revealedAt = uint64(block.timestamp);

        emit PredictionRevealed(
            msg.sender, campaignId, matchId, homeScore, awayScore, uint64(block.timestamp)
        );
    }

    // ─── Result submission & points ───────────────────────────────────────────

    function submitOfficialResult(
        bytes32 campaignId,
        bytes32 matchId,
        uint8   homeScore,
        uint8   awayScore
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        Match storage m = matches[matchId];
        require(m.kickoffAt > 0, "unknown match");
        require(m.campaignId == campaignId, "mismatch");
        require(!m.resultSubmitted, "already submitted");
        require(block.timestamp >= m.kickoffAt, "match not started");

        m.resultSubmitted = true;
        m.homeScore       = homeScore;
        m.awayScore       = awayScore;

        emit ResultSubmitted(campaignId, matchId, homeScore, awayScore);
    }

    function recordPoints(
        bytes32 campaignId,
        bytes32 matchId,
        address wallet,
        uint32  pts
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        require(matches[matchId].resultSubmitted, "result not submitted");
        points[wallet][campaignId][matchId] = pts;
        emit PointsRecorded(wallet, campaignId, matchId, pts);
    }

    // ─── Coach Pass ───────────────────────────────────────────────────────────

    /**
     * Purchase a Coach Pass. Transfers exactly `passPrices[passType][token]` to treasury.
     * Coach Pass unlocks analytics/UX features only.
     * It DOES NOT affect prediction points, ranking, or promotional reward eligibility.
     */
    function purchaseCoachPass(
        uint8   passType,
        address token,
        uint256 maxAmount // caller's approved allowance guard (slippage protection)
    ) external nonReentrant whenNotPaused {
        require(_validPassType(passType), "invalid pass type");
        require(allowedTokens[token], "token not allowed");

        uint256 price = passPrices[passType][token];
        require(price > 0, "price not set for this token");
        require(maxAmount >= price, "maxAmount < price");

        // Pull exactly `price` — CIP-64 fee abstraction happens outside this call
        IERC20(token).safeTransferFrom(msg.sender, treasury, price);

        uint64 duration = _passDuration(passType);
        uint64 start    = uint64(block.timestamp);
        uint64 expires  = start + duration;

        // Extend if an active pass exists (stack on top)
        CoachPassEntry storage existing = coachPasses[msg.sender];
        if (existing.expiresAt > start) {
            expires = existing.expiresAt + duration;
            start   = existing.expiresAt;
        }

        coachPasses[msg.sender] = CoachPassEntry({
            passType:  passType,
            token:     token,
            amount:    price,
            startsAt:  start,
            expiresAt: expires
        });

        emit CoachPassPurchased(msg.sender, passType, token, price, expires);
    }

    function hasActiveCoachPass(address wallet) external view returns (bool) {
        return coachPasses[wallet].expiresAt > block.timestamp;
    }

    // ─── Promotional reward claim ─────────────────────────────────────────────

    /**
     * Operator-signed promotional reward claim.
     * Rewards are operator-funded (not user-funded). Not a betting payout.
     * signature = ECDSA(keccak256(wallet, campaignId, token, amount)) by OPERATOR_ROLE signer.
     */
    function claimPromotionalReward(
        bytes32      campaignId,
        address      token,
        uint256      amount,
        bytes calldata operatorSignature
    ) external nonReentrant whenNotPaused {
        require(!rewardClaimed[msg.sender][campaignId], "already claimed");
        require(allowedTokens[token], "token not allowed");
        require(
            _verifyOperatorClaim(msg.sender, campaignId, token, amount, operatorSignature),
            "invalid operator signature"
        );

        rewardClaimed[msg.sender][campaignId] = true;
        IERC20(token).safeTransfer(msg.sender, amount);

        emit RewardClaimed(msg.sender, campaignId, amount, token);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function getPrediction(
        address wallet,
        bytes32 campaignId,
        bytes32 matchId
    ) external view returns (PredictionCommit memory) {
        return predictions[wallet][campaignId][matchId];
    }

    function getCoachPass(address wallet) external view returns (CoachPassEntry memory) {
        return coachPasses[wallet];
    }

    function getCampaign(bytes32 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function getMatch(bytes32 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _validPassType(uint8 t) internal pure returns (bool) {
        return t >= PASS_DAILY && t <= PASS_SEASON;
    }

    function _passDuration(uint8 passType) internal pure returns (uint64) {
        if (passType == PASS_DAILY)    return 1 days;
        if (passType == PASS_WEEKLY)   return 7 days;
        if (passType == PASS_CAMPAIGN) return 30 days;
        return 180 days; // PASS_SEASON
    }

    function _verifyOperatorClaim(
        address        wallet,
        bytes32        campaignId,
        address        token,
        uint256        amount,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 msgHash     = keccak256(abi.encodePacked(wallet, campaignId, token, amount));
        bytes32 ethHash     = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
        address signer      = _recoverSigner(ethHash, signature);
        return hasRole(OPERATOR_ROLE, signer);
    }

    function _recoverSigner(bytes32 hash, bytes calldata sig) internal pure returns (address) {
        require(sig.length == 65, "invalid sig length");
        bytes32 r;
        bytes32 s;
        uint8   v;
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "invalid v");
        address recovered = ecrecover(hash, v, r, s);
        require(recovered != address(0), "ecrecover failed");
        return recovered;
    }
}
