// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    mapping(address => uint256) public lastUSDCClaimTime;
    mapping(address => uint256) public lastETHClaimTime;
    uint256 public constant USDC_CLAIM_AMOUNT = 10_000 * 10**6; // 10,000 USDC
    uint256 public constant USDC_CLAIM_COOLDOWN = 60 minutes;
    uint256 public constant INITIAL_SUPPLY = 100_000_000_000 * 10**6; // 100 billion USDC
    uint256 public constant ETH_CLAIM_AMOUNT = 0.0005 ether;
    uint256 public constant ETH_CLAIM_COOLDOWN = 60 minutes;

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function claimUSDC(address recipient) external {
        require(block.timestamp >= lastUSDCClaimTime[recipient] + USDC_CLAIM_COOLDOWN, "USDC claim cooldown period not over");
        
        lastUSDCClaimTime[recipient] = block.timestamp;
        _mint(recipient, USDC_CLAIM_AMOUNT);
    }

    function claimETH(address recipient) external {
        require(block.timestamp >= lastETHClaimTime[recipient] + ETH_CLAIM_COOLDOWN, "ETH claim cooldown period not over");
        require(address(this).balance >= ETH_CLAIM_AMOUNT, "Insufficient ETH balance in contract");
        
        lastETHClaimTime[recipient] = block.timestamp;
        payable(recipient).transfer(ETH_CLAIM_AMOUNT);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    receive() external payable {}
}
