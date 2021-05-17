pragma solidity 0.6.12;

import "./token/ORC20/ORC20.sol";

contract MockORC20 is ORC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public ORC20(name, symbol) {
        _mint(msg.sender, supply);

    }
}