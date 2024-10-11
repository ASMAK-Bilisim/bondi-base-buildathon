pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    mapping(address => uint256) public lastClaimTime;
    uint256 public constant CLAIM_AMOUNT = 100_000 * 10**6; // 100,000 USDC
    uint256 public constant CLAIM_COOLDOWN = 10 minutes;
    uint256 public constant INITIAL_SUPPLY = 100_000_000_000 * 10**6; // 100 billion USDC

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function claim() external {
        require(block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN, "Cooldown period not over");
        lastClaimTime[msg.sender] = block.timestamp;
        _mint(msg.sender, CLAIM_AMOUNT);
    }
}