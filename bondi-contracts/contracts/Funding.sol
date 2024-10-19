// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./InvestorNFT.sol";
import "./BondDistribution.sol";

/// @dev Custom errors (for reduced costs)
error FundingPeriodFinished(uint256 finishedAt);
error FundingExceedsTargetAmount(uint256 currentBalance, uint256 target);
error FundingBelowMinimum(uint256 invested, uint256 minimum);
error FundingInsufficientBalance(uint256 available, uint256 required);
error FundingPeriodOngoing(uint256 finishesAt);
error FundingTargetAmountReached();
error FundingNoRegisteredFunds();
error FundingPeriodCannotBeZero();
error FundingTargetCannotBeZero();
error FundingMinimumCannotBeZero();
error FundingCannotBeZeroAddress();
error FundingTargetTooSmall();
error FundingNoInvestorsToRefund();
error FundingInvestorsAmountToRefundTooBig();
error InvestorNFTCannotBeZeroAddress();

/// @title Funding - Funding functionality contract
/// @dev This contract uses AccessControl instead of Ownable to be able to expand towards having different roles/authorities
contract Funding is AccessControl, Pausable, ReentrancyGuard {

    uint256 public constant WHALE_INVESTOR_THRESHOLD = 5000 * 10**6; // 5000 USDC

    // Funding token
    IERC20 public immutable usdcToken;
    InvestorNFT public whaleNFT;
    InvestorNFT public ogNFT;

    // Storage variables
    uint256 internal _minimumInvestmentAmount;
    uint256 public targetAmount;
    uint256 internal _fundingPeriodLimit;
    address[] internal _investors;
    mapping (address => Investor) public investedAmountPerInvestor;

    BondDistribution public bondDistribution;
    bool public bondPriceSet;

    // Structs
    struct Investor {
        uint256 investedAmount;
        uint256 investorIndex;
        bool isWhaleInvestor;
    }

    // Events
    event InvestmentMade(address investor, uint256 amount, uint256 timestamp);
    event WithdrawalMade(address investor, uint256 amount, uint256 timestamp);
    event RefundedInvestors(uint256 amountOfInvestors, uint256 timestamp);

    // Modifiers

    /// @dev Investment requirements are:
    /// - owner must have set NFT addresses
    /// - Funding period hasn't finished
    /// - Overall investment cannot surpass established Target Amount
    /// - Investment cannot be less than the established Minimum
    /// - Investor needs to have sufficient funds
    modifier checkInvestmentRequirements(uint256 amountToInvest_) {
        // TODO: We still have to add KYC validation for investors
        if (address(whaleNFT) == address(0) || address(ogNFT) == address(0)) revert InvestorNFTCannotBeZeroAddress();
        if (_fundingPeriodLimit <= block.timestamp) revert FundingPeriodFinished(_fundingPeriodLimit);
        uint256 fundingBalance = usdcToken.balanceOf(address(this));
        if (fundingBalance + amountToInvest_ > targetAmount) revert FundingExceedsTargetAmount(fundingBalance, targetAmount);
        if (amountToInvest_ < _minimumInvestmentAmount) revert FundingBelowMinimum(amountToInvest_, _minimumInvestmentAmount);
        uint256 investorBalance = usdcToken.balanceOf(msg.sender);
        if (investorBalance < amountToInvest_) revert FundingInsufficientBalance(investorBalance, amountToInvest_);
        _;
    }

    /// @dev On top of the General Refund Requirements, Withdrawal requirements are:
    /// - Withdrawer must be an Investor
    /// - The Funding Contract must have enough funds to transfer
    modifier checkWithdrawalRequirements {
        _checkGeneralRefundRequirements();
        Investor memory currentInvestor = investedAmountPerInvestor[msg.sender];
        uint256 amountToWithdraw = currentInvestor.investedAmount;
        if (amountToWithdraw == 0) revert FundingNoRegisteredFunds();
        uint256 fundingBalance = usdcToken.balanceOf(address(this));
        if (fundingBalance < amountToWithdraw) revert FundingInsufficientBalance(fundingBalance, amountToWithdraw);
        _;
    }

    /// @dev On top of the General Refund Requirements, Refund requirements are:
    /// - Provide an amount of investors to refund within investors array length
    modifier checkRefundRequirements(uint256 amountOfInvestorsToRefund) {
        _checkGeneralRefundRequirements();
        if (amountOfInvestorsToRefund == 0) revert FundingNoInvestorsToRefund();
        if (amountOfInvestorsToRefund > _investors.length) revert FundingInvestorsAmountToRefundTooBig();
        _;
    }
    
    /// @dev Funding contract methods that can only be called before bond price is set (minting has started)(actual purchase of bonds happened IRL)
    modifier onlyBeforeDistribution() {
        require(!bondPriceSet, "Bond price already set, cannot modify parameters");
        _;
    }

    // Constructor

    /// @param minimumInvestmentAmount_ is the minimum amount any investor must provide to fund the contract
    /// @param targetAmount_ is the total sum to reach from investments
    /// @param fundingPeriodLimitInDays_ is the maximum date available to reach the target amount
    /// @param usdcTokenAddress_ address of USDC Token contract deployed on the same blockchain
    constructor(
        uint256 minimumInvestmentAmount_,
        uint256 targetAmount_,
        uint256 fundingPeriodLimitInDays_,
        address usdcTokenAddress_
    ) {
        // Assertions
        if (minimumInvestmentAmount_== 0) revert FundingMinimumCannotBeZero();
        if (targetAmount_== 0) revert FundingTargetCannotBeZero();
        if (fundingPeriodLimitInDays_ == 0) revert FundingPeriodCannotBeZero();
        if (usdcTokenAddress_ == address(0)) revert FundingCannotBeZeroAddress();
    
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _minimumInvestmentAmount = minimumInvestmentAmount_;
        targetAmount = targetAmount_;
        _fundingPeriodLimit = block.timestamp + fundingPeriodLimitInDays_ * 1 days;
        usdcToken = IERC20(usdcTokenAddress_);
    }

    // Pausing methods

    /// @notice Allows Default Admin to pause the contract
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Allows Default Admin to unpause the contract
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Setter methods

    /// @dev New target cannot be less than current one
    function setTargetAmount(uint256 targetAmount_) public onlyRole(DEFAULT_ADMIN_ROLE) onlyBeforeDistribution {
        if (targetAmount_ <= targetAmount) revert FundingTargetTooSmall();
        targetAmount = targetAmount_;
    }

    /// @dev New funding period limit cannot be previous to current one
    function incrementFundingPeriodLimit(uint256 daysToAddToFundingPeriodLimit_) public onlyRole(DEFAULT_ADMIN_ROLE) onlyBeforeDistribution {
        if (daysToAddToFundingPeriodLimit_ == 0) revert FundingPeriodCannotBeZero();
        _fundingPeriodLimit += daysToAddToFundingPeriodLimit_ * 1 days;
    }

    /// @dev New minimum investment amount cannot be zero
    function setMinimumInvestmentAmount(uint256 minimumInvestmentAmount_) public onlyRole(DEFAULT_ADMIN_ROLE) onlyBeforeDistribution {
        if (minimumInvestmentAmount_ == 0) revert FundingMinimumCannotBeZero();
        _minimumInvestmentAmount = minimumInvestmentAmount_;
    }

    /// @dev Set new whale NFT address
    function setWhaleNFTAddress(address whaleNFTAddress_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (whaleNFTAddress_ == address(0)) revert InvestorNFTCannotBeZeroAddress();
        whaleNFT = InvestorNFT(whaleNFTAddress_);
    }

    /// @dev Set new og NFT address
    function setOgNFTAddress(address ogNFTAddress_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (ogNFTAddress_ == address(0)) revert InvestorNFTCannotBeZeroAddress();
        ogNFT = InvestorNFT(ogNFTAddress_);
    }

    // Functionality methods

    /// @notice Invest into the Funding Contract by indicating the amount to invest.
    /// Investing requires previous approval by calling approve(spender, amount) on the USDC contract beforehand.
    function invest(uint256 investmentAmount_) public checkInvestmentRequirements(investmentAmount_) nonReentrant whenNotPaused {
        _updateInvestorWithInvestment(msg.sender, investmentAmount_);
        require(usdcToken.transferFrom(msg.sender, address(this), investmentAmount_), "Investment failed");
        emit InvestmentMade(msg.sender, investmentAmount_, block.timestamp);
    }

    /// @notice Withdraw total investment if the targetAmount hasn't been reached at fundingPeriodLimit
    function withdraw() public checkWithdrawalRequirements nonReentrant whenNotPaused {
        Investor storage currentInvestor = investedAmountPerInvestor[msg.sender];
        uint256 amountToWithdraw = currentInvestor.investedAmount;

        // Removal from investors array and variables reset
        assert(msg.sender == _investors[currentInvestor.investorIndex]);
        _removeFromInvestors(currentInvestor.investorIndex);
        delete currentInvestor.investedAmount;
        delete currentInvestor.investorIndex;

        require(usdcToken.transfer(msg.sender, amountToWithdraw), "Refund failed");
        emit WithdrawalMade(msg.sender, amountToWithdraw, block.timestamp);
    }

    /// @dev refundInvestors can be called by anyone as long as the GeneralRefundRequirements are met.
    /// This method refunds n (amountOfInvestorsToRefund_) investors by iterating over an investors list and
    /// removing the refunded investors from it.
    /// The amount limit is imposed to ensure the whole transaction fits within one block.
    /// This solution was implemented to avoid storing any information on a centralized service.
    function refundInvestors(uint256 amountOfInvestorsToRefund_) public checkRefundRequirements(amountOfInvestorsToRefund_) nonReentrant whenNotPaused {
        address firstInvestorAddress;
        uint256 amountToRefundFirstInvestor;
        uint256 amountOfInvestorsToRefund = amountOfInvestorsToRefund_;
        while (amountOfInvestorsToRefund != 0) {
            firstInvestorAddress = _investors[0];
            Investor storage firstInvestor = investedAmountPerInvestor[firstInvestorAddress];
            amountToRefundFirstInvestor = firstInvestor.investedAmount;
            delete firstInvestor.investedAmount;
            delete firstInvestor.investorIndex;
            _removeFromInvestors(0);
            amountOfInvestorsToRefund--;
            require(usdcToken.transfer(firstInvestorAddress, amountToRefundFirstInvestor), "Refund failed");
        }
        emit RefundedInvestors(amountOfInvestorsToRefund_, block.timestamp);
    }

    // Auxiliary methods

    /// @dev General Refund Requirements are:
    /// - Funding period has finished
    /// - Target Amount hasn't been reached
    /// - There are active investors
    function _checkGeneralRefundRequirements() internal view {
        if (block.timestamp < _fundingPeriodLimit) revert FundingPeriodOngoing(_fundingPeriodLimit);
        if (usdcToken.balanceOf(address(this)) >= targetAmount) revert FundingTargetAmountReached();
        if (_investors.length == 0) revert FundingNoInvestorsToRefund();
    }

    function _removeFromInvestors(uint256 index) internal {
        // Keep track of index updates before removing investor
        uint256 lastInvestorIndex = _investors.length - 1;
        Investor storage lastInvestor = investedAmountPerInvestor[_investors[lastInvestorIndex]];
        lastInvestor.investorIndex = index;
        // Move the last element into the place to delete
        _investors[index] = _investors[lastInvestorIndex];
        // Remove the last element
        _investors.pop();
    }

    function _updateInvestorWithInvestment(address investor_, uint256 investmentAmount_) internal {
        Investor storage currentInvestor = investedAmountPerInvestor[investor_];
        // If new investor, add to investors array
        if (currentInvestor.investedAmount == 0) {
            _investors.push(investor_);
            currentInvestor.investorIndex = _investors.length - 1;
            ogNFT.safeMint(investor_);
        }
        currentInvestor.investedAmount += investmentAmount_;
        if (currentInvestor.investedAmount >= WHALE_INVESTOR_THRESHOLD && !currentInvestor.isWhaleInvestor) {
            currentInvestor.isWhaleInvestor = true;
            whaleNFT.safeMint(investor_);
        }
    }

    function getMinimumInvestmentAmount() public view returns (uint256) {
        return _minimumInvestmentAmount;
    }

    function getFundingPeriodLimit() public view returns (uint256) {
        return _fundingPeriodLimit;
    }

    function setBondDistribution(address _bondDistribution) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bondDistribution = BondDistribution(_bondDistribution);
    }

    function setBondPriceAndInitiateMinting(uint256 _bondPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!bondPriceSet, "Bond price already set");
        require(usdcToken.balanceOf(address(this)) >= targetAmount, "Target amount not reached");
        require(block.timestamp < _fundingPeriodLimit, "Funding period has ended");

        bondDistribution.setBondPrice(_bondPrice);
        bondPriceSet = true;
        bondDistribution.initiateMinting();
    }

    function getInvestorAmount() public view returns (uint256) {
        return _investors.length;
    }

    function investors(uint256 index) public view returns (address) {
        return _investors[index];
    }
}
