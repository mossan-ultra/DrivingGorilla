// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IGoriStaking {
    function multiStake(
        uint256 location,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        uint256 period,
        address staker
    ) external;

    function isComplete(
        uint256 location,
        address staker
    ) external view returns (bool);

    function getEscapeBlock(
        uint256 location,
        address staker
    ) external view returns (bool, uint256);

    function claimRewards(uint256 location, address staker) external;
}
