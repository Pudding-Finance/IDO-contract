pragma solidity 0.6.12;

import "./libs/proxy/TransparentUpgradeableProxy.sol";

contract IDOUpgradeProxy is TransparentUpgradeableProxy {

    constructor(address admin, address logic, bytes memory data) TransparentUpgradeableProxy(logic, admin, data) public {

    }

}