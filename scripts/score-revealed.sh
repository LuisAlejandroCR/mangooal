#!/usr/bin/env bash
# score-revealed.sh — compute per-wallet points from on-chain PredictionRevealed events
#
# Usage:
#   LEDGER_ADDRESS=0x...  MATCH_SLUG=cop26-col-bra  HOME_SCORE=2  AWAY_SCORE=1 \
#   bash scripts/score-revealed.sh > scores.json
#
# Output: scores.json — {"wallets":["0x...","0x..."],"pts":[5,2]}
#   Only wallets with pts > 0 are included (zero-scorers stay at mapping default).
#
# Scoring formula:
#   Exact score  (home AND away match official):  5 pts
#   Correct outcome (W/D/L direction):            2 pts
#   Wrong outcome:                                0 pts
#
# Required env:
#   LEDGER_ADDRESS   — checksummed MangooalLedger address
#   MATCH_SLUG       — e.g. "cop26-col-bra"
#   HOME_SCORE       — official home goals (integer)
#   AWAY_SCORE       — official away goals (integer)
#   DEPLOY_BLOCK     — block the contract was deployed
#                      (cast receipt --rpc-url https://forno.celo.org <tx> | grep blockNumber)
# Optional env:
#   CELO_RPC         — RPC URL (default: https://forno.celo.org)
#
# Requires: cast (Foundry), python3
# Run AFTER forge script SubmitResult.s.sol has confirmed the result on-chain.
# Then pass scores.json to RecordPoints.s.sol.

set -euo pipefail

: "${LEDGER_ADDRESS:?LEDGER_ADDRESS env var required}"
: "${MATCH_SLUG:?MATCH_SLUG env var required}"
: "${HOME_SCORE:?HOME_SCORE env var required}"
: "${AWAY_SCORE:?AWAY_SCORE env var required}"
: "${DEPLOY_BLOCK:?DEPLOY_BLOCK env var required — get from: cast receipt --rpc-url https://forno.celo.org <deploy-tx> | grep blockNumber}"

RPC="${CELO_RPC:-https://forno.celo.org}"
CHUNK=49999  # Forno rejects spans > ~50,000 blocks (error -32011)

CAMPAIGN_HASH=$(cast keccak "fifa-world-cup-2026")
MATCH_HASH=$(cast keccak "$MATCH_SLUG")

>&2 echo "=== Mangooal Score Computation ==="
>&2 echo "Contract:  $LEDGER_ADDRESS"
>&2 echo "Match:     $MATCH_SLUG  ($MATCH_HASH)"
>&2 echo "Campaign:  $CAMPAIGN_HASH"
>&2 echo "Official:  $HOME_SCORE – $AWAY_SCORE"
>&2 echo "Start block: $DEPLOY_BLOCK"
>&2 echo ""

CURRENT=$(cast block-number --rpc-url "$RPC")
>&2 echo "Current block: $CURRENT"
>&2 echo "Fetching PredictionRevealed events in $CHUNK-block chunks..."

# Collect all log entries as newline-delimited JSON objects
ALL_ENTRIES=""
FROM=$DEPLOY_BLOCK
CHUNKS_DONE=0

while (( FROM <= CURRENT )); do
  TO=$(( FROM + CHUNK ))
  (( TO > CURRENT )) && TO=$CURRENT

  # --json emits a JSON array; hard-fail if the RPC returns an error object
  BATCH=$(cast logs \
    --rpc-url "$RPC" \
    --address "$LEDGER_ADDRESS" \
    --from-block "$FROM" \
    --to-block   "$TO" \
    --json \
    "PredictionRevealed(address,bytes32,bytes32,uint8,uint8,uint64)" 2>&1)

  # Validate that the response is a JSON array, not an error object
  if ! python3 -c "import json,sys; d=json.loads(sys.stdin.read()); sys.exit(0 if isinstance(d,list) else 1)" <<< "$BATCH" 2>/dev/null; then
    >&2 echo "ERROR: RPC error in block range $FROM-$TO:"
    >&2 echo "$BATCH"
    exit 1
  fi

  ENTRIES=$(python3 -c "
import json,sys
data=json.loads(sys.stdin.read())
for e in data:
    print(json.dumps(e))
" <<< "$BATCH")

  if [[ -n "$ENTRIES" ]]; then
    ALL_ENTRIES="${ALL_ENTRIES}${ENTRIES}"$'\n'
  fi

  CHUNKS_DONE=$(( CHUNKS_DONE + 1 ))
  >&2 echo "  ✓ chunk $CHUNKS_DONE: blocks $FROM–$TO  ($(echo "$ENTRIES" | grep -c '^{' 2>/dev/null || echo 0) events)"
  FROM=$(( TO + 1 ))
done

>&2 echo ""
>&2 echo "All chunks done. Computing scores..."

# Score each revealed prediction and emit parallel-arrays JSON
python3 - "$HOME_SCORE" "$AWAY_SCORE" "$MATCH_HASH" "$CAMPAIGN_HASH" <<'PYEOF'
import sys, json

off_h    = int(sys.argv[1])
off_a    = int(sys.argv[2])
match_id = sys.argv[3].lower()
camp_id  = sys.argv[4].lower()

def pad32(h):
    h = h.lower()
    return '0x' + (h[2:] if h.startswith('0x') else h).zfill(64)

match_id = pad32(match_id)
camp_id  = pad32(camp_id)

def outcome(h, a):
    if h > a: return 'H'
    if h == a: return 'D'
    return 'A'

off_dir = outcome(off_h, off_a)
scores  = {}   # wallet -> pts (last reveal wins; contract prevents duplicates)

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        e = json.loads(line)
    except json.JSONDecodeError:
        continue

    # topics: [event-sig, wallet (padded 32B), campaignId, matchId]
    topics = e.get("topics", [])
    if len(topics) < 4:
        continue
    if pad32(topics[2]) != camp_id:
        continue
    if pad32(topics[3]) != match_id:
        continue

    wallet = "0x" + topics[1][-40:].lower()

    # data: abi-encoded (uint8 homeScore, uint8 awayScore, uint64 revealedAt)
    # each value is right-aligned in a 32-byte (64 hex char) slot
    data = e.get("data", "")[2:]   # strip 0x
    if len(data) < 3 * 64:
        continue

    pred_h = int(data[0:64],   16)
    pred_a = int(data[64:128], 16)

    if pred_h == off_h and pred_a == off_a:
        pts = 5
    elif outcome(pred_h, pred_a) == off_dir:
        pts = 2
    else:
        pts = 0

    if pts > 0:
        scores[wallet] = pts

wallets_out = list(scores.keys())
pts_out     = [scores[w] for w in wallets_out]

print(json.dumps({"wallets": wallets_out, "pts": pts_out}, indent=2))
PYEOF

>&2 echo "Done. Pipe output to scores.json, then run RecordPoints.s.sol."
