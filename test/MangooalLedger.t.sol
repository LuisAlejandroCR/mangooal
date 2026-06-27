// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/MangooalLedger.sol";

contract MockStablecoin is ERC20 {
    constructor() ERC20("Mock USDm", "mUSD") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MangooalLedgerTest is Test {
    MangooalLedger internal ledger;
    MockStablecoin internal token;

    address internal admin = address(0xA11CE);
    address internal treasury = address(0xB0B);
    address internal player = address(0xCAFE);

    bytes32 internal campaignId = keccak256("fifa-world-cup-2026");
    bytes32 internal matchId = keccak256("croatia-ghana");

    function setUp() public {
        vm.warp(1_000);
        vm.prank(admin);
        ledger = new MangooalLedger(admin, treasury);
        token = new MockStablecoin();

        vm.startPrank(admin);
        ledger.setTokenAllowlist(address(token), true);
        ledger.setPassPrice(ledger.PASS_WEEKLY(), address(token), 0.5 ether);
        ledger.createCampaign(campaignId, keccak256("FIFA World Cup 2026"), 1_000, 10_000);
        ledger.registerMatch(campaignId, matchId, keccak256("Croatia v Ghana"), 5_000, 3_200);
        vm.stopPrank();
    }

    function testSubmitAndUpdatePickIsReadableFromContract() public {
        vm.prank(player);
        ledger.submitOrUpdatePick(campaignId, matchId, 2, 0);

        MangooalLedger.Pick memory pick = ledger.getPick(player, campaignId, matchId);
        assertEq(pick.homeScore, 2);
        assertEq(pick.awayScore, 0);
        assertEq(pick.version, 1);
        assertEq(ledger.getUserPickCount(player, campaignId), 1);
        assertEq(ledger.getCampaignPlayerCount(campaignId), 1);

        vm.prank(player);
        ledger.submitOrUpdatePick(campaignId, matchId, 3, 1);

        pick = ledger.getPick(player, campaignId, matchId);
        assertEq(pick.homeScore, 3);
        assertEq(pick.awayScore, 1);
        assertEq(pick.version, 2);

        (bytes32[] memory ids, MangooalLedger.Pick[] memory picks) = ledger.getUserPicks(player, campaignId, 0, 10);
        assertEq(ids.length, 1);
        assertEq(ids[0], matchId);
        assertEq(picks[0].homeScore, 3);
    }

    function testCannotEditPickAfterLock() public {
        vm.warp(3_200);
        vm.prank(player);
        vm.expectRevert(bytes("predictions locked"));
        ledger.submitOrUpdatePick(campaignId, matchId, 1, 1);
    }

    function testRecordPointsIsIdempotentForRankingStats() public {
        vm.prank(player);
        ledger.submitOrUpdatePick(campaignId, matchId, 2, 1);

        vm.warp(5_001);
        vm.prank(admin);
        ledger.submitOfficialResult(campaignId, matchId, 2, 1);

        vm.prank(admin);
        ledger.recordPoints(campaignId, matchId, player, 5);

        MangooalLedger.PlayerCampaignStats memory stats = ledger.getPlayerCampaignStats(player, campaignId);
        assertEq(stats.totalPoints, 5);
        assertEq(stats.picksSubmitted, 1);
        assertEq(stats.exactHits, 1);

        vm.prank(admin);
        ledger.recordPoints(campaignId, matchId, player, 3);

        stats = ledger.getPlayerCampaignStats(player, campaignId);
        assertEq(stats.totalPoints, 3);
        assertEq(stats.picksSubmitted, 1);
        assertEq(stats.exactHits, 1);
    }

    function testCoachPassPurchaseHistoryIsOnChain() public {
        token.mint(player, 2 ether);

        vm.startPrank(player);
        token.approve(address(ledger), 2 ether);
        ledger.purchaseCoachPass(ledger.PASS_WEEKLY(), address(token), 0.5 ether);
        ledger.purchaseCoachPass(ledger.PASS_WEEKLY(), address(token), 0.5 ether);
        vm.stopPrank();

        assertTrue(ledger.hasActiveCoachPass(player));
        assertEq(ledger.getCoachPassPurchaseCount(player), 2);
        assertEq(token.balanceOf(treasury), 1 ether);

        MangooalLedger.CoachPassPurchase memory first = ledger.getCoachPassPurchase(player, 0);
        MangooalLedger.CoachPassPurchase memory second = ledger.getCoachPassPurchase(player, 1);
        assertEq(first.passType, ledger.PASS_WEEKLY());
        assertEq(second.startsAt, first.expiresAt);
    }
}
