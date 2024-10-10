// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BondToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    mapping(address => bool) private _frozen;
    uint256 public constant FACE_VALUE = 100 * 10**18; // 100$ in wei
    bool private _paused;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(FREEZER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(!_paused, "BondToken: token minting while paused");
        require(!_frozen[to], "BondToken: account is frozen");
        _mint(to, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _paused = true;
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _paused = false;
    }

    function freezeAccount(address account) public onlyRole(FREEZER_ROLE) {
        _frozen[account] = true;
    }

    function unfreezeAccount(address account) public onlyRole(FREEZER_ROLE) {
        _frozen[account] = false;
    }

    function forceTransfer(address from, address to, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_paused, "BondToken: token transfer while paused");
        require(!_frozen[from] && !_frozen[to], "BondToken: account is frozen");
        _transfer(from, to, amount);
    }

    function addMinter(address minter) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(!_paused, "BondToken: token transfer while paused");
        require(!_frozen[_msgSender()] && !_frozen[to], "BondToken: account is frozen");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(!_paused, "BondToken: token transfer while paused");
        require(!_frozen[from] && !_frozen[to], "BondToken: account is frozen");
        return super.transferFrom(from, to, amount);
    }

    function burn(uint256 amount) public virtual {
        require(!_paused, "BondToken: token burning while paused");
        require(!_frozen[_msgSender()], "BondToken: account is frozen");
        _burn(_msgSender(), amount);
    }

    function burnFrom(address account, uint256 amount) public virtual {
        require(!_paused, "BondToken: token burning while paused");
        require(!_frozen[account], "BondToken: account is frozen");
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
}