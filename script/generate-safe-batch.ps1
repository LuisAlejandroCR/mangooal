#!/usr/bin/env pwsh
# Generates a Gnosis Safe Transaction Builder JSON for MangooalLedger post-deploy setup.
# Import the output file at app.safe.global → New Transaction → Transaction Builder → drag & drop.
#
# Usage:
#   $env:CAST = "C:\Users\Unknown Booty\.foundry\bin\cast.exe"
#   .\script\generate-safe-batch.ps1

param(
    [string]$LedgerAddress  = "0xCF00CaE3610cA8C410948C240b930c9cE3C03d66",
    [string]$OracleAddress  = "0x5FBA81aC09b7021d1Aac5CA11e308a0D62ba1b66",
    [string]$OracleRole     = "0x68e79a7bf1e0bc45d0a330c573bc367f9cf464fd326078812f301165fbda4ef1",
    [string]$Cast           = $env:CAST
)

if (-not $Cast) { $Cast = "cast" }

# ── Token addresses (Celo Mainnet) ──────────────────────────────────────────
$USDM = "0x765DE816845861e75A25fCA122bb6898B8B1282a"
$USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C"
$USDT = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e"
$COPM = "0x8A567e2aE79CA692Bd748aB832081C45de4041eA"

# ── Pass amounts (must mirror SetupAfterDeploy.s.sol) ───────────────────────
$amounts = @{
    "1-$COPM" = "500000000000000000000"      # 500 COPm (18 dec)
    "1-$USDC" = "100000"                      # $0.10 (6 dec)
    "1-$USDT" = "100000"
    "1-$USDM" = "100000000000000000"          # 0.10 USDm (18 dec)
    "2-$COPM" = "2500000000000000000000"      # 2,500 COPm
    "2-$USDC" = "500000"
    "2-$USDT" = "500000"
    "2-$USDM" = "500000000000000000"          # 0.50 USDm
    "3-$COPM" = "8000000000000000000000"      # 8,000 COPm
    "3-$USDC" = "1500000"
    "3-$USDT" = "1500000"
    "3-$USDM" = "1500000000000000000"         # 1.50 USDm
    "4-$COPM" = "40000000000000000000000"     # 40,000 COPm
    "4-$USDC" = "7000000"
    "4-$USDT" = "7000000"
    "4-$USDM" = "7000000000000000000"         # 7.00 USDm
}

$CAMPAIGN_STARTS = "1782604800"
$CAMPAIGN_ENDS   = "1784678400"

Write-Host "Computing campaign IDs..."
$campaignId   = & $Cast keccak "fifa-world-cup-2026"
$metadataHash = & $Cast keccak "FIFA World Cup 2026 - Mangooal"
Write-Host "  campaignId:   $campaignId"
Write-Host "  metadataHash: $metadataHash"

function Get-Calldata($sig, $args) {
    $result = & $Cast calldata $sig @args
    return $result
}

$txs = [System.Collections.Generic.List[hashtable]]::new()

# ── Tx 1: grantRole(ORACLE_ROLE, oracle) ────────────────────────────────────
$txs.Add(@{
    to    = $LedgerAddress
    value = "0"
    data  = (Get-Calldata "grantRole(bytes32,address)" @($OracleRole, $OracleAddress))
})

# ── Tx 2-17: setPassPrice (16 combinations) ─────────────────────────────────
foreach ($passType in 1..4) {
    foreach ($token in @($COPM, $USDC, $USDT, $USDM)) {
        $amount = $amounts["$passType-$token"]
        $txs.Add(@{
            to    = $LedgerAddress
            value = "0"
            data  = (Get-Calldata "setPassPrice(uint8,address,uint256)" @("$passType", $token, $amount))
        })
    }
}

# ── Tx 18: createCampaign(campaignId, metadataHash, startsAt, endsAt) ───────
$txs.Add(@{
    to    = $LedgerAddress
    value = "0"
    data  = (Get-Calldata "createCampaign(bytes32,bytes32,uint64,uint64)" @($campaignId, $metadataHash, $CAMPAIGN_STARTS, $CAMPAIGN_ENDS))
})

$batch = [ordered]@{
    version    = "1.0"
    chainId    = "42220"
    createdAt  = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    meta       = [ordered]@{
        name        = "MangooalLedger Setup"
        description = "Grant ORACLE_ROLE + 16 pass prices + create FIFA WC 2026 campaign"
    }
    transactions = $txs.ToArray()
}

$outFile = "safe-setup-batch.json"
$batch | ConvertTo-Json -Depth 10 | Out-File $outFile -Encoding utf8
Write-Host ""
Write-Host "Batch JSON written to: $outFile ($($txs.Count) transactions)"
Write-Host "Import at: app.safe.global → New Transaction → Transaction Builder → drag & drop"
