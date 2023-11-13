// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@thirdweb-dev/contracts/eip/interface/IERC1155Receiver.sol";
import "@thirdweb-dev/contracts/eip/ERC165.sol";
import "@thirdweb-dev/contracts/extension/Ownable.sol";
import "@thirdweb-dev/contracts/eip/interface/IERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// simple ERC1155 staking
contract GoriStaking2 is Ownable, ERC165, IERC1155Receiver {
    /// @dev Emitted when tokens are staked.
    event TokensStaked(
        address indexed staker,
        uint256 indexed tokenId,
        uint256 amount
    );

    /// @dev Emitted when a set of staked token-ids are withdrawn.
    event TokensWithdrawn(
        address indexed staker,
        uint256 indexed tokenId,
        uint256 amount
    );

    /// @dev Emitted when a staker claims staking rewards.
    event RewardsClaimed(address indexed staker, uint256 rewardAmount);

    /// @dev Emitted when contract admin updates timeUnit.
    event UpdatedTimeUnit(
        uint256 indexed _tokenId,
        uint256 oldTimeUnit,
        uint256 newTimeUnit
    );
    /**
     *  @notice Staking Condition.
     *
     *  @param timeUnit           Unit of time specified in number of seconds. Can be set as 1 seconds, 1 days, 1 hours, etc.
     *
     *  @param rewardsPerUnitTime Rewards accumulated per unit of time.
     *
     *  @param startTimestamp     Condition start timestamp.
     *
     *  @param endTimestamp       Condition end timestamp.
     */
    struct StakingCondition {
        uint80 timeUnit;
        uint80 startTimestamp;
        uint80 endTimestamp;
        uint256 rewardsPerUnitTime;
    }

    /// @dev Emitted when contract admin updates timeUnit.
    event UpdatedDefaultTimeUnit(uint256 oldTimeUnit, uint256 newTimeUnit);

    ///@dev Address of ERC1155 contract -- staked tokens belong to this contract.
    address public stakingToken;

    /// @dev Flag to check direct transfers of staking tokens.
    uint8 internal isStaking = 1;

    ///@dev Next staking condition Id. Tracks number of conditon updates so far.
    uint64 private nextDefaultConditionId;

    ///@dev List of token-ids ever staked.
    uint256[] public indexedTokens;

    ///@dev Mapping from token-id to whether it is indexed or not.
    mapping(uint256 => bool) public isIndexed;

    ///@dev Mapping from default condition-id to default condition.
    mapping(uint64 => StakingCondition) private defaultCondition;

    ///@dev Mapping from token-id to next staking condition Id for the token. Tracks number of conditon updates so far.
    mapping(uint256 => uint64) private nextConditionId;

    ///@dev Mapping from token-id and staker address to Staker struct. See {struct IStaking1155.Staker}.
    mapping(uint256 => mapping(address => Staker)) public stakers;

    ///@dev Mapping from token-id and condition Id to staking condition. See {struct IStaking1155.StakingCondition}
    mapping(uint256 => mapping(uint64 => StakingCondition))
        private stakingConditions;

    /// @dev Mapping from token-id to list of accounts that have staked that token-id.
    mapping(uint256 => address[]) public stakersArray;
    /// @dev Total amount of reward tokens in the contract.
    uint256 private rewardTokenBalance;

    /// @dev Emitted when contract admin updates rewardsPerUnitTime.
    event UpdatedDefaultRewardsPerUnitTime(
        uint256 oldRewardsPerUnitTime,
        uint256 newRewardsPerUnitTime
    );

    /**
     *  @notice Staker Info.
     *
     *  @param amountStaked             Total number of tokens staked by the staker.
     *
     *  @param timeOfLastUpdate         Last reward-update timestamp.
     *
     *  @param unclaimedRewards         Rewards accumulated but not claimed by user yet.
     *
     *  @param conditionIdOflastUpdate  Condition-Id when rewards were last updated for user.
     */
    struct Staker {
        uint64 conditionIdOflastUpdate;
        uint64 amountStaked;
        uint128 timeOfLastUpdate;
        uint256 unclaimedRewards;
    }

    constructor(address _defaultAdmin, address _stakingToken) {
        require(address(_stakingToken) != address(0), "address 0");
        _setupOwner(_defaultAdmin);
        stakingToken = _stakingToken;
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
        // require(isStaking == 2, "Direct transfer");
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

    /*//////////////////////////////////////////////////////////////
                        Minting logic
    //////////////////////////////////////////////////////////////*/

    // /**
    //  *  @dev    Mint ERC20 rewards to the staker. Override for custom logic.
    //  *
    //  *  @param _staker    Address for which to calculated rewards.
    //  *  @param _rewards   Amount of tokens to be given out as reward.
    //  *
    //  */
    // function _mintRewards(
    //     address _staker,
    //     uint256 _rewards
    // ) internal virtual override {
    //     require(_rewards <= rewardTokenBalance, "Not enough reward tokens");
    //     rewardTokenBalance -= _rewards;
    //     CurrencyTransferLib.transferCurrencyWithWrapper(
    //         rewardToken,
    //         address(this),
    //         _staker,
    //         _rewards,
    //         nativeTokenWrapper
    //     );
    // }

    /// @dev Returns whether owner can be set in the given execution context.
    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    /*///////////////////////////////////////////////////////////////
                            Internal Functions
    //////////////////////////////////////////////////////////////*/

    /// @dev Staking logic. Override to add custom logic.
    function _stake(uint256 _tokenId, uint64 _amount) internal virtual {
        require(_amount != 0, "Staking 0 tokens");

        if (stakers[_tokenId][_stakeMsgSender()].amountStaked > 0) {
            _updateUnclaimedRewardsForStaker(_tokenId, _stakeMsgSender());
        } else {
            stakersArray[_tokenId].push(_stakeMsgSender());
            stakers[_tokenId][_stakeMsgSender()].timeOfLastUpdate = uint80(
                block.timestamp
            );

            uint64 _conditionId = nextConditionId[_tokenId];
            unchecked {
                stakers[_tokenId][_stakeMsgSender()]
                    .conditionIdOflastUpdate = _conditionId == 0
                    ? nextDefaultConditionId - 1
                    : _conditionId - 1;
            }
        }

        isStaking = 2;
        IERC1155(stakingToken).safeTransferFrom(
            _stakeMsgSender(),
            address(this),
            _tokenId,
            _amount,
            ""
        );
        isStaking = 1;
        // stakerAddress[_tokenIds[i]] = _stakeMsgSender();
        stakers[_tokenId][_stakeMsgSender()].amountStaked += _amount;

        if (!isIndexed[_tokenId]) {
            isIndexed[_tokenId] = true;
            indexedTokens.push(_tokenId);
        }

        emit TokensStaked(_stakeMsgSender(), _tokenId, _amount);
    }

    /// @dev Withdraw logic. Override to add custom logic.
    function _withdraw(uint256 _tokenId, uint64 _amount) internal virtual {
        uint256 _amountStaked = stakers[_tokenId][_stakeMsgSender()]
            .amountStaked;
        require(_amount != 0, "Withdrawing 0 tokens");
        require(_amountStaked >= _amount, "Withdrawing more than staked");

        _updateUnclaimedRewardsForStaker(_tokenId, _stakeMsgSender());

        if (_amountStaked == _amount) {
            address[] memory _stakersArray = stakersArray[_tokenId];
            for (uint256 i = 0; i < _stakersArray.length; ++i) {
                if (_stakersArray[i] == _stakeMsgSender()) {
                    stakersArray[_tokenId][i] = _stakersArray[
                        _stakersArray.length - 1
                    ];
                    stakersArray[_tokenId].pop();
                    break;
                }
            }
        }
        stakers[_tokenId][_stakeMsgSender()].amountStaked -= _amount;

        IERC1155(stakingToken).safeTransferFrom(
            address(this),
            _stakeMsgSender(),
            _tokenId,
            _amount,
            ""
        );

        emit TokensWithdrawn(_stakeMsgSender(), _tokenId, _amount);
    }

    /// @dev Logic for claiming rewards. Override to add custom logic.
    function _claimRewards(uint256 _tokenId) internal virtual {
        uint256 rewards = stakers[_tokenId][_stakeMsgSender()]
            .unclaimedRewards + _calculateRewards(_tokenId, _stakeMsgSender());

        require(rewards != 0, "No rewards");

        stakers[_tokenId][_stakeMsgSender()].timeOfLastUpdate = uint80(
            block.timestamp
        );
        stakers[_tokenId][_stakeMsgSender()].unclaimedRewards = 0;

        uint64 _conditionId = nextConditionId[_tokenId];

        unchecked {
            stakers[_tokenId][_stakeMsgSender()]
                .conditionIdOflastUpdate = _conditionId == 0
                ? nextDefaultConditionId - 1
                : _conditionId - 1;
        }

        _mintRewards(_stakeMsgSender(), rewards);

        emit RewardsClaimed(_stakeMsgSender(), rewards);
    }

    /// @dev View available rewards for a user.
    function _availableRewards(
        uint256 _tokenId,
        address _user
    ) internal view virtual returns (uint256 _rewards) {
        if (stakers[_tokenId][_user].amountStaked == 0) {
            _rewards = stakers[_tokenId][_user].unclaimedRewards;
        } else {
            _rewards =
                stakers[_tokenId][_user].unclaimedRewards +
                _calculateRewards(_tokenId, _user);
        }
    }

    /// @dev Update unclaimed rewards for a users. Called for every state change for a user.
    function _updateUnclaimedRewardsForStaker(
        uint256 _tokenId,
        address _staker
    ) internal virtual {
        uint256 rewards = _calculateRewards(_tokenId, _staker);
        stakers[_tokenId][_staker].unclaimedRewards += rewards;
        stakers[_tokenId][_staker].timeOfLastUpdate = uint80(block.timestamp);

        uint64 _conditionId = nextConditionId[_tokenId];
        unchecked {
            stakers[_tokenId][_staker].conditionIdOflastUpdate = _conditionId ==
                0
                ? nextDefaultConditionId - 1
                : _conditionId - 1;
        }
    }

    /// @dev Set staking conditions, for a token-Id.
    function _setStakingCondition(
        uint256 _tokenId,
        uint80 _timeUnit,
        uint256 _rewardsPerUnitTime
    ) internal virtual {
        require(_timeUnit != 0, "time-unit can't be 0");
        uint64 conditionId = nextConditionId[_tokenId];

        if (conditionId == 0) {
            uint64 _nextDefaultConditionId = nextDefaultConditionId;
            for (; conditionId < _nextDefaultConditionId; conditionId += 1) {
                StakingCondition memory _defaultCondition = defaultCondition[
                    conditionId
                ];

                stakingConditions[_tokenId][conditionId] = StakingCondition({
                    timeUnit: _defaultCondition.timeUnit,
                    rewardsPerUnitTime: _defaultCondition.rewardsPerUnitTime,
                    startTimestamp: _defaultCondition.startTimestamp,
                    endTimestamp: _defaultCondition.endTimestamp
                });
            }
        }

        stakingConditions[_tokenId][conditionId - 1].endTimestamp = uint80(
            block.timestamp
        );

        stakingConditions[_tokenId][conditionId] = StakingCondition({
            timeUnit: _timeUnit,
            rewardsPerUnitTime: _rewardsPerUnitTime,
            startTimestamp: uint80(block.timestamp),
            endTimestamp: 0
        });

        nextConditionId[_tokenId] = conditionId + 1;
    }

    /// @dev Set default staking conditions.
    function _setDefaultStakingCondition(
        uint80 _timeUnit,
        uint256 _rewardsPerUnitTime
    ) internal virtual {
        require(_timeUnit != 0, "time-unit can't be 0");
        uint64 conditionId = nextDefaultConditionId;
        nextDefaultConditionId += 1;

        defaultCondition[conditionId] = StakingCondition({
            timeUnit: _timeUnit,
            rewardsPerUnitTime: _rewardsPerUnitTime,
            startTimestamp: uint80(block.timestamp),
            endTimestamp: 0
        });

        if (conditionId > 0) {
            defaultCondition[conditionId - 1].endTimestamp = uint80(
                block.timestamp
            );
        }
    }

    /// @dev Reward calculation logic. Override to implement custom logic.
    function _calculateRewards(
        uint256 _tokenId,
        address _staker
    ) internal view virtual returns (uint256 _rewards) {
        Staker memory staker = stakers[_tokenId][_staker];
        uint64 _stakerConditionId = staker.conditionIdOflastUpdate;
        uint64 _nextConditionId = nextConditionId[_tokenId];

        if (_nextConditionId == 0) {
            _nextConditionId = nextDefaultConditionId;

            for (uint64 i = _stakerConditionId; i < _nextConditionId; i += 1) {
                StakingCondition memory condition = defaultCondition[i];

                uint256 startTime = i != _stakerConditionId
                    ? condition.startTimestamp
                    : staker.timeOfLastUpdate;
                uint256 endTime = condition.endTimestamp != 0
                    ? condition.endTimestamp
                    : block.timestamp;

                (bool noOverflowProduct, uint256 rewardsProduct) = SafeMath
                    .tryMul(
                        (endTime - startTime) * staker.amountStaked,
                        condition.rewardsPerUnitTime
                    );
                (bool noOverflowSum, uint256 rewardsSum) = SafeMath.tryAdd(
                    _rewards,
                    rewardsProduct / condition.timeUnit
                );

                _rewards = noOverflowProduct && noOverflowSum
                    ? rewardsSum
                    : _rewards;
            }
        } else {
            for (uint64 i = _stakerConditionId; i < _nextConditionId; i += 1) {
                StakingCondition memory condition = stakingConditions[_tokenId][
                    i
                ];

                uint256 startTime = i != _stakerConditionId
                    ? condition.startTimestamp
                    : staker.timeOfLastUpdate;
                uint256 endTime = condition.endTimestamp != 0
                    ? condition.endTimestamp
                    : block.timestamp;

                (bool noOverflowProduct, uint256 rewardsProduct) = SafeMath
                    .tryMul(
                        (endTime - startTime) * staker.amountStaked,
                        condition.rewardsPerUnitTime
                    );
                (bool noOverflowSum, uint256 rewardsSum) = SafeMath.tryAdd(
                    _rewards,
                    rewardsProduct / condition.timeUnit
                );

                _rewards = noOverflowProduct && noOverflowSum
                    ? rewardsSum
                    : _rewards;
            }
        }
    }

    /**
     *  @dev    Mint ERC20 rewards to the staker. Override for custom logic.
     *
     *  @param _staker    Address for which to calculated rewards.
     *  @param _rewards   Amount of tokens to be given out as reward.
     *
     */
    function _mintRewards(address _staker, uint256 _rewards) internal virtual {
        require(_rewards <= rewardTokenBalance, "Not enough reward tokens");
        rewardTokenBalance -= _rewards;
        // CurrencyTransferLib.transferCurrencyWithWrapper(
        //     rewardToken,
        //     address(this),
        //     _staker,
        //     _rewards,
        //     nativeTokenWrapper
        // );
    }

    /*////////////////////////////////////////////////////////////////////
        Optional hooks that can be implemented in the derived contract
    ///////////////////////////////////////////////////////////////////*/

    /// @dev Exposes the ability to override the msg sender -- support ERC2771.
    function _stakeMsgSender() internal virtual returns (address) {
        return msg.sender;
    }
}
