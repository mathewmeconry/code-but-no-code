// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.16;

contract Challenge {
    bool public solved = false;

    function solve(address target, bytes memory data) external {
        require(bytes4(data) != 0x00133755);
        (bool success, bytes memory result) = target.call(data);
        require(success, "Call failed");
        require(bytes4(result) == 0x00133755);

        for (uint256 i = 0; i < 19; i++) {
            require(bytes20(target)[i] == 0);
        }

        solved = true;
    }
}
