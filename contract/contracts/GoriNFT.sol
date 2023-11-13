// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interface/IERC6672.sol";
import "./interface/IGoriNFT.sol";

// 交換券用NFT
// ミントできるのはGoriToken側からのみとする
// ERC6672に対応し、交換したことを記録できる
contract GoriNFT is
    ERC721URIStorage,
    Ownable,
    AccessControl,
    IERC6672,
    IGoriNFT
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    using EnumerableSet for EnumerableSet.Bytes32Set;

    bytes4 public constant IERC6672_ID = type(IERC6672).interfaceId;

    mapping(address => mapping(uint256 => mapping(bytes32 => bool))) redemptionStatus;
    mapping(address => mapping(uint256 => mapping(bytes32 => string)))
        public memos;
    mapping(address => mapping(uint256 => EnumerableSet.Bytes32Set)) redemptions;
    uint256 nextMintTokenId = 0;

    constructor() ERC721("GoriNFT", "GNFT") {}

    function addMinter(address minter) public onlyOwner {
        _grantRole(MINTER_ROLE, minter);
    }

    function mint(
        address to,
        string memory tokenURI
    ) external onlyRole(MINTER_ROLE) {
        _safeMint(to, nextMintTokenId);
        _setTokenURI(nextMintTokenId, tokenURI);
        nextMintTokenId++;
    }

    function isRedeemed(
        address _operator,
        bytes32 _redemptionId,
        uint256 _tokenId
    ) external view returns (bool) {
        return _isRedeemed(_operator, _redemptionId, _tokenId);
    }

    function getRedemptionIds(
        address _operator,
        uint256 _tokenId
    ) external view returns (bytes32[] memory) {
        require(
            redemptions[_operator][_tokenId].length() > 0,
            "ERC6672: token doesn't have any redemptions."
        );
        return redemptions[_operator][_tokenId].values();
    }

    function redeem(
        bytes32 _redemptionId,
        uint256 _tokenId,
        string memory _memo
    ) external {
        address _operator = msg.sender;
        require(
            !_isRedeemed(_operator, _redemptionId, _tokenId),
            "ERC6672: token already redeemed."
        );
        _update(_operator, _redemptionId, _tokenId, _memo, true);
        redemptions[_operator][_tokenId].add(_redemptionId);
        emit Redeem(
            _operator,
            _tokenId,
            ownerOf(_tokenId),
            _redemptionId,
            _memo
        );
    }

    function cancel(
        bytes32 _redemptionId,
        uint256 _tokenId,
        string memory _memo
    ) external {
        address _operator = msg.sender;
        require(
            _isRedeemed(_operator, _redemptionId, _tokenId),
            "ERC6672: token doesn't redeemed."
        );
        _update(_operator, _redemptionId, _tokenId, _memo, false);
        _removeRedemption(_operator, _redemptionId, _tokenId);
        emit Cancel(_operator, _tokenId, _redemptionId, _memo);
    }

    function _isRedeemed(
        address _operator,
        bytes32 _redemptionId,
        uint256 _tokenId
    ) internal view returns (bool) {
        require(_exists(_tokenId), "ERC6672: token doesn't exists.");
        return redemptionStatus[_operator][_tokenId][_redemptionId];
    }

    function _update(
        address _operator,
        bytes32 _redemptionId,
        uint256 _tokenId,
        string memory _memo,
        bool isRedeemed_
    ) internal {
        redemptionStatus[_operator][_tokenId][_redemptionId] = isRedeemed_;
        memos[_operator][_tokenId][_redemptionId] = _memo;
        if (isRedeemed_) {
            emit Redeem(
                _operator,
                _tokenId,
                ownerOf(_tokenId),
                _redemptionId,
                _memo
            );
        } else {
            emit Cancel(_operator, _tokenId, _redemptionId, _memo);
        }
    }

    function _removeRedemption(
        address _operator,
        bytes32 _redemptionId,
        uint256 _tokenId
    ) internal {
        redemptions[_operator][_tokenId].remove(_redemptionId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC6672).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
