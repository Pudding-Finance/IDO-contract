pragma solidity 0.6.12;

contract MockUserProfile {
    bool public avatar = true;

    function hasAvatar(address _address) external view returns (bool) {
        return avatar;
    }

    function setAvatar(bool _avatar) external {
        avatar = _avatar;
    }
}
