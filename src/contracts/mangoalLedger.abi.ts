export const MANGOAL_LEDGER_ABI = [
  // ── Events ──────────────────────────────────────────────────────────────
  {
    type: "event",
    name: "PredictionCommitted",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "campaignId", type: "bytes32", indexed: true },
      { name: "matchId", type: "bytes32", indexed: true },
      { name: "predictionHash", type: "bytes32", indexed: false },
      { name: "committedAt", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PredictionRevealed",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "campaignId", type: "bytes32", indexed: true },
      { name: "matchId", type: "bytes32", indexed: true },
      { name: "homeScore", type: "uint8", indexed: false },
      { name: "awayScore", type: "uint8", indexed: false },
      { name: "revealedAt", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CoachPassPurchased",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "passType", type: "uint8", indexed: false },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "expiresAt", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RewardClaimed",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "campaignId", type: "bytes32", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "token", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PointsRecorded",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "campaignId", type: "bytes32", indexed: true },
      { name: "matchId", type: "bytes32", indexed: true },
      { name: "pts", type: "uint32", indexed: false },
    ],
  },
  // ── Write functions ──────────────────────────────────────────────────────
  {
    type: "function",
    name: "commitPrediction",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "bytes32" },
      { name: "matchId", type: "bytes32" },
      { name: "predictionHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revealPrediction",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "bytes32" },
      { name: "matchId", type: "bytes32" },
      { name: "homeScore", type: "uint8" },
      { name: "awayScore", type: "uint8" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "purchaseCoachPass",
    stateMutability: "nonpayable",
    inputs: [
      { name: "passType", type: "uint8" },
      { name: "token", type: "address" },
      { name: "maxAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimPromotionalReward",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "bytes32" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "operatorSignature", type: "bytes" },
    ],
    outputs: [],
  },
  // ── View functions ───────────────────────────────────────────────────────
  {
    type: "function",
    name: "hasActiveCoachPass",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getCoachPass",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "passType", type: "uint8" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "startsAt", type: "uint64" },
          { name: "expiresAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getPrediction",
    stateMutability: "view",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "campaignId", type: "bytes32" },
      { name: "matchId", type: "bytes32" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "predictionHash", type: "bytes32" },
          { name: "committedAt", type: "uint64" },
          { name: "revealedAt", type: "uint64" },
          { name: "homeScore", type: "uint8" },
          { name: "awayScore", type: "uint8" },
          { name: "revealed", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getMatch",
    stateMutability: "view",
    inputs: [{ name: "matchId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "campaignId", type: "bytes32" },
          { name: "metadataHash", type: "bytes32" },
          { name: "kickoffAt", type: "uint64" },
          { name: "lockedAt", type: "uint64" },
          { name: "resultSubmitted", type: "bool" },
          { name: "homeScore", type: "uint8" },
          { name: "awayScore", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getCampaign",
    stateMutability: "view",
    inputs: [{ name: "campaignId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "metadataHash", type: "bytes32" },
          { name: "startsAt", type: "uint64" },
          { name: "endsAt", type: "uint64" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "passPrices",
    stateMutability: "view",
    inputs: [
      { name: "passType", type: "uint8" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allowedTokens",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "rewardClaimed",
    stateMutability: "view",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "campaignId", type: "bytes32" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "treasury",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;
