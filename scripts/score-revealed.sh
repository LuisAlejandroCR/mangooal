#!/usr/bin/env bash
# score-revealed.sh — compute per-wallet points from on-chain PredictionRevealed events
#
# Usage:
#   LEDGER_ADDRESS=0x...  MATCH_SLUG=cop26-col-bra  HOME_SCORE=2  AWAY_SCORE=1 \
#   bash scripts/score-revealed.sh > scores.json
#
# Output:
#   scores.json — {"wallets":["0x...","0x..."],"pts":[5,2]}
#   (only wallets with pts > 0 are included)
#
# Scoring formula:
#   Exact score  (home AND away match official):  5 pts
#   Correct outcome (W/D/L direction):            2 pts
#   Wrong outcome:                                0 pts
#
# Requires: cast (Foundry), python3
# Celo public RPC: https://forno.celo.org
#
# Run AFTER forge script SubmitResult.s.sol has confirmed the result on-chain.
# Then pass scores.json to RecordPoints.s.sol.

set -euo pipefail

: "${LEDGER_ADDRESS:?LEDGER_ADDRESS env var required}"
: "${MATCH_SLUG:?MATCH_SLUG env var required}"
: "${HOME_SCORE:?HOME_SCORE env var required}"
: "${AWAY_SCORE:?AWAY_SCORE env var required}"

RPC="${CELO_RPC:-https://forno.celo.org}"

CAMPAIGN_HASH=$(cast keccak "copa-america-2026" --rpc-url "$RPC" 2>/dev/null || \
                cast keccak "copa-america-2026")
MATCH_HASH=$(cast keccak "$MATCH_SLUG" 2>/dev/null || cast keccak "$MATCH_SLUG")

>&2 echo "=== Mangooal Score Computation ==="
>&2 echo "Contract:  $LEDGER_ADDRESS"
>&2 echo "Match:     $MATCH_SLUG  ($MATCH_HASH)"
>&2 echo "Campaign:  $CAMPAIGN_HASH"
>&2 echo "Official:  $HOME_SCORE – $AWAY_SCORE"
>&2 echo ""

# Fetch PredictionRevealed events
# Event signature: PredictionRevealed(address indexed wallet, bytes32 indexed campaignId,
#                                     bytes32 indexed matchId, uint8 homeScore,
#                                     uint8 awayScore, uint64 revealedAt)
>&2 echo "Fetching PredictionRevealed events from chain..."

LOGS=$(cast logs \
  --rpc-url "$RPC" \
  --address "$LEDGER_ADDRESS" \
  --from-block earliest \
  --to-block latest \
  "PredictionRevealed(address,bytes32,bytes32,uint8,uint8,uint64)" \
  2>/dev/null) || true

if [[ -z "$LOGS" ]]; then
  >&2 echo "No PredictionRevealed events found. All wallets score 0."
  echo '{"wallets":[],"pts":[]}'
  exit 0
fi

>&2 echo "Events found. Computing scores..."

# Parse with Python and emit the parallel-arrays JSON
python3 - <<PYEOF
import sys, json, re

logs_raw = """$LOGS"""
off_h    = int("$HOME_SCORE")
off_a    = int("$AWAY_SCORE")
match_id = "$MATCH_HASH".lower()
camp_id  = "$CAMPAIGN_HASH".lower()

# Ensure 66-char hex (0x + 64 nibbles) for 32-byte hashes
def pad32(h):
    h = h.lower()
    if h.startswith('0x'):
        return '0x' + h[2:].zfill(64)
    return '0x' + h.zfill(64)

match_id = pad32(match_id)
camp_id  = pad32(camp_id)

def outcome(h, a):
    if h > a: return 'H'
    if h == a: return 'D'
    return 'A'

off_dir = outcome(off_h, off_a)

# Split log output into blocks (blank-line separated)
blocks = re.split(r'\n\s*\n', logs_raw.strip())
wallets_out = []
pts_out = []

for block in blocks:
    if not block.strip():
        continue

    # Extract topics
    topics = re.findall(r'topics\[(\d+)\]:\s*(0x[0-9a-fA-F]+)', block)
    topic_map = {int(i): v.lower() for i, v in topics}

    # topic0 = event sig, topic1 = wallet, topic2 = campaignId, topic3 = matchId
    if pad32(topic_map.get(2, '')) != camp_id:
        continue
    if pad32(topic_map.get(3, '')) != match_id:
        continue

    raw_wallet = topic_map.get(1, '')
    if not raw_wallet:
        continue
    # topic is left-padded to 32 bytes — take last 20 bytes
    wallet = '0x' + raw_wallet[-40:]

    # Non-indexed data in 'data' field: uint8 homeScore, uint8 awayScore, uint64 revealedAt
    # Each slot is 32 bytes (left-padded) in the raw data field
    data_m = re.search(r'^\s*data:\s*(0x[0-9a-fA-F]+)', block, re.MULTILINE)
    if not data_m:
        continue
    data = data_m.group(1)[2:]  # strip 0x
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
        wallets_out.append(wallet)
        pts_out.append(pts)

print(json.dumps({'wallets': wallets_out, 'pts': pts_out}, indent=2))
PYEOF

>&2 echo "Done. Pipe output to scores.json, then run RecordPoints.s.sol."
