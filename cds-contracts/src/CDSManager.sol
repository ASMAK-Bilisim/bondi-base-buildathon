// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title Credit Default Swap (CDS) Contract with Admin Verification
 * @dev This contract facilitates the creation, purchase, and execution of Credit Default Swaps (CDS) tied to specific bonds.
 * The verification of bond defaults is handled by an admin.
 * The expiration date of the CDS is defined by the next coupon date of the bond.
 */
contract CDSManager {
    
    struct Bond {
        address bondAddress;      // Dirección del bono
        uint nextCouponAmount;    // Monto del siguiente cupón
        uint nextCouponDate;      // Fecha del siguiente cupón
    }

    struct CDS {
        uint cdsID;
        bytes32 bondAddressAndExpiration;
        address creator;
        address buyer;
        uint premium;             // Prima pagada por el comprador del CDS
        bool isActive;            // Si el CDS está activo
        bool isClaimed;           // Si ya se ha hecho una reclamación
        bool isAccused;           // Si el CDS fue acusado de incumplimiento
    }

    address public admin;
    IERC20 private usdcToken;

    mapping(bytes32 => Bond) public bondsAndExpiration;  // Mapeo de dirección de bonos a sus detalles
    CDS[] public cdsContracts;              // Lista de contratos de CDS
    uint public cdsCount = 0;               // Contador de CDS

    event CDSCreated(uint indexed cdsID, address indexed creator, address bondAddress, uint premium, uint couponDate);
    event CDSBought(uint indexed cdsID, address indexed buyer);
    event DefaultRequested(uint indexed cdsID, address indexed buyer);
    event DefaultAccepted(uint indexed cdsID, address indexed admin);
    event DefaultRejected(uint indexed cdsID, address indexed admin);
    event CDSClaimed(uint indexed cdsID, address indexed buyer);
    event CollateralRecovered(uint indexed cdsID, address indexed creator);
    event BondAdded(address bondAddress, uint nextCouponAmount, uint nextCouponDate, bytes32 bondAndExpiration);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }


    constructor(address _usdcToken, address _admin) {
        usdcToken = IERC20(_usdcToken);
        admin = _admin;
    }

    function createCDS(bytes32 _bondAndExpiration, uint premium) external {
        Bond storage bond = bondsAndExpiration[_bondAndExpiration];
        require(bond.nextCouponDate > block.timestamp, "Bond's next coupon date is in the past");
        usdcToken.transferFrom(msg.sender, address(this), bond.nextCouponAmount);
        CDS memory newCDS = CDS({
            cdsID: cdsCount,
            bondAddressAndExpiration: _bondAndExpiration,
            creator: msg.sender,
            buyer: address(0),
            premium: premium,
            isActive: true,
            isClaimed: false,
            isAccused: false
        });

        cdsContracts.push(newCDS);
        emit CDSCreated(cdsCount, msg.sender, bond.bondAddress, premium, bond.nextCouponDate);
        cdsCount++;
    }

    /**
     * @notice Allows a buyer to purchase a CDS contract.
     * @param cdsID The ID of the CDS contract to purchase.
     */
    function buyCDS(uint cdsID) external {
        CDS storage cds = cdsContracts[cdsID];
        require(cds.isActive, "CDS is not active");
        require(cds.buyer == address(0), "CDS already sold"); // ?

        Bond storage bond = bondsAndExpiration[cds.bondAddressAndExpiration];
        require(bond.nextCouponDate > block.timestamp, "Bond's coupon date passed, CDS expired");

        // Transfer premium to creator
        usdcToken.transferFrom(msg.sender, cds.creator, cds.premium);
        cds.buyer = msg.sender;

        emit CDSBought(cdsID, msg.sender);
    }

    /**
     * @notice Buyer or any other CDS holder requests verification from the admin if a bond has defaulted.
     * @param cdsID The ID of the CDS to verify default.
     */
    function requestDefaultVerification(uint cdsID) external {
        CDS storage cds = cdsContracts[cdsID];
        require(cds.isActive, "CDS is inactive");
        require(!cds.isAccused, "CDS already accused of default");
        require(cds.buyer == msg.sender || cds.creator == msg.sender, "Not the CDS owner or creator");

        Bond storage bond = bondsAndExpiration[cds.bondAddressAndExpiration];
        require(bond.nextCouponDate + 5 days > block.timestamp, "CDS verification time passed");

        // Mark CDS as accused
        cds.isAccused = true;

        // Emit event to notify admin of the request
        emit DefaultRequested(cdsID, msg.sender);
    }

    /**
     * @notice Admin verifies and accepts that the bond has defaulted.
     * @param cdsID The ID of the CDS to validate the default.
     */
    function acceptDefault(uint cdsID) external onlyAdmin {
        CDS storage cds = cdsContracts[cdsID];
        require(cds.isActive, "CDS is inactive");
        require(!cds.isClaimed, "CDS already claimed");

        _processClaim(cdsID);
        emit DefaultAccepted(cdsID, msg.sender);
    }

    /**
     * @notice Admin rejects the claim that the bond has defaulted.
     * @param cdsID The ID of the CDS to reject the default.
     */
    function rejectDefault(uint cdsID) external onlyAdmin {
        CDS storage cds = cdsContracts[cdsID];
        require(cds.isActive, "CDS is inactive");
        require(!cds.isClaimed, "Claim already processed");

        cds.isAccused = false;

        // The CDS remains active
        emit DefaultRejected(cdsID, msg.sender);
    }

    /**
     * @notice Process the CDS claim by transferring the protection amount to the buyer.
     * @param cdsID The ID of the CDS to claim.
     */
    function _processClaim(uint cdsID) internal {
        CDS storage cds = cdsContracts[cdsID];
        require(cds.isActive, "CDS already claimed or inactive");
        require(!cds.isClaimed, "Claim already processed");
                
        // Transfer protection amount to buyer
        Bond storage bond = bondsAndExpiration[cds.bondAddressAndExpiration];

        usdcToken.transfer(cds.buyer, bond.nextCouponAmount);
        cds.isClaimed = true;
        cds.isActive = false;

        emit CDSClaimed(cdsID, cds.buyer);
    }

    /**
     * @notice The CDS creator can recover their collateral if no accusation was made 5 days after the coupon expiration.
     * @param cdsID The ID of the CDS for which the collateral is being recovered.
     */
    function recoverCollateral(uint cdsID) external {
        CDS storage cds = cdsContracts[cdsID];
        require(cds.creator == msg.sender, "Only the CDS creator can recover collateral");
        require(cds.isActive, "CDS is not active");
        require(!cds.isAccused, "CDS has been accused of default");
        Bond storage bond= bondsAndExpiration[cds.bondAddressAndExpiration];
        require(block.timestamp > bond.nextCouponDate + 5 days, "Cannot recover collateral before 5 days after coupon expiration");

        cds.isActive = false;

        // Transfer the protection amount back to the creator
        usdcToken.transfer(cds.creator, bond.nextCouponAmount);

        emit CollateralRecovered(cdsID, cds.creator);
    }

    /**
     * @notice Adds a new bond to the system.
     * @param bondAddress Address of the bond.
     * @param nextCouponAmount Amount of the next coupon payment.
     * @param nextCouponDate Date of the next coupon.
     */
    function addBond(
        address bondAddress, 
        uint256 nextCouponAmount, 
        uint256 nextCouponDate
    ) external onlyAdmin returns (bytes32) {
        require(nextCouponDate > block.timestamp, "Next coupon date must be in the future");
        
        // Create a unique key by hashing the bond address and next coupon date together.
        bytes32 bondAndExpirationKey = keccak256(abi.encodePacked(bondAddress, nextCouponDate));

        // Store the bond information in the mapping using the hash as the key.
        bondsAndExpiration[bondAndExpirationKey] = Bond({
            bondAddress: bondAddress,
            nextCouponAmount: nextCouponAmount,
            nextCouponDate: nextCouponDate
        });
            emit BondAdded(bondAddress, nextCouponAmount, nextCouponDate,bondAndExpirationKey);
            return bondAndExpirationKey;
    }
    //View funcitons to interact with frontend
    function getBond(bytes32 bondAndExpiration) external view returns (address,uint,uint) {
         Bond memory bond=bondsAndExpiration[bondAndExpiration];
         return (bond.bondAddress,bond.nextCouponAmount,bond.nextCouponDate);
    }
    function getCDS(uint cdsID) external view returns (uint,bytes32,address,address,uint,bool,bool,bool) {
        CDS memory cds=cdsContracts[cdsID];
        return (cds.cdsID,cds.bondAddressAndExpiration,cds.creator,cds.buyer,cds.premium,cds.isActive,cds.isClaimed,cds.isAccused);
    }
}