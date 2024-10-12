// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "forge-std/Test.sol";
import "../src/CDSManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CDSManagerTest is Test {
    CDSManager public cdsManager;
    IERC20 public usdc;
    address bond=0x1741DE82e9a4A292B9F4D54803987a155A570B00;
    function setUp() public {

        // Mock USDC token
        usdc = IERC20(address(0x1702087C0038e3b656DE6426566582F66265dE0e));
        // Deploy CDSManager contract
        // Mint tokens to users
       }
    
    function testUSD() public {
        console.log(usdc.balanceOf(0x62eDeCd612368877b88a72095e9f148a0734a025));
    }
}
