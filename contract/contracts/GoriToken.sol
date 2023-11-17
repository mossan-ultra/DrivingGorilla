// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@thirdweb-dev/contracts/base/ERC1155Base.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interface/IGoriToken.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interface/IGoriStaking.sol";
import "./lib/Golib.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/metatx/ERC2771ContextUpgradeable.sol";
import "hardhat/console.sol";
import "@thirdweb-dev/contracts/base/ERC1155Base.sol";
import "./interface/IGoriNFT.sol";

// メインとなるERC1155コントラクト

contract GoriToken is ERC1155Base, IGoriToken, ERC2771ContextUpgradeable {
    // ここEnumでよいのでは？

    // Token IDルール
    // 0 - 100 予約
    // 1001 - 5000 装備NFT
    uint256 public constant TokenIdPartnerGori = 0; //相棒ゴリラ
    uint256 public constant TokenIdDrivingTime = 1; //運転時間
    uint256 public constant TokenIdEcoDrive = 2; //エコドライブ
    uint256 public constant TokenIdDrivingDistance = 3; //運転距離
    uint256 public constant TokenIdSafeDrive = 4; //安全運転
    uint256 public constant TokenIdRefueling = 5; //給油

    uint256 public constant TokenIdEquipmentMIN = 1001;
    uint256 public constant TokenIdEquipmentMAX = 5000;

    uint256 public constant TokenIdStayGori = 5001;
    uint256 public nextTokenIdStayGori = TokenIdStayGori;

    // おきゴリに分け与えるトークンボリュームの割合

    struct PartnarGoriMeta {
        string name;
        string createdAt;
        string imageUri;
    }
    struct EquipmentMeta {
        string name;
        string category;
        string description;
        string imageUri;
        uint256 driving;
        uint256 eco;
        uint256 distance;
        uint256 safe;
        uint256 refuling;
    }
    struct StayGoriMeta {
        string imageUri;
        uint256[] tokenIds;
        uint256[] amounts;
        uint256 period;
        uint256 createdAt;
        bool registerd;
        uint256 location;
    }

    mapping(address => PartnarGoriMeta) internal _gorimeta;
    mapping(uint256 => EquipmentMeta) internal equipments;
    mapping(address => mapping(uint256 => StayGoriMeta)) internal stayGori;
    mapping(uint256 => string) internal erc721tokenIds;

    event PartnerMinted(address owner);
    event EquipmentMinted(address indexed owner, uint256 tokenID);
    event StayGoriMinted(
        address owner,
        string imageUri,
        uint256 period,
        uint256 createdAt,
        bool registerd,
        uint256 location,
        uint256 tokenId
    );
    event EscapeGori(address owner, uint256 location, uint256 escapedAt);
    event CompleteStayGori(
        address owner,
        uint256 location,
        uint256 completedAt
    );

    IGoriStaking _goriStaking;
    IGoriNFT _goriNFT;

    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    )
        ERC1155Base(
            _defaultAdmin,
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps
        )
    {
        erc721tokenIds[
            1001
        ] = "https://ipfs.io/ipfs/bafybeien7r64cck6rd26o3ahtr32347ko2ipofhawpuzqt3n7o2lsptneq/1001.json";
    }

    // 初期設定用
    // ステーキングコントラクトを設定する
    function setGoriStaking(IGoriStaking goriStaking) public onlyOwner {
        _goriStaking = goriStaking;
    }

    // 初期設定用
    // 交換券発行NFTコントラクトを設定する
    function setGoriNFT(IGoriNFT goriNFT) public onlyOwner {
        _goriNFT = goriNFT;
    }

    // トークンをミントする
    function mint(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
        if (id >= TokenIdEquipmentMIN && id <= TokenIdEquipmentMAX) {
            emit EquipmentMinted(to, id);
        }
    }

    // 初期設定用
    // 装備NFTを登録する
    function addEquipment(
        uint256 tokenId,
        EquipmentMeta memory equipmentMeta
    ) external onlyOwner {
        equipments[tokenId] = equipmentMeta;
    }

    // 装備NFTを交換用NFTに変換する
    // 変換した装備NFTはバーンされる
    function toERC721(address from, uint256 tokenId) external {
        _burn(from, tokenId, 1);
        _goriNFT.mint(from, erc721tokenIds[tokenId]);
    }

    // 相棒ゴリラを初期化する
    function initializeGori(
        address from,
        string memory name,
        string memory createdAt,
        string memory imageUri
    ) external {
        _gorimeta[from] = PartnarGoriMeta({
            name: name,
            createdAt: createdAt,
            imageUri: imageUri
        });
    }

    // 相棒ゴリラの名前を変更する
    function updatePartnerGoriName(address from, string memory name) external {
        _gorimeta[from].name = name;
    }

    // 相棒ゴリラの画像を変更する
    function updatePartnerGoriImageUri(
        address from,
        string memory imageUri
    ) external {
        _gorimeta[from].imageUri = imageUri;
    }

    // 置き去りゴリラを生成する
    // ・新たな相棒ゴリをミントする
    // ・指定されたトークンをステーキングする
    function makeStayGori(
        address from,
        uint256 location,
        string memory imageUri,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 period
    ) external {
        uint256 mintTokenId = nextTokenIdStayGori;
        require(period > 0, "period is zero");
        require(!stayGori[from][mintTokenId].registerd, "Allready staked");

        _mint(from, mintTokenId, 1, "");
        _goriStaking.multiStake(mintTokenId, tokenIds, amounts, period, from);

        stayGori[from][mintTokenId] = StayGoriMeta({
            imageUri: imageUri,
            tokenIds: tokenIds,
            amounts: amounts,
            period: period,
            createdAt: block.number,
            registerd: true,
            location: location
        });

        emit StayGoriMinted(
            from,
            stayGori[from][mintTokenId].imageUri,
            stayGori[from][mintTokenId].period,
            stayGori[from][mintTokenId].createdAt,
            stayGori[from][mintTokenId].registerd,
            location,
            mintTokenId
        );
        nextTokenIdStayGori++;
    }

    // ステーキング期間が完了したおきゴリのファイナライズを行う
    // 脱獄した場合、ステーキングしたトークンはバーンされる
    // 脱獄していない場合、ステーキング報酬が当該ウォレットに転送される
    function completeStayGori(address from, uint256 tokenId) external {
        require(stayGori[from][tokenId].registerd, "not registered");
        require(_isStayGoriComplete(from, tokenId), "not completed yet");
        stayGori[from][tokenId].registerd = false;

        uint256 _escapeBlock = _getEscapeBlock(from, tokenId);
        if (_isEscape(from, tokenId)) {
            // 脱獄した場合はデポジットされたトークンをバーンする
            _burnBatch(
                address(_goriStaking),
                stayGori[from][tokenId].tokenIds,
                stayGori[from][tokenId].amounts
            );
            // 脱走したら登録を解除する
            emit EscapeGori(from, tokenId, _escapeBlock);
        } else {
            // 脱走してなかったら報酬を払い出す
            _goriStaking.claimRewards(tokenId, from);
            emit CompleteStayGori(from, tokenId, block.number);
        }
    }

    // おきゴリが登録されていることを確認する
    function isRegistered(
        address from,
        uint256 tokenId
    ) external view returns (bool) {
        return stayGori[from][tokenId].registerd;
    }

    // おきゴリステーキング期間が完了していることを確認する
    function isStayGoriComplete(
        address from,
        uint256 tokenId
    ) external view returns (bool) {
        require(stayGori[from][tokenId].registerd, "not registered");
        return _isStayGoriComplete(from, tokenId);
    }

    // おきゴリステーキングにデポジットしたトークン量を確認する
    function getStayGoriDepositToken(
        address from,
        uint256 tokenId
    ) external view returns (uint256[] memory, uint256[] memory) {
        require(stayGori[from][tokenId].registerd, "not registered");
        return (
            stayGori[from][tokenId].tokenIds,
            stayGori[from][tokenId].amounts
        );
    }

    // おきゴリが脱獄していないかチェックする
    function getEscape(
        address from,
        uint256 tokenId
    ) external view returns (bool, uint256) {
        require(stayGori[from][tokenId].registerd, "not registered");
        return _goriStaking.getEscapeBlock(tokenId, from);
    }

    // おきゴリのメタ情報を作成する
    function createMetaStayGori(
        address from,
        uint256 tokenId
    ) internal view returns (string memory) {
        require(stayGori[from][tokenId].registerd, "not registered");
        StayGoriMeta memory staygori = stayGori[from][tokenId];
        bytes memory bytesLocation = Golib.formatJson(
            "location",
            Strings.toString(staygori.location)
        );
        bytes memory bytesCreatedAt = Golib.formatJson(
            "createdAt",
            Strings.toString(staygori.createdAt)
        );
        bytes memory bytesImage = Golib.formatJson("image", staygori.imageUri);

        bytes memory bytesObject = abi.encodePacked(
            "{",
            bytesLocation,
            ",",
            bytesCreatedAt,
            ",",
            bytesImage,
            "}"
        );

        bytes memory bytesMetadata = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytesObject)
        );

        return (string(bytesMetadata));
    }

    // 装備NFTのメタ情報を作成する
    function createMetaEqupment(
        uint256 tokenID_
    ) internal view returns (string memory) {
        EquipmentMeta memory meta = equipments[tokenID_];

        bytes memory bytesName = Golib.formatJson("name", meta.name);
        bytes memory bytesDesc = Golib.formatJson(
            "description",
            meta.description
        );
        bytes memory bytesImage = Golib.formatJson("image", meta.imageUri);
        bytes memory bytesDriving = Golib.formatJson(
            "driving",
            Strings.toString(meta.driving)
        );
        bytes memory bytesEco = Golib.formatJson(
            "eco",
            Strings.toString(meta.eco)
        );
        bytes memory bytesDistance = Golib.formatJson(
            "distance",
            Strings.toString(meta.distance)
        );
        bytes memory bytesSafe = Golib.formatJson(
            "safe",
            Strings.toString(meta.safe)
        );
        bytes memory bytesRefuling = Golib.formatJson(
            "refuling",
            Strings.toString(meta.refuling)
        );
        bytes memory bytesCategory = Golib.formatJson(
            "category",
            meta.category
        );

        bytes memory bytesObject = abi.encodePacked(
            abi.encodePacked(
                "{",
                bytesName,
                ",",
                bytesDesc,
                ",",
                bytesImage,
                ",",
                bytesDriving,
                ",",
                bytesEco,
                ",",
                bytesDistance,
                ",",
                bytesSafe,
                ","
            ),
            abi.encodePacked(bytesRefuling, ",", bytesCategory, "}")
        );

        bytes memory bytesMetadata = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytesObject)
        );

        return (string(bytesMetadata));
    }

    // 相棒ゴリのメタ情報を作成する
    function careteMetaPartnerGori(
        address from
    ) internal view returns (string memory) {
        PartnarGoriMeta memory meta = _gorimeta[from];

        bytes memory bytesName = Golib.formatJson("name", meta.name);
        bytes memory bytesDesc = Golib.formatJson("description", "");
        bytes memory bytesImage = Golib.formatJson("image", meta.imageUri);
        bytes memory bytesCreatedAt = Golib.formatJson(
            "createdAt",
            meta.createdAt
        );

        bytes memory bytesObject = abi.encodePacked(
            "{",
            bytesName,
            ",",
            bytesDesc,
            ",",
            bytesImage,
            ",",
            bytesCreatedAt,
            "}"
        );

        bytes memory bytesMetadata = abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytesObject)
        );

        return (string(bytesMetadata));
    }

    // メタ情報を作成する
    function myuri(
        address from,
        uint256 tokenID_
    ) public view returns (string memory) {
        if (tokenID_ == TokenIdPartnerGori) {
            return careteMetaPartnerGori(from);
        } else if (
            tokenID_ >= TokenIdEquipmentMIN && tokenID_ <= TokenIdEquipmentMAX
        ) {
            return createMetaEqupment(tokenID_);
        } else if (tokenID_ >= TokenIdStayGori) {
            return createMetaStayGori(from, tokenID_);
        }
        return "";
    }

    function stayGoriUri(
        address from,
        uint256 tokenID_,
        uint256 location
    ) public view returns (string memory) {
        require(tokenID_ == TokenIdStayGori, "unsupport tokenId");
        require(stayGori[from][location].registerd, "not registered");
        if (tokenID_ == TokenIdStayGori) {
            return createMetaStayGori(from, location);
        }
        return "";
    }

    function _isStayGoriComplete(
        address from,
        uint256 tokenId
    ) internal view returns (bool) {
        return _goriStaking.isComplete(tokenId, from);
    }

    function _isEscape(
        address from,
        uint256 tokenId
    ) internal view returns (bool) {
        (bool _result, ) = _goriStaking.getEscapeBlock(tokenId, from);
        return _result;
    }

    function _getEscapeBlock(
        address from,
        uint256 tokenId
    ) internal view returns (uint256) {
        (, uint256 _escapeBlock) = _goriStaking.getEscapeBlock(tokenId, from);
        return _escapeBlock;
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

    function burn(address from, uint256 id, uint256 amount) public override {
        require(from != address(0), "FROM_ZERO_ADDR");

        address operator = msg.sender;
        uint256 fromBalance = balanceOf[from][id];
        require(fromBalance >= amount, "INSUFFICIENT_BAL");
        unchecked {
            balanceOf[from][id] = fromBalance - amount;
        }

        emit TransferSingle(operator, from, address(0), id, amount);
    }

    function setApprovalForAllGori(
        address from,
        address operator,
        bool approved
    ) public virtual {
        address owner = from;
        require(owner != operator, "APPROVING_SELF");
        isApprovedForAll[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }
}
