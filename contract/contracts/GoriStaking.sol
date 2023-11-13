// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@thirdweb-dev/contracts/eip/interface/IERC1155Receiver.sol";
import "@thirdweb-dev/contracts/eip/ERC165.sol";
import "@thirdweb-dev/contracts/extension/Ownable.sol";
import "@thirdweb-dev/contracts/eip/interface/IERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/security/ReentrancyGuard.sol";
import "./interface/IGoriStaking.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/metatx/ERC2771ContextUpgradeable.sol";

// Goriトークンをステーキングできる
// ステーキング期間が完了するとERC1155トークンを払い出す
// ステーキング期間中に一定確率で脱獄する
// 脱獄した場合、ステーキング報酬を払い出すことはできない
contract GoriStaking is
    Ownable,
    ERC165,
    IERC1155Receiver,
    ReentrancyGuard,
    IGoriStaking,
    ERC2771ContextUpgradeable
{
    event TokensStaked(
        address indexed staker,
        uint256 indexed tokenId,
        uint256 amount
    );

    struct StakingCondition {
        uint80 timeUnit;
        uint80 startTimestamp;
        uint80 endTimestamp;
        uint256 rewardRatioNumerator;
        uint256 rewardRatioDenominator;
    }

    address public stakingToken;
    uint64 private nextConditionId;
    mapping(uint256 => mapping(address => Staker)) public stakers;
    mapping(uint256 => StakingCondition) private stakingConditions;
    mapping(uint256 => address[]) public stakersArray;

    struct Staker {
        uint128 timeOfLastUpdate;
        uint256 period;
        uint256[] tokenIds;
        mapping(uint256 => uint256) rewards;
        mapping(uint256 => uint256) amountStaked;
        bool registerd;
        uint256 start;
        uint256 end;
    }

    constructor(
        uint80 _timeUnit,
        address _defaultAdmin,
        uint256 _rewardRatioNumerator,
        uint256 _rewardRatioDenominator,
        address _stakingToken
    ) {
        require(address(_stakingToken) != address(0), "address 0");
        _setupOwner(_defaultAdmin);
        _setStakingCondition(
            _timeUnit,
            _rewardRatioNumerator,
            _rewardRatioDenominator
        );
        stakingToken = _stakingToken;
    }

    // 初期設定用
    // 連携するERC1155のコントラクトを登録する
    function changeStakingToken(address stakingToken_) external {
        require(address(stakingToken_) != address(0), "address 0");
        stakingToken = stakingToken_;
    }

    // ステーキング期間が完了したか判断する
    function isComplete(
        uint256 location,
        address staker
    ) external view returns (bool) {
        return stakers[location][staker].end <= block.number;
    }

    // 脱獄したこと＆脱獄ブロックを取得する
    function getEscapeBlock(
        uint256 location,
        address staker
    ) external view returns (bool, uint256) {
        require(stakers[location][staker].start > 0, "start 0");
        uint256 endBlock = block.number > stakers[location][staker].end
            ? stakers[location][staker].end
            : block.number;
        return _judgementEscape(stakers[location][staker].start, endBlock);
    }

    // 複数のtokenIDを同時にステーキングする
    function multiStake(
        uint256 location,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        uint256 period,
        address staker
    ) external nonReentrant {
        _multiStake(location, _tokenIds, _amounts, period, staker);
    }

    // ステーキング報酬を払い出す
    function claimRewards(
        uint256 location,
        address staker
    ) external nonReentrant {
        _claimRewards(location, staker);
    }

    /*///////////////////////////////////////////////////////////////
                        ERC 165 / 721 logic
    //////////////////////////////////////////////////////////////*/

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external view returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual returns (bytes4) {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // ステーキング報酬を確認する
    function getRewardTokenBalance(
        uint256 location,
        address staker
    ) external view virtual returns (uint256[] memory, uint256[] memory) {
        uint256[] memory rewards = new uint256[](
            stakers[location][staker].tokenIds.length
        );
        for (uint i; i < rewards.length; i++) {
            uint256 tokenId = stakers[location][staker].tokenIds[i];
            rewards[i] = stakers[location][staker].rewards[tokenId];
        }

        return (stakers[location][staker].tokenIds, rewards);
    }

    // ステーキング完了ブロックを取得する
    function getStatkingFinishBlock(
        uint256 location,
        address staker
    ) external view virtual returns (uint256) {
        return
            stakers[location][staker].timeOfLastUpdate +
            stakers[location][staker].period;
    }

    /*//////////////////////////////////////////////////////////////
                        Minting logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Returns whether owner can be set in the given execution context.
    /*///////////////////////////////////////////////////////////////
                            Internal Functions
    //////////////////////////////////////////////////////////////*/
    function _multiStake(
        uint256 tokenId,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        uint256 period,
        address staker
    ) internal virtual {
        require(_amounts.length == _tokenIds.length, "Parameter Error");
        // require(!stakers[location][staker].registerd, "Already staked");
        uint256 len = _amounts.length;
        for (uint256 i; i < len; ++i) {
            require(_amounts[i] != 0, "Staking 0 tokens");
            require(
                IERC1155(stakingToken).balanceOf(staker, _tokenIds[i]) >=
                    _amounts[i],
                "Insufficient amount"
            );
        }
        stakers[tokenId][staker].timeOfLastUpdate = uint80(block.number);
        stakers[tokenId][staker].period = uint80(period);
        stakers[tokenId][staker].start = block.number;
        stakers[tokenId][staker].end = block.number + period;
        stakers[tokenId][staker].registerd = true;
        stakers[tokenId][staker].tokenIds = _tokenIds;
        for (uint256 i; i < len; ++i) {
            uint256 _tokenId = _tokenIds[i];
            uint256 _amount = _amounts[i];

            stakersArray[_tokenId].push(staker);
            uint256 rewards = _calculateRewards(
                tokenId,
                _tokenId,
                staker,
                _amount
            );

            IERC1155(stakingToken).safeTransferFrom(
                staker,
                address(this),
                _tokenId,
                _amount,
                ""
            );
            stakers[tokenId][staker].amountStaked[_tokenId] += _amount;
            stakers[tokenId][staker].rewards[_tokenId] += rewards + _amount;

            emit TokensStaked(staker, _tokenId, _amount);
        }
    }

    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    function _calculateRewards(
        uint256 tokenId,
        uint256 _tokenId,
        address _staker,
        uint256 _amount
    ) internal view virtual returns (uint256 _rewards) {
        Staker storage staker = stakers[tokenId][_staker];
        uint256 endTime = staker.timeOfLastUpdate + staker.period;
        uint256 startTime = staker.timeOfLastUpdate;
        StakingCondition memory condition = stakingConditions[0];

        (bool noOverflowProduct, uint256 rewardsProduct) = SafeMath.tryMul(
            (endTime - startTime) * _amount,
            condition.rewardRatioNumerator
        );

        (bool noOverflowSum, uint256 rewardsSum) = SafeMath.tryAdd(
            _rewards,
            (rewardsProduct / condition.timeUnit) /
                condition.rewardRatioDenominator
        );

        _rewards = noOverflowProduct && noOverflowSum ? rewardsSum : _rewards;

        return _rewards;
    }

    function _setStakingCondition(
        uint80 _timeUnit,
        uint256 _numerator,
        uint256 _denominator
    ) internal virtual {
        require(_denominator != 0, "divide by 0");
        require(_timeUnit != 0, "time-unit can't be 0");
        uint256 conditionId = nextConditionId;
        nextConditionId += 1;

        stakingConditions[conditionId] = StakingCondition({
            timeUnit: _timeUnit,
            rewardRatioNumerator: _numerator,
            rewardRatioDenominator: _denominator,
            startTimestamp: uint80(block.number),
            endTimestamp: 0
        });

        if (conditionId > 0) {
            stakingConditions[conditionId - 1].endTimestamp = uint80(
                block.number
            );
        }
    }

    function _claimRewards(uint256 location, address staker) internal virtual {
        uint256[] memory tokenIds = stakers[location][staker].tokenIds;
        uint256 length = tokenIds.length;
        for (uint i; i < length; i++) {
            require(
                stakers[location][staker].rewards[tokenIds[i]] != 0,
                "No rewards"
            );
        }
        uint256[] memory rewards = new uint256[](length);
        for (uint i; i < length; i++) {
            rewards[i] = stakers[location][staker].rewards[tokenIds[i]];
        }

        _mintRewards(tokenIds, rewards, staker);
    }

    function _judgementEscape(
        uint256 startBlock,
        uint256 endBlock
    ) internal pure returns (bool, uint256) {
        // ver1 重すぎて動かない…。
        // uint256 loopEnd = endBlock;
        // uint256 interval = (loopEnd - startBlock) / 1000;
        // uint256 mask = 0x3FFF;
        // console.log(
        //     "startBlock %s , endBlock %s, mask %s",
        //     startBlock,
        //     endBlock,
        //     mask
        // );
        // for (uint256 i = startBlock; i < loopEnd; i += interval) {
        //     uint256 num = uint256(keccak256(abi.encodePacked(i)));
        //     if (num & mask == 0) {
        //         console.log("escapeBlock %s , %s", i, num);
        //         return (true, num);
        //     }
        // }

        // ver2　超簡易版にする
        uint256 judgementBlock = startBlock + 1;
        uint256 num = uint256(keccak256(abi.encodePacked(judgementBlock)));
        return (num & 0x01 == 0, judgementBlock);
    }

    function _mintRewards(
        uint256[] memory _tokenId,
        uint256[] memory _rewards,
        address _staker
    ) internal {
        for (uint i; i < _tokenId.length; i++) {
            require(
                _rewards[i] <=
                    IERC1155(stakingToken).balanceOf(
                        address(this),
                        _tokenId[i]
                    ),
                "Not enough reward tokens"
            );
        }
        for (uint i; i < _tokenId.length; i++) {
            IERC1155(stakingToken).safeTransferFrom(
                address(this),
                _staker,
                _tokenId[i],
                _rewards[i],
                ""
            );
        }
    }

    /*////////////////////////////////////////////////////////////////////
        Optional hooks that can be implemented in the derived contract
    ///////////////////////////////////////////////////////////////////*/

    function _stakeMsgSender()
        internal
        virtual
        returns (
            // address staker
            address
        )
    {
        return tx.origin;
    }

    /// @dev See ERC2771
    function _msgSender()
        internal
        view
        virtual
        override
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @dev See ERC2771
    function _msgData()
        internal
        view
        virtual
        override
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }
}
