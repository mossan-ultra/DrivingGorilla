// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interface/IGoriToken.sol";
import "@thirdweb-dev/contracts/extension/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "hardhat/console.sol";

// 運転データを登録するコントラクト
// ミント条件に一致した場合はトークンをERC1155トークンをミントする
contract Drive is Ownable {
    mapping(uint256 => uint256) public locations;
    uint256[] public locationKeys;
    uint256 internal totalLocations;

    IGoriToken private goritoken;
    uint256 public constant EcoDriveBoundary = 60; //エコドライブレベルのトークンを払い出す境界値
    uint256 public constant EcoDriveReward = 1 ether; //エコドライブを達成した時に払い出すトークンの量
    uint256 public constant SafeDriveBoundary = 70; //安全運転レベルのトークンを払い出す境界値
    uint256 public constant SafeDriveReward = 1 ether; //安全運転レベルを達成した時に払い出すトークンの量
    uint256 public constant RefuelingReward = 1 ether; //一度の給油に対して払い出すトークンの量
    uint256 public constant DistanceBoundary = 100; //運転距離に対してトークンを払い出す境界値
    uint256 public constant DistanceReward = 1 ether; //運転距離を達成した場合に払い出すトークンの量
    uint256 public constant TimeBoundary = 100; //運転時間に対してトークンを払い出す境界値
    uint256 public constant TimeReward = 1 ether; //運転時間に対して払い出すトークンの量

    // RewardトークンのID
    uint256 public constant TokenIdDrivingTime = 1; //運転時間
    uint256 public constant TokenIdEcoDrive = 2; //エコドライブ
    uint256 public constant TokenIdDrivingDistance = 3; //運転距離
    uint256 public constant TokenIdSafeDrive = 4; //安全運転
    uint256 public constant TokenIdRefueling = 5; //給油

    constructor(IGoriToken _goriToken) {
        goritoken = _goriToken;
        _setupOwner(msg.sender);
    }

    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    // 初期設定用
    // ERC1155コントラクトを切り替える
    function changeGoriTokenContract(IGoriToken _goriToken) public onlyOwner {
        goritoken = _goriToken;
    }

    // 初期設定用
    // 装備NFTをミントするロケーションを追加する
    function addLocation(uint256 point, uint mintId) external onlyOwner {
        locationKeys.push(point);
        locations[point] = mintId;
        totalLocations++;
    }

    // 装備NFTが登録されている一覧を取得する
    function getLocations() external view returns (uint256[] memory) {
        return locationKeys;
    }

    // 運転データを登録する
    function drivedata(
        address from,
        uint ecolevel,
        uint safelevel,
        uint refuelingCount,
        uint distance,
        uint time,
        uint256[] memory _locations
    ) external {
        if (safelevel > SafeDriveBoundary) {
            goritoken.mint(from, TokenIdSafeDrive, SafeDriveReward);
        }
        if (ecolevel > EcoDriveBoundary) {
            goritoken.mint(from, TokenIdEcoDrive, EcoDriveReward);
        }
        if (distance > DistanceBoundary) {
            goritoken.mint(from, TokenIdDrivingDistance, DistanceReward);
        }
        if (time > TimeBoundary) {
            goritoken.mint(from, TokenIdDrivingTime, TimeReward);
        }
        if (refuelingCount > 0) {
            goritoken.mint(
                from,
                TokenIdRefueling,
                refuelingCount * RefuelingReward
            );
        }
        for (uint256 i; i < _locations.length; ++i) {
            uint256 tokenid = locations[_locations[i]];
            if (tokenid > 0) {
                goritoken.mint(from, tokenid, 1);
            }
        }
    }
}
