// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BondToken.sol";
import "./Funding.sol";

contract BondDistribution is AccessControl {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant FUNDING_CONTRACT_ROLE = keccak256("FUNDING_CONTRACT_ROLE");

    BondToken public bondToken;
    Funding public fundingContract;
    IERC20 public usdcToken;

    uint256 public bondPrice;
    uint256 public totalBondTokens;
    bool public bondPriceSet;
    bool public distributionReady;

    mapping(address => uint256) public claimableTokens;

    event BondTokensMinted(uint256 amount);
    event BondTokensClaimed(address investor, uint256 amount);

    constructor(address _bondToken, address _fundingContract, address _usdcToken) {
        bondToken = BondToken(_bondToken);
        fundingContract = Funding(_fundingContract);
        usdcToken = IERC20(_usdcToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        _grantRole(FUNDING_CONTRACT_ROLE, _fundingContract);
    }

    function setBondPrice(uint256 _bondPrice) external onlyRole(FUNDING_CONTRACT_ROLE) {
        require(!bondPriceSet, "Bond price already set");
        require(_bondPrice > 0, "Bond price must be greater than 0");
        bondPrice = _bondPrice;
        bondPriceSet = true;
    }

    function initiateMinting() external onlyRole(FUNDING_CONTRACT_ROLE) {
        require(!distributionReady, "Bond tokens already minted");
        require(bondPriceSet, "Bond price not set");
        require(usdcToken.balanceOf(address(fundingContract)) >= fundingContract.targetAmount(), "Funding target not reached");

        uint256 totalUSDC = usdcToken.balanceOf(address(fundingContract));
        totalBondTokens = (totalUSDC * 1e18) / bondPrice;

        bondToken.mint(address(this), totalBondTokens);
        distributionReady = true;
        calculateClaimableTokens();

        emit BondTokensMinted(totalBondTokens);
    }

    function calculateClaimableTokens() internal {
        uint256 investorCount = fundingContract.getInvestorAmount();
        uint256 totalInvested = usdcToken.balanceOf(address(fundingContract));
        
        for (uint256 i = 0; i < investorCount; i++) {
            address investor = fundingContract.investors(i);
            (uint256 investedAmount, , ) = fundingContract.investedAmountPerInvestor(investor);
            uint256 investorTokens = (investedAmount * totalBondTokens) / totalInvested;
            claimableTokens[investor] = investorTokens;
        }
    }

    function claimBondTokens() external {
        require(distributionReady, "Distribution not ready");
        uint256 claimableAmount = claimableTokens[msg.sender];
        require(claimableAmount > 0, "No tokens to claim");

        claimableTokens[msg.sender] = 0;
        bondToken.transfer(msg.sender, claimableAmount);

        emit BondTokensClaimed(msg.sender, claimableAmount);
    }

    function getClaimableTokens(address investor) external view returns (uint256) {
        return claimableTokens[investor];
    }
}
