export const MANGOAL_LEDGER_ABI = [
    {
        "type":  "constructor",
        "inputs":  [
                       {
                           "name":  "admin",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "_treasury",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "DEFAULT_ADMIN_ROLE",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "DEFAULT_MAX_POINTS",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint32",
                            "internalType":  "uint32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "DOMAIN_SEPARATOR",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "MATCH_CANCELLED",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "MATCH_FINISHED",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "MATCH_LIVE",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "MATCH_POSTPONED",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "MATCH_SCHEDULED",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "MATCH_VOID",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "OPERATOR_ROLE",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "ORACLE_ROLE",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "OUTCOME_EXACT",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "OUTCOME_MISS",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "OUTCOME_NONE",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "OUTCOME_RESULT",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PASS_CAMPAIGN",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PASS_DAILY",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PASS_SEASON",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PASS_WEEKLY",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PICK_NONE",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PICK_SCORED",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PICK_SUBMITTED",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PICK_UPDATED",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "PICK_VOID",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "allowedTokens",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bool",
                            "internalType":  "bool"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "campaigns",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "metadataHash",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        },
                        {
                            "name":  "startsAt",
                            "type":  "uint64",
                            "internalType":  "uint64"
                        },
                        {
                            "name":  "endsAt",
                            "type":  "uint64",
                            "internalType":  "uint64"
                        },
                        {
                            "name":  "active",
                            "type":  "bool",
                            "internalType":  "bool"
                        },
                        {
                            "name":  "scoringMode",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "claimPromotionalReward",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "nonce",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "operatorSignature",
                           "type":  "bytes",
                           "internalType":  "bytes"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "coachPasses",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "passType",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        },
                        {
                            "name":  "token",
                            "type":  "address",
                            "internalType":  "address"
                        },
                        {
                            "name":  "amount",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        },
                        {
                            "name":  "startsAt",
                            "type":  "uint64",
                            "internalType":  "uint64"
                        },
                        {
                            "name":  "expiresAt",
                            "type":  "uint64",
                            "internalType":  "uint64"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "commitPrediction",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "predictionHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "contractVersion",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "string",
                            "internalType":  "string"
                        }
                    ],
        "stateMutability":  "pure"
    },
    {
        "type":  "function",
        "name":  "correctOfficialResult",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "reasonHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "createCampaign",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "startsAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "endsAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "createCampaignV2",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "startsAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "endsAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "scoringMode",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "fundRewardPool",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "getCampaign",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.Campaign",
                            "components":  [
                                               {
                                                   "name":  "metadataHash",
                                                   "type":  "bytes32",
                                                   "internalType":  "bytes32"
                                               },
                                               {
                                                   "name":  "startsAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "endsAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "active",
                                                   "type":  "bool",
                                                   "internalType":  "bool"
                                               },
                                               {
                                                   "name":  "scoringMode",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getCampaignPlayerAt",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "index",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "address",
                            "internalType":  "address"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getCampaignPlayerCount",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getCampaignPlayers",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "offset",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "limit",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "players",
                            "type":  "address[]",
                            "internalType":  "address[]"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getCoachPass",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.CoachPassEntry",
                            "components":  [
                                               {
                                                   "name":  "passType",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "token",
                                                   "type":  "address",
                                                   "internalType":  "address"
                                               },
                                               {
                                                   "name":  "amount",
                                                   "type":  "uint256",
                                                   "internalType":  "uint256"
                                               },
                                               {
                                                   "name":  "startsAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "expiresAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getCoachPassPurchase",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "index",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.CoachPassPurchase",
                            "components":  [
                                               {
                                                   "name":  "passType",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "token",
                                                   "type":  "address",
                                                   "internalType":  "address"
                                               },
                                               {
                                                   "name":  "amount",
                                                   "type":  "uint256",
                                                   "internalType":  "uint256"
                                               },
                                               {
                                                   "name":  "startsAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "expiresAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "purchasedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getCoachPassPurchaseCount",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getMatch",
        "inputs":  [
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.Match",
                            "components":  [
                                               {
                                                   "name":  "campaignId",
                                                   "type":  "bytes32",
                                                   "internalType":  "bytes32"
                                               },
                                               {
                                                   "name":  "metadataHash",
                                                   "type":  "bytes32",
                                                   "internalType":  "bytes32"
                                               },
                                               {
                                                   "name":  "kickoffAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "lockedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "status",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "resultSubmitted",
                                                   "type":  "bool",
                                                   "internalType":  "bool"
                                               },
                                               {
                                                   "name":  "homeScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "awayScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getPick",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.Pick",
                            "components":  [
                                               {
                                                   "name":  "homeScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "awayScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "status",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "points",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "submittedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "updatedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "version",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "outcomeCode",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "scored",
                                                   "type":  "bool",
                                                   "internalType":  "bool"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getPlayerCampaignStats",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.PlayerCampaignStats",
                            "components":  [
                                               {
                                                   "name":  "totalPoints",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "picksSubmitted",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "exactHits",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "resultHits",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "lastPickAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "lastScoredAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getPrediction",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.PredictionCommit",
                            "components":  [
                                               {
                                                   "name":  "predictionHash",
                                                   "type":  "bytes32",
                                                   "internalType":  "bytes32"
                                               },
                                               {
                                                   "name":  "committedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "revealedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "homeScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "awayScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "revealed",
                                                   "type":  "bool",
                                                   "internalType":  "bool"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getRoleAdmin",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getUserPickAt",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "index",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "matchId",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        },
                        {
                            "name":  "pick",
                            "type":  "tuple",
                            "internalType":  "struct MangooalLedger.Pick",
                            "components":  [
                                               {
                                                   "name":  "homeScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "awayScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "status",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "points",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "submittedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "updatedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "version",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "outcomeCode",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "scored",
                                                   "type":  "bool",
                                                   "internalType":  "bool"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getUserPickCount",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getUserPicks",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "offset",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "limit",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "matchIds",
                            "type":  "bytes32[]",
                            "internalType":  "bytes32[]"
                        },
                        {
                            "name":  "pickList",
                            "type":  "tuple[]",
                            "internalType":  "struct MangooalLedger.Pick[]",
                            "components":  [
                                               {
                                                   "name":  "homeScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "awayScore",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "status",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "points",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "submittedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "updatedAt",
                                                   "type":  "uint64",
                                                   "internalType":  "uint64"
                                               },
                                               {
                                                   "name":  "version",
                                                   "type":  "uint32",
                                                   "internalType":  "uint32"
                                               },
                                               {
                                                   "name":  "outcomeCode",
                                                   "type":  "uint8",
                                                   "internalType":  "uint8"
                                               },
                                               {
                                                   "name":  "scored",
                                                   "type":  "bool",
                                                   "internalType":  "bool"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "grantRole",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "account",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "hasActiveCoachPass",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bool",
                            "internalType":  "bool"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "hasRole",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "account",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bool",
                            "internalType":  "bool"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "matches",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "campaignId",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        },
                        {
                            "name":  "metadataHash",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        },
                        {
                            "name":  "kickoffAt",
                            "type":  "uint64",
                            "internalType":  "uint64"
                        },
                        {
                            "name":  "lockedAt",
                            "type":  "uint64",
                            "internalType":  "uint64"
                        },
                        {
                            "name":  "status",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        },
                        {
                            "name":  "resultSubmitted",
                            "type":  "bool",
                            "internalType":  "bool"
                        },
                        {
                            "name":  "homeScore",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        },
                        {
                            "name":  "awayScore",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "maxPickScore",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint8",
                            "internalType":  "uint8"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "maxPoints",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint32",
                            "internalType":  "uint32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "passPrices",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "pause",
        "inputs":  [

                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "paused",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bool",
                            "internalType":  "bool"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "points",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint32",
                            "internalType":  "uint32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "purchaseCoachPass",
        "inputs":  [
                       {
                           "name":  "passType",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "maxAmount",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "recordPoints",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "pts",
                           "type":  "uint32",
                           "internalType":  "uint32"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "recordPointsBatch",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "wallets",
                           "type":  "address[]",
                           "internalType":  "address[]"
                       },
                       {
                           "name":  "ptsList",
                           "type":  "uint32[]",
                           "internalType":  "uint32[]"
                       },
                       {
                           "name":  "outcomeCodes",
                           "type":  "uint8[]",
                           "internalType":  "uint8[]"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "recordPointsWithOutcome",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "pts",
                           "type":  "uint32",
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "outcomeCode",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "registerMatch",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "kickoffAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "lockedAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "renounceRole",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "callerConfirmation",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "rescueERC20",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "to",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "revealPrediction",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "salt",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "revokeRole",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "account",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "rewardClaimed",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bool",
                            "internalType":  "bool"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "rewardNonces",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "rewardPoolBalance",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "setCampaignStatus",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "active",
                           "type":  "bool",
                           "internalType":  "bool"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setMatchStatus",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "status",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setMaxPickScore",
        "inputs":  [
                       {
                           "name":  "_maxPickScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setMaxPoints",
        "inputs":  [
                       {
                           "name":  "_maxPoints",
                           "type":  "uint32",
                           "internalType":  "uint32"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setPassPrice",
        "inputs":  [
                       {
                           "name":  "passType",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setTokenAllowlist",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "allowed",
                           "type":  "bool",
                           "internalType":  "bool"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setTreasury",
        "inputs":  [
                       {
                           "name":  "_treasury",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "submitOfficialResult",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "submitOrUpdatePick",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "supportsInterface",
        "inputs":  [
                       {
                           "name":  "interfaceId",
                           "type":  "bytes4",
                           "internalType":  "bytes4"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bool",
                            "internalType":  "bool"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "treasury",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "address",
                            "internalType":  "address"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "unpause",
        "inputs":  [

                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "updateCampaign",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "startsAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "endsAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "scoringMode",
                           "type":  "uint8",
                           "internalType":  "uint8"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "updateMatch",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "kickoffAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "lockedAt",
                           "type":  "uint64",
                           "internalType":  "uint64"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "voidPick",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "event",
        "name":  "CampaignCreated",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "indexed":  false,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "startsAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "endsAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "CampaignStatusChanged",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "active",
                           "type":  "bool",
                           "indexed":  false,
                           "internalType":  "bool"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "CampaignUpdated",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "indexed":  false,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "startsAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "endsAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "scoringMode",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "CoachPassPurchased",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "passType",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "token",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "startsAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "expiresAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "purchaseIndex",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "ERC20Rescued",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "to",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "MatchRegistered",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "kickoffAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "lockedAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "MatchStatusChanged",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "status",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "MatchUpdated",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "metadataHash",
                           "type":  "bytes32",
                           "indexed":  false,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "kickoffAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       },
                       {
                           "name":  "lockedAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "MaxPickScoreUpdated",
        "inputs":  [
                       {
                           "name":  "maxPickScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "MaxPointsUpdated",
        "inputs":  [
                       {
                           "name":  "maxPoints",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PassPriceUpdated",
        "inputs":  [
                       {
                           "name":  "passType",
                           "type":  "uint8",
                           "indexed":  true,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "token",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "Paused",
        "inputs":  [
                       {
                           "name":  "account",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PickScored",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "previousPoints",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "points",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "outcomeCode",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PickSubmitted",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "version",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "submittedAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PickUpdated",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "version",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "updatedAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PickVoided",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PlayerCampaignStatsUpdated",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "totalPoints",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "picksSubmitted",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "exactHits",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       },
                       {
                           "name":  "resultHits",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PointsRecorded",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "pts",
                           "type":  "uint32",
                           "indexed":  false,
                           "internalType":  "uint32"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PredictionCommitted",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "predictionHash",
                           "type":  "bytes32",
                           "indexed":  false,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "committedAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "PredictionRevealed",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "revealedAt",
                           "type":  "uint64",
                           "indexed":  false,
                           "internalType":  "uint64"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "ResultCorrected",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "reasonHash",
                           "type":  "bytes32",
                           "indexed":  false,
                           "internalType":  "bytes32"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "ResultSubmitted",
        "inputs":  [
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "matchId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "homeScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       },
                       {
                           "name":  "awayScore",
                           "type":  "uint8",
                           "indexed":  false,
                           "internalType":  "uint8"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "RewardClaimed",
        "inputs":  [
                       {
                           "name":  "wallet",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "campaignId",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "token",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "RewardPoolFunded",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "funder",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "RoleAdminChanged",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "previousAdminRole",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "newAdminRole",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "RoleGranted",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "account",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "sender",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "RoleRevoked",
        "inputs":  [
                       {
                           "name":  "role",
                           "type":  "bytes32",
                           "indexed":  true,
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "account",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "sender",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "TokenAllowlistUpdated",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "allowed",
                           "type":  "bool",
                           "indexed":  false,
                           "internalType":  "bool"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "TreasuryUpdated",
        "inputs":  [
                       {
                           "name":  "treasury",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "Unpaused",
        "inputs":  [
                       {
                           "name":  "account",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "error",
        "name":  "AccessControlBadConfirmation",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "AccessControlUnauthorizedAccount",
        "inputs":  [
                       {
                           "name":  "account",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "neededRole",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "ECDSAInvalidSignature",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "ECDSAInvalidSignatureLength",
        "inputs":  [
                       {
                           "name":  "length",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "ECDSAInvalidSignatureS",
        "inputs":  [
                       {
                           "name":  "s",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "EnforcedPause",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "ExpectedPause",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "ReentrancyGuardReentrantCall",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "SafeERC20FailedOperation",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ]
    }
] as const;
