// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Golib {
    function formatJson(
        string memory key,
        string memory value
    ) internal pure returns (bytes memory) {
        return abi.encodePacked('"', key, '":"', value, '"');
    }
}
