// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * MangooalLedger - on-chain source of truth for Mangooal.
 * Celo Mainnet target: chainId 42220.
 *
 * This contract is intentionally not a betting contract:
 * - Picks are free to submit and update before lock.
 * - No odds, staking, pooled entry fees, or winner-takes-all mechanics.
 * - Coach Pass unlocks match context only and never changes points or ranking.
 * - Promotional rewards, if enabled, are operator-funded and not user-funded.
 */
contract MangooalLedger is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    uint8 public constant PASS_DAILY = 1;
    uint8 public constant PASS_WEEKLY = 2;
    uint8 public constant PASS_CAMPAIGN = 3;
    uint8 public constant PASS_SEASON = 4;

    uint8 public constant MATCH_SCHEDULED = 0;
    uint8 public constant MATCH_LIVE = 1;
    uint8 public constant MATCH_FINISHED = 2;
    uint8 public constant MATCH_CANCELLED = 3;
    uint8 public constant MATCH_POSTPONED = 4;
    uint8 public constant MATCH_VOID = 5;

    uint8 public constant PICK_NONE = 0;
    uint8 public constant PICK_SUBMITTED = 1;
    uint8 public constant PICK_UPDATED = 2;
    uint8 public constant PICK_SCORED = 3;
    uint8 public constant PICK_VOID = 4;

    uint8 public constant OUTCOME_NONE = 0;
    uint8 public constant OUTCOME_EXACT = 1;
    uint8 public constant OUTCOME_RESULT = 2;
    uint8 public constant OUTCOME_MISS = 3;

    uint32 public constant DEFAULT_MAX_POINTS = 100;

    struct Campaign {
        bytes32 metadataHash;
        uint64 startsAt;
        uint64 endsAt;
        bool active;
        uint8 scoringMode;
    }

    struct Match {
        bytes32 campaignId;
        bytes32 metadataHash;
        uint64 kickoffAt;
        uint64 lockedAt;
        uint8 status;
        bool resultSubmitted;
        uint8 homeScore;
        uint8 awayScore;
    }

    struct Pick {
        uint8 homeScore;
        uint8 awayScore;
        uint8 status;
        uint32 points;
        uint64 submittedAt;
        uint64 updatedAt;
        uint32 version;
        uint8 outcomeCode;
        bool scored;
    }

    struct PredictionCommit {
        bytes32 predictionHash;
        uint64 committedAt;
        uint64 revealedAt;
        uint8 homeScore;
        uint8 awayScore;
        bool revealed;
    }

    struct PlayerCampaignStats {
        uint32 totalPoints;
        uint32 picksSubmitted;
        uint32 exactHits;
        uint32 resultHits;
        uint64 lastPickAt;
        uint64 lastScoredAt;
    }

    struct CoachPassEntry {
        uint8 passType;
        address token;
        uint256 amount;
        uint64 startsAt;
        uint64 expiresAt;
    }

    struct CoachPassPurchase {
        uint8 passType;
        address token;
        uint256 amount;
        uint64 startsAt;
        uint64 expiresAt;
        uint64 purchasedAt;
    }

    mapping(bytes32 => Campaign) public campaigns;
    mapping(bytes32 => Match) public matches;

    mapping(address => mapping(bytes32 => mapping(bytes32 => Pick))) private picks;
    mapping(address => mapping(bytes32 => bytes32[])) private userPickIds;
    mapping(address => mapping(bytes32 => mapping(bytes32 => bool))) private userPickIndexed;

    mapping(bytes32 => address[]) private campaignPlayers;
    mapping(bytes32 => mapping(address => bool)) private campaignPlayerIndexed;
    mapping(address => mapping(bytes32 => PlayerCampaignStats)) private playerCampaignStats;

    mapping(address => mapping(bytes32 => mapping(bytes32 => PredictionCommit))) private legacyPredictions;
    mapping(address => mapping(bytes32 => mapping(bytes32 => uint32))) public points;

    mapping(address => CoachPassEntry) public coachPasses;
    mapping(address => CoachPassPurchase[]) private coachPassPurchaseHistory;

    mapping(address => mapping(bytes32 => bool)) public rewardClaimed;
    mapping(address => uint256) public rewardNonces;

    mapping(address => bool) public allowedTokens;
    mapping(uint8 => mapping(address => uint256)) public passPrices;

    address public treasury;
    uint8 public maxPickScore = 20;
    uint32 public maxPoints = DEFAULT_MAX_POINTS;

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 private constant CLAIM_TYPEHASH =
        keccak256("Claim(address wallet,bytes32 campaignId,address token,uint256 amount,uint256 nonce)");

    event CampaignCreated(bytes32 indexed campaignId, bytes32 metadataHash, uint64 startsAt, uint64 endsAt);
    event CampaignUpdated(
        bytes32 indexed campaignId, bytes32 metadataHash, uint64 startsAt, uint64 endsAt, uint8 scoringMode
    );
    event CampaignStatusChanged(bytes32 indexed campaignId, bool active);
    event MatchRegistered(bytes32 indexed campaignId, bytes32 indexed matchId, uint64 kickoffAt, uint64 lockedAt);
    event MatchUpdated(
        bytes32 indexed campaignId, bytes32 indexed matchId, bytes32 metadataHash, uint64 kickoffAt, uint64 lockedAt
    );
    event MatchStatusChanged(bytes32 indexed campaignId, bytes32 indexed matchId, uint8 status);
    event PickSubmitted(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint8 homeScore,
        uint8 awayScore,
        uint32 version,
        uint64 submittedAt
    );
    event PickUpdated(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint8 homeScore,
        uint8 awayScore,
        uint32 version,
        uint64 updatedAt
    );
    event PickScored(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint32 previousPoints,
        uint32 points,
        uint8 outcomeCode
    );
    event PickVoided(address indexed wallet, bytes32 indexed campaignId, bytes32 indexed matchId);
    event PlayerCampaignStatsUpdated(
        address indexed wallet,
        bytes32 indexed campaignId,
        uint32 totalPoints,
        uint32 picksSubmitted,
        uint32 exactHits,
        uint32 resultHits
    );
    event PredictionCommitted(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        bytes32 predictionHash,
        uint64 committedAt
    );
    event PredictionRevealed(
        address indexed wallet,
        bytes32 indexed campaignId,
        bytes32 indexed matchId,
        uint8 homeScore,
        uint8 awayScore,
        uint64 revealedAt
    );
    event ResultSubmitted(bytes32 indexed campaignId, bytes32 indexed matchId, uint8 homeScore, uint8 awayScore);
    event ResultCorrected(
        bytes32 indexed campaignId, bytes32 indexed matchId, uint8 homeScore, uint8 awayScore, bytes32 reasonHash
    );
    event PointsRecorded(address indexed wallet, bytes32 indexed campaignId, bytes32 indexed matchId, uint32 pts);
    event CoachPassPurchased(
        address indexed wallet,
        uint8 passType,
        address token,
        uint256 amount,
        uint64 startsAt,
        uint64 expiresAt,
        uint256 purchaseIndex
    );
    event RewardClaimed(address indexed wallet, bytes32 indexed campaignId, uint256 amount, address token);
    event TokenAllowlistUpdated(address indexed token, bool allowed);
    event TreasuryUpdated(address indexed treasury);
    event PassPriceUpdated(uint8 indexed passType, address indexed token, uint256 amount);
    event MaxPickScoreUpdated(uint8 maxPickScore);
    event MaxPointsUpdated(uint32 maxPoints);
    event RewardPoolFunded(address indexed token, uint256 amount, address indexed funder);
    event ERC20Rescued(address indexed token, address indexed to, uint256 amount);

    constructor(address admin, address _treasury) {
        require(admin != address(0), "zero admin");
        require(_treasury != address(0), "zero treasury");
        require(_treasury != address(this), "treasury is self");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        _grantRole(ORACLE_ROLE, admin);
        treasury = _treasury;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("MangooalLedger"),
                keccak256("2"),
                block.chainid,
                address(this)
            )
        );

        _allow(0x765DE816845861e75A25fCA122bb6898B8B1282a); // USDm
        _allow(0xcebA9300f2b948710d2653dD7B07f33A8B32118C); // USDC
        _allow(0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e); // USDT
        _allow(0x8A567e2aE79CA692Bd748aB832081C45de4041eA); // COPm
        _allow(0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73); // EURm
        _allow(0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787); // BRLm
        _allow(0x456a3D042C0DbD3db53D5489e98dFb038553B0d0); // KESm
        _allow(0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71); // NGNm
        _allow(0x73F93dcc49cB8A239e2032663e9475dd5ef29A08); // XOFm
        _allow(0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313); // GHSm
        _allow(0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B); // PHPm
        _allow(0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6); // ZARm
    }

    function contractVersion() external pure returns (string memory) {
        return "2.0.0";
    }

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "zero address");
        require(_treasury != address(this), "treasury is self");
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
        emit PassPriceUpdated(passType, token, amount);
    }

    function setMaxPickScore(uint8 _maxPickScore) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_maxPickScore > 0, "zero max score");
        maxPickScore = _maxPickScore;
        emit MaxPickScoreUpdated(_maxPickScore);
    }

    function setMaxPoints(uint32 _maxPoints) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_maxPoints > 0, "zero max points");
        maxPoints = _maxPoints;
        emit MaxPointsUpdated(_maxPoints);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function fundRewardPool(address token, uint256 amount) external {
        require(allowedTokens[token], "token not allowed");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit RewardPoolFunded(token, amount, msg.sender);
    }

    function rewardPoolBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function rescueERC20(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "zero address");
        IERC20(token).safeTransfer(to, amount);
        emit ERC20Rescued(token, to, amount);
    }

    function createCampaign(bytes32 campaignId, bytes32 metadataHash, uint64 startsAt, uint64 endsAt)
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
    {
        _createCampaign(campaignId, metadataHash, startsAt, endsAt, 0);
    }

    function createCampaignV2(
        bytes32 campaignId,
        bytes32 metadataHash,
        uint64 startsAt,
        uint64 endsAt,
        uint8 scoringMode
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        _createCampaign(campaignId, metadataHash, startsAt, endsAt, scoringMode);
    }

    function updateCampaign(bytes32 campaignId, bytes32 metadataHash, uint64 startsAt, uint64 endsAt, uint8 scoringMode)
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
    {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.metadataHash != bytes32(0), "unknown campaign");
        require(endsAt > startsAt, "invalid window");
        campaign.metadataHash = metadataHash;
        campaign.startsAt = startsAt;
        campaign.endsAt = endsAt;
        campaign.scoringMode = scoringMode;
        emit CampaignUpdated(campaignId, metadataHash, startsAt, endsAt, scoringMode);
    }

    function setCampaignStatus(bytes32 campaignId, bool active) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.metadataHash != bytes32(0), "unknown campaign");
        campaign.active = active;
        emit CampaignStatusChanged(campaignId, active);
    }

    function registerMatch(bytes32 campaignId, bytes32 matchId, bytes32 metadataHash, uint64 kickoffAt, uint64 lockedAt)
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
    {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.active, "unknown campaign");
        require(lockedAt <= kickoffAt, "lock must precede kickoff");
        require(matches[matchId].metadataHash == bytes32(0), "match exists");
        matches[matchId] = Match({
            campaignId: campaignId,
            metadataHash: metadataHash,
            kickoffAt: kickoffAt,
            lockedAt: lockedAt,
            status: MATCH_SCHEDULED,
            resultSubmitted: false,
            homeScore: 0,
            awayScore: 0
        });
        emit MatchRegistered(campaignId, matchId, kickoffAt, lockedAt);
    }

    function updateMatch(bytes32 campaignId, bytes32 matchId, bytes32 metadataHash, uint64 kickoffAt, uint64 lockedAt)
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
    {
        Match storage m = matches[matchId];
        require(m.metadataHash != bytes32(0), "unknown match");
        require(m.campaignId == campaignId, "match/campaign mismatch");
        require(!m.resultSubmitted, "result submitted");
        require(block.timestamp < m.lockedAt, "match locked");
        require(lockedAt <= kickoffAt, "lock must precede kickoff");
        m.metadataHash = metadataHash;
        m.kickoffAt = kickoffAt;
        m.lockedAt = lockedAt;
        emit MatchUpdated(campaignId, matchId, metadataHash, kickoffAt, lockedAt);
    }

    function setMatchStatus(bytes32 campaignId, bytes32 matchId, uint8 status)
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
    {
        Match storage m = matches[matchId];
        require(m.metadataHash != bytes32(0), "unknown match");
        require(m.campaignId == campaignId, "match/campaign mismatch");
        require(status <= MATCH_VOID, "invalid status");
        m.status = status;
        emit MatchStatusChanged(campaignId, matchId, status);
    }

    function submitOrUpdatePick(bytes32 campaignId, bytes32 matchId, uint8 homeScore, uint8 awayScore)
        external
        whenNotPaused
    {
        require(homeScore <= maxPickScore && awayScore <= maxPickScore, "score exceeds max");
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.active, "inactive campaign");
        Match storage m = matches[matchId];
        require(m.metadataHash != bytes32(0), "unknown match");
        require(m.campaignId == campaignId, "match/campaign mismatch");
        require(block.timestamp < m.lockedAt, "predictions locked");
        require(m.status == MATCH_SCHEDULED, "match not open");
        require(!m.resultSubmitted, "result already submitted");

        Pick storage pick = picks[msg.sender][campaignId][matchId];
        uint64 nowTs = uint64(block.timestamp);

        if (pick.submittedAt == 0) {
            pick.submittedAt = nowTs;
            pick.status = PICK_SUBMITTED;
            pick.version = 1;
            playerCampaignStats[msg.sender][campaignId].picksSubmitted += 1;
            _indexUserPick(msg.sender, campaignId, matchId);
            _indexCampaignPlayer(campaignId, msg.sender);
            emit PickSubmitted(msg.sender, campaignId, matchId, homeScore, awayScore, pick.version, nowTs);
        } else {
            require(!pick.scored, "pick already scored");
            pick.status = PICK_UPDATED;
            pick.version += 1;
            emit PickUpdated(msg.sender, campaignId, matchId, homeScore, awayScore, pick.version, nowTs);
        }

        pick.homeScore = homeScore;
        pick.awayScore = awayScore;
        pick.updatedAt = nowTs;
        playerCampaignStats[msg.sender][campaignId].lastPickAt = nowTs;
    }

    function commitPrediction(bytes32 campaignId, bytes32 matchId, bytes32 predictionHash) external whenNotPaused {
        Match storage m = matches[matchId];
        require(m.metadataHash != bytes32(0), "unknown match");
        require(m.campaignId == campaignId, "match/campaign mismatch");
        require(block.timestamp < m.lockedAt, "predictions locked");
        require(!m.resultSubmitted, "result already submitted");

        PredictionCommit storage p = legacyPredictions[msg.sender][campaignId][matchId];
        require(p.committedAt == 0, "already committed");
        p.predictionHash = predictionHash;
        p.committedAt = uint64(block.timestamp);
        _indexCampaignPlayer(campaignId, msg.sender);
        emit PredictionCommitted(msg.sender, campaignId, matchId, predictionHash, uint64(block.timestamp));
    }

    function revealPrediction(bytes32 campaignId, bytes32 matchId, uint8 homeScore, uint8 awayScore, bytes32 salt)
        external
        whenNotPaused
    {
        require(homeScore <= maxPickScore && awayScore <= maxPickScore, "score exceeds max");
        Match storage m = matches[matchId];
        require(m.metadataHash != bytes32(0), "unknown match");
        require(m.campaignId == campaignId, "match/campaign mismatch");
        require(block.timestamp >= m.lockedAt, "reveal window not open");
        require(!m.resultSubmitted, "result already submitted");

        PredictionCommit storage p = legacyPredictions[msg.sender][campaignId][matchId];
        require(p.committedAt > 0, "no commit found");
        require(!p.revealed, "already revealed");

        bytes32 expected = keccak256(abi.encodePacked(msg.sender, campaignId, matchId, homeScore, awayScore, salt));
        require(expected == p.predictionHash, "hash mismatch");

        p.homeScore = homeScore;
        p.awayScore = awayScore;
        p.revealed = true;
        p.revealedAt = uint64(block.timestamp);

        Pick storage pick = picks[msg.sender][campaignId][matchId];
        if (pick.submittedAt == 0) {
            pick.homeScore = homeScore;
            pick.awayScore = awayScore;
            pick.status = PICK_SUBMITTED;
            pick.submittedAt = p.committedAt;
            pick.updatedAt = p.revealedAt;
            pick.version = 1;
            playerCampaignStats[msg.sender][campaignId].picksSubmitted += 1;
            playerCampaignStats[msg.sender][campaignId].lastPickAt = p.committedAt;
            _indexUserPick(msg.sender, campaignId, matchId);
            _indexCampaignPlayer(campaignId, msg.sender);
        }

        emit PredictionRevealed(msg.sender, campaignId, matchId, homeScore, awayScore, p.revealedAt);
    }

    function submitOfficialResult(bytes32 campaignId, bytes32 matchId, uint8 homeScore, uint8 awayScore)
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        Match storage m = matches[matchId];
        require(m.metadataHash != bytes32(0), "unknown match");
        require(m.campaignId == campaignId, "mismatch");
        require(!m.resultSubmitted, "already submitted");
        require(block.timestamp >= m.kickoffAt, "match not started");
        _setResult(m, campaignId, matchId, homeScore, awayScore);
        emit ResultSubmitted(campaignId, matchId, homeScore, awayScore);
    }

    function correctOfficialResult(
        bytes32 campaignId,
        bytes32 matchId,
        uint8 homeScore,
        uint8 awayScore,
        bytes32 reasonHash
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        Match storage m = matches[matchId];
        require(m.metadataHash != bytes32(0), "unknown match");
        require(m.campaignId == campaignId, "mismatch");
        require(m.resultSubmitted, "result not submitted");
        _setResult(m, campaignId, matchId, homeScore, awayScore);
        emit ResultCorrected(campaignId, matchId, homeScore, awayScore, reasonHash);
    }

    function recordPoints(bytes32 campaignId, bytes32 matchId, address wallet, uint32 pts)
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        _recordPoints(campaignId, matchId, wallet, pts, OUTCOME_NONE);
    }

    function recordPointsWithOutcome(bytes32 campaignId, bytes32 matchId, address wallet, uint32 pts, uint8 outcomeCode)
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        _recordPoints(campaignId, matchId, wallet, pts, outcomeCode);
    }

    function recordPointsBatch(
        bytes32 campaignId,
        bytes32 matchId,
        address[] calldata wallets,
        uint32[] calldata ptsList,
        uint8[] calldata outcomeCodes
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        require(wallets.length == ptsList.length, "array length mismatch");
        require(outcomeCodes.length == 0 || outcomeCodes.length == wallets.length, "outcome length mismatch");
        for (uint256 i = 0; i < wallets.length; i++) {
            uint8 outcomeCode = outcomeCodes.length == 0 ? OUTCOME_NONE : outcomeCodes[i];
            _recordPoints(campaignId, matchId, wallets[i], ptsList[i], outcomeCode);
        }
    }

    function voidPick(bytes32 campaignId, bytes32 matchId, address wallet)
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        Pick storage pick = picks[wallet][campaignId][matchId];
        require(pick.submittedAt > 0, "no pick");
        if (pick.scored) {
            _reverseScore(wallet, campaignId, pick);
            points[wallet][campaignId][matchId] = 0;
        }
        pick.status = PICK_VOID;
        pick.scored = false;
        pick.points = 0;
        pick.outcomeCode = OUTCOME_NONE;
        emit PickVoided(wallet, campaignId, matchId);
    }

    function purchaseCoachPass(uint8 passType, address token, uint256 maxAmount) external nonReentrant whenNotPaused {
        require(_validPassType(passType), "invalid pass type");
        require(allowedTokens[token], "token not allowed");
        uint256 price = passPrices[passType][token];
        require(price > 0, "price not set");
        require(maxAmount >= price, "maxAmount < price");

        IERC20(token).safeTransferFrom(msg.sender, treasury, price);

        uint64 duration = _passDuration(passType);
        uint64 nowTs = uint64(block.timestamp);
        uint64 startsAt = nowTs;
        uint64 expiresAt = nowTs + duration;

        CoachPassEntry storage current = coachPasses[msg.sender];
        if (current.expiresAt > nowTs) {
            startsAt = current.expiresAt;
            expiresAt = current.expiresAt + duration;
        }

        coachPasses[msg.sender] =
            CoachPassEntry({passType: passType, token: token, amount: price, startsAt: startsAt, expiresAt: expiresAt});

        coachPassPurchaseHistory[msg.sender].push(
            CoachPassPurchase({
                passType: passType,
                token: token,
                amount: price,
                startsAt: startsAt,
                expiresAt: expiresAt,
                purchasedAt: nowTs
            })
        );

        emit CoachPassPurchased(
            msg.sender, passType, token, price, startsAt, expiresAt, coachPassPurchaseHistory[msg.sender].length - 1
        );
    }

    function hasActiveCoachPass(address wallet) external view returns (bool) {
        return coachPasses[wallet].expiresAt > block.timestamp;
    }

    function claimPromotionalReward(
        bytes32 campaignId,
        address token,
        uint256 amount,
        uint256 nonce,
        bytes calldata operatorSignature
    ) external nonReentrant whenNotPaused {
        require(!rewardClaimed[msg.sender][campaignId], "already claimed");
        require(allowedTokens[token], "token not allowed");
        require(amount > 0, "zero amount");
        require(nonce == rewardNonces[msg.sender], "invalid nonce");
        require(
            _verifyOperatorClaim(msg.sender, campaignId, token, amount, nonce, operatorSignature),
            "invalid operator signature"
        );

        rewardNonces[msg.sender]++;
        rewardClaimed[msg.sender][campaignId] = true;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, campaignId, amount, token);
    }

    function getPrediction(address wallet, bytes32 campaignId, bytes32 matchId)
        external
        view
        returns (PredictionCommit memory)
    {
        return legacyPredictions[wallet][campaignId][matchId];
    }

    function getPick(address wallet, bytes32 campaignId, bytes32 matchId) external view returns (Pick memory) {
        return picks[wallet][campaignId][matchId];
    }

    function getUserPickCount(address wallet, bytes32 campaignId) external view returns (uint256) {
        return userPickIds[wallet][campaignId].length;
    }

    function getUserPickAt(address wallet, bytes32 campaignId, uint256 index)
        external
        view
        returns (bytes32 matchId, Pick memory pick)
    {
        require(index < userPickIds[wallet][campaignId].length, "index out of bounds");
        matchId = userPickIds[wallet][campaignId][index];
        pick = picks[wallet][campaignId][matchId];
    }

    function getUserPicks(address wallet, bytes32 campaignId, uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory matchIds, Pick[] memory pickList)
    {
        bytes32[] storage ids = userPickIds[wallet][campaignId];
        if (offset >= ids.length) {
            return (new bytes32[](0), new Pick[](0));
        }
        uint256 end = offset + limit;
        if (end > ids.length) end = ids.length;
        uint256 size = end - offset;
        matchIds = new bytes32[](size);
        pickList = new Pick[](size);
        for (uint256 i = 0; i < size; i++) {
            bytes32 matchId = ids[offset + i];
            matchIds[i] = matchId;
            pickList[i] = picks[wallet][campaignId][matchId];
        }
    }

    function getPlayerCampaignStats(address wallet, bytes32 campaignId)
        external
        view
        returns (PlayerCampaignStats memory)
    {
        return playerCampaignStats[wallet][campaignId];
    }

    function getCampaignPlayerCount(bytes32 campaignId) external view returns (uint256) {
        return campaignPlayers[campaignId].length;
    }

    function getCampaignPlayerAt(bytes32 campaignId, uint256 index) external view returns (address) {
        require(index < campaignPlayers[campaignId].length, "index out of bounds");
        return campaignPlayers[campaignId][index];
    }

    function getCampaignPlayers(bytes32 campaignId, uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory players)
    {
        address[] storage storedPlayers = campaignPlayers[campaignId];
        if (offset >= storedPlayers.length) return new address[](0);
        uint256 end = offset + limit;
        if (end > storedPlayers.length) end = storedPlayers.length;
        uint256 size = end - offset;
        players = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            players[i] = storedPlayers[offset + i];
        }
    }

    function getCoachPass(address wallet) external view returns (CoachPassEntry memory) {
        return coachPasses[wallet];
    }

    function getCoachPassPurchaseCount(address wallet) external view returns (uint256) {
        return coachPassPurchaseHistory[wallet].length;
    }

    function getCoachPassPurchase(address wallet, uint256 index) external view returns (CoachPassPurchase memory) {
        require(index < coachPassPurchaseHistory[wallet].length, "index out of bounds");
        return coachPassPurchaseHistory[wallet][index];
    }

    function getCampaign(bytes32 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function getMatch(bytes32 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    function _createCampaign(
        bytes32 campaignId,
        bytes32 metadataHash,
        uint64 startsAt,
        uint64 endsAt,
        uint8 scoringMode
    ) internal {
        require(campaigns[campaignId].metadataHash == bytes32(0), "campaign exists");
        require(endsAt > startsAt, "invalid window");
        campaigns[campaignId] = Campaign({
            metadataHash: metadataHash, startsAt: startsAt, endsAt: endsAt, active: true, scoringMode: scoringMode
        });
        emit CampaignCreated(campaignId, metadataHash, startsAt, endsAt);
    }

    function _recordPoints(bytes32 campaignId, bytes32 matchId, address wallet, uint32 pts, uint8 outcomeCode)
        internal
    {
        Match storage m = matches[matchId];
        require(m.resultSubmitted, "result not submitted");
        require(m.campaignId == campaignId, "mismatch");
        require(pts <= maxPoints, "pts exceeds maximum");
        Pick storage pick = picks[wallet][campaignId][matchId];
        require(pick.submittedAt > 0, "pick not found");
        require(pick.status != PICK_VOID, "pick void");

        if (outcomeCode == OUTCOME_NONE) {
            outcomeCode = _resolveOutcomeCode(pick, m);
        }
        require(outcomeCode <= OUTCOME_MISS, "invalid outcome");

        uint32 previousPoints = pick.points;
        if (pick.scored) {
            _reverseScore(wallet, campaignId, pick);
        }

        PlayerCampaignStats storage stats = playerCampaignStats[wallet][campaignId];
        stats.totalPoints += pts;
        if (outcomeCode == OUTCOME_EXACT) stats.exactHits += 1;
        if (outcomeCode == OUTCOME_RESULT) stats.resultHits += 1;
        stats.lastScoredAt = uint64(block.timestamp);

        pick.points = pts;
        pick.scored = true;
        pick.status = PICK_SCORED;
        pick.outcomeCode = outcomeCode;
        points[wallet][campaignId][matchId] = pts;

        emit PickScored(wallet, campaignId, matchId, previousPoints, pts, outcomeCode);
        emit PointsRecorded(wallet, campaignId, matchId, pts);
        emit PlayerCampaignStatsUpdated(
            wallet, campaignId, stats.totalPoints, stats.picksSubmitted, stats.exactHits, stats.resultHits
        );
    }

    function _reverseScore(address wallet, bytes32 campaignId, Pick storage pick) internal {
        PlayerCampaignStats storage stats = playerCampaignStats[wallet][campaignId];
        if (stats.totalPoints >= pick.points) {
            stats.totalPoints -= pick.points;
        } else {
            stats.totalPoints = 0;
        }
        if (pick.outcomeCode == OUTCOME_EXACT && stats.exactHits > 0) stats.exactHits -= 1;
        if (pick.outcomeCode == OUTCOME_RESULT && stats.resultHits > 0) stats.resultHits -= 1;
    }

    function _setResult(Match storage m, bytes32 campaignId, bytes32 matchId, uint8 homeScore, uint8 awayScore)
        internal
    {
        require(homeScore <= maxPickScore && awayScore <= maxPickScore, "score exceeds max");
        m.resultSubmitted = true;
        m.homeScore = homeScore;
        m.awayScore = awayScore;
        m.status = MATCH_FINISHED;
        emit MatchStatusChanged(campaignId, matchId, MATCH_FINISHED);
    }

    function _resolveOutcomeCode(Pick storage pick, Match storage m) internal view returns (uint8) {
        if (pick.homeScore == m.homeScore && pick.awayScore == m.awayScore) return OUTCOME_EXACT;
        int8 pickDiff = int8(pick.homeScore) - int8(pick.awayScore);
        int8 resultDiff = int8(m.homeScore) - int8(m.awayScore);
        if ((pickDiff == 0 && resultDiff == 0) || (pickDiff > 0 && resultDiff > 0) || (pickDiff < 0 && resultDiff < 0))
        {
            return OUTCOME_RESULT;
        }
        return OUTCOME_MISS;
    }

    function _indexUserPick(address wallet, bytes32 campaignId, bytes32 matchId) internal {
        if (!userPickIndexed[wallet][campaignId][matchId]) {
            userPickIndexed[wallet][campaignId][matchId] = true;
            userPickIds[wallet][campaignId].push(matchId);
        }
    }

    function _indexCampaignPlayer(bytes32 campaignId, address wallet) internal {
        if (!campaignPlayerIndexed[campaignId][wallet]) {
            campaignPlayerIndexed[campaignId][wallet] = true;
            campaignPlayers[campaignId].push(wallet);
        }
    }

    function _allow(address token) private {
        allowedTokens[token] = true;
        emit TokenAllowlistUpdated(token, true);
    }

    function _validPassType(uint8 passType) internal pure returns (bool) {
        return passType >= PASS_DAILY && passType <= PASS_SEASON;
    }

    function _passDuration(uint8 passType) internal pure returns (uint64) {
        if (passType == PASS_DAILY) return 1 days;
        if (passType == PASS_WEEKLY) return 7 days;
        if (passType == PASS_CAMPAIGN) return 30 days;
        return 180 days;
    }

    function _verifyOperatorClaim(
        address wallet,
        bytes32 campaignId,
        address token,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 structHash = keccak256(abi.encode(CLAIM_TYPEHASH, wallet, campaignId, token, amount, nonce));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address signer = ECDSA.recover(digest, signature);
        return hasRole(OPERATOR_ROLE, signer);
    }
}
