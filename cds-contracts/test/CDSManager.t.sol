// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/CDSManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CDSManagerTest is Test {
    CDSManager public cdsManager;
    IERC20 public usdc;
    address public admin;
    address public user1;
    address public user2;
    address bond=0x1741DE82e9a4A292B9F4D54803987a155A570B00;
    function setUp() public {
        // Initialize test accounts
        admin = address(1);
        user1 = address(2);
        user2 = address(3);

        // Mock USDC token
        usdc = IERC20(address(new ERC20Mock()));

        // Deploy CDSManager contract
        cdsManager = new CDSManager(address(usdc), admin);

        // Mint tokens to users
        ERC20Mock(address(usdc)).mint(user1, 1000 * 10**6); // Mint 1000 USDC to user1
        ERC20Mock(address(usdc)).mint(user2, 1000 * 10**6); // Mint 1000 USDC to user2
        ERC20Mock(address(usdc)).mint(admin, 1000 * 10**6); // Mint 1000 USDC to user2
    }
    
    function testAddBond() public {
        vm.startPrank(admin);

        // Add bond to the CDSManager
        cdsManager.addBond(address(bond), 100 * 10**6, block.timestamp + 30 days);

        // Check if the bond is added correctly
        bytes32 bondKey = keccak256(abi.encodePacked(address(bond), block.timestamp + 30 days));
        (address bondAddress, uint nextCouponAmount, uint nextCouponDate) = cdsManager.bondsAndExpiration(bondKey);

        assertEq(bondAddress, address(bond));
        assertEq(nextCouponAmount, 100 * 10**6);
        assertEq(nextCouponDate, block.timestamp + 30 days);

        vm.stopPrank();
    }

    function testCreateCDS() public {
        vm.startPrank(admin);

        // Add a bond first
        bytes32 bondKey = keccak256(abi.encodePacked(address(bond), block.timestamp + 30 days));
        cdsManager.addBond(address(bond), 100 * 10**6, block.timestamp + 30 days);

        vm.stopPrank();

        // User1 creates a CDS
        vm.startPrank(user1);
        usdc.approve(address(cdsManager), 100 * 10**6);
        cdsManager.createCDS(bondKey, 50 * 10**6); // Premium is 50 USDC
        vm.stopPrank();

        // Verify CDS details
        (uint cdsID, bytes32 bondAddressAndExpiration, address creator,, uint premium, bool isActive,,) = cdsManager.cdsContracts(0);

        assertEq(cdsID, 0);
        assertEq(bondAddressAndExpiration, bondKey);
        assertEq(creator, user1);
        assertEq(premium, 50 * 10**6);
        assertTrue(isActive);
    }

    function testBuyCDS() public {
        vm.startPrank(admin);

        // Add bond
        bytes32 bondKey = keccak256(abi.encodePacked(address(bond), block.timestamp + 30 days));
        cdsManager.addBond(address(bond), 100 * 10**6, block.timestamp + 30 days);
        vm.stopPrank();

        // User1 creates a CDS
        vm.startPrank(user1);
        usdc.approve(address(cdsManager), 100 * 10**6);

        cdsManager.createCDS(bondKey, 50 * 10**6); // Premium is 50 USDC
        vm.stopPrank();

        // Approve USDC transfer
        vm.startPrank(user2);
        usdc.approve(address(cdsManager), 50 * 10**6);
        cdsManager.buyCDS(0); // User2 buys CDS with ID 0

        // Verify that the buyer is correctly set
        (, , , address buyer,, , ,) = cdsManager.cdsContracts(0);
        assertEq(buyer, user2);
        vm.stopPrank();
    }

    function testRequestDefaultVerification() public {
        vm.startPrank(admin);

        // Add bond
        bytes32 bondKey = keccak256(abi.encodePacked(address(bond), block.timestamp + 30 days));
        cdsManager.addBond(address(bond), 100 * 10**6, block.timestamp + 30 days);
        vm.stopPrank();

        // User1 creates a CDS
        vm.startPrank(user1);
        usdc.approve(address(cdsManager), 100 * 10**6);

        cdsManager.createCDS(bondKey, 50 * 10**6); // Premium is 50 USDC
        vm.stopPrank();

        // Approve USDC transfer
        vm.startPrank(user2);
        usdc.approve(address(cdsManager), 50 * 10**6);
        cdsManager.buyCDS(0); // User2 buys CDS with ID 0
        vm.warp(block.timestamp + 31 days);

        // User2 requests default verification
        cdsManager.requestDefaultVerification(0);

        // Verify that the CDS is marked as accused
        (, , , , , ,, bool isAccused) = cdsManager.cdsContracts(0);
        assertTrue(isAccused);

        vm.stopPrank();
    }
   function testAcceptDefault() public {
        vm.startPrank(admin);

        // Add bond
        bytes32 bondKey = keccak256(abi.encodePacked(address(bond), block.timestamp + 30 days));
        cdsManager.addBond(address(bond), 100 * 10**6, block.timestamp + 30 days);
        vm.stopPrank();

        // User1 creates a CDS
        vm.startPrank(user1);
        usdc.approve(address(cdsManager), 100 * 10**6);

        cdsManager.createCDS(bondKey, 50 * 10**6); // Premium is 50 USDC
        vm.stopPrank();

        // Approve USDC transfer
        vm.startPrank(user2);
        usdc.approve(address(cdsManager), 50 * 10**6);
        cdsManager.buyCDS(0); // User2 buys CDS with ID 0

        // Request default verification
        cdsManager.requestDefaultVerification(0);
        vm.warp(block.timestamp + 31 days);

        vm.stopPrank();

        // Admin accepts the default
        vm.startPrank(admin);
        cdsManager.acceptDefault(0);

        // Check if CDS is marked as claimed
        (, , , , , bool isActive, bool isClaimed,) = cdsManager.cdsContracts(0);
        assertFalse(isActive);  // CDS is no longer active
        assertTrue(isClaimed);  // CDS is claimed
    }
    
    function testRecoverCollateral() public {
        vm.startPrank(admin);

        // Add bond
        bytes32 bondKey = keccak256(abi.encodePacked(address(bond), block.timestamp + 10 days));
        cdsManager.addBond(address(bond), 100 * 10**6, block.timestamp + 10 days);
        vm.stopPrank();

        // User1 creates a CDS
        vm.startPrank(user1);
        usdc.approve(address(cdsManager), 100 * 10**6);
        cdsManager.createCDS(bondKey, 50 * 10**6); // Premium is 50 USDC
        vm.stopPrank();

        // Move time forward past the bond expiration + 5 days
        vm.warp(block.timestamp + 31 days);

        // Recover collateral
        vm.startPrank(user1);
        cdsManager.recoverCollateral(0);

        // Check if the CDS is no longer active
        (, , , , , bool isActive,,) = cdsManager.cdsContracts(0);
        assertFalse(isActive);  // CDS is no longer active
    }
}

// Mock ERC20 token for testing
contract ERC20Mock is IERC20 {
    string public constant name = "Mock USDC";
    string public constant symbol = "mUSDC";
    uint8 public constant decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
