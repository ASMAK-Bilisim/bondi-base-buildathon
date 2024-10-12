// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "../src/CDSManager.sol";

contract DeployCDSManager is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast(0x8a47b9185e7257d37a75d3ed26e2ad84ac27da9721289ec72f0a1ead4c80219a);

        // Set up USDC token address and admin address for the CDSManager contract
        address usdcToken = 0x1702087C0038e3b656DE6426566582F66265dE0e;
        
        // Use the address derived from the private key as the admin
        address admin = 0x97CAF223244DbF8eA087a955b9C9283F8Be3A2CF;  
        // Deploy the CDSManager contract
        CDSManager cdsManager = new CDSManager(usdcToken, admin);
        
        console.log(address(cdsManager));
        
        address[3] memory bondAddresses = [0xbcB5CB18a5CAa970Fe18669e59737f69893DE900, 0x17BCB6653b0e560D7961072A7dcb17f428a92c8d, 0x895F4555EdFa373F2207918D9e1640C48E4288Ce];
        for (uint i = 0; i < bondAddresses.length; i++) {
            bytes32 addressAndExpiration=cdsManager.addBond(bondAddresses[i], (105+i )* 10 ** 6, block.timestamp + 30 days);
            console.log("************************************************************");
            console.log("addressAndExpiration",i);
            console.logBytes32(addressAndExpiration);
            (address bond, uint amount, uint date) = cdsManager.getBond(addressAndExpiration);
            console.log("bond",i);
            console.logAddress(bond);
            console.log("amount",i);
            console.logUint(amount);
            console.log("date",i);
            console.logUint(date);

        }


        vm.stopBroadcast();
    }
}
