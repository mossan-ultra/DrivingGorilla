// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@thirdweb-dev/contracts/prebuilts/unaudited/airdrop/AirdropERC1155.sol";
import "@thirdweb-dev/contracts/extension/Ownable.sol";

// 相棒ゴリをエアドロップするコントラクト
contract GoriDrop is AirdropERC1155, Ownable {
    IERC1155 erc1155;

    constructor(IERC1155 _erc1155) {
        erc1155 = _erc1155;
        _setupOwner(_msgSender());
    }

    // 初期設定用
    // エアドリップするコントラクトを設定する
    function changeERC1155Contract(IERC1155 _erc1155) public {
        require(_msgSender() == owner());
        erc1155 = _erc1155;
    }

    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    // 相棒ゴリをエアドロップする
    function goridrop(
        address _tokenAddress,
        address _tokenOwner,
        AirdropContent[] calldata _contents
    ) public {
        // ThirdwebのairdropERC1155を参考にして以下のように変える
        // ・誰でもエアドロ可能
        // ・ウォレットアドレスに対して一度のみエアドロ可能
        require(erc1155.balanceOf(_msgSender(), 0) == 0, "Already airdropped");
        uint256 len = _contents.length;

        for (uint256 i = 0; i < len; ) {
            try
                IERC1155(_tokenAddress).safeTransferFrom(
                    _tokenOwner,
                    _contents[i].recipient,
                    _contents[i].tokenId,
                    _contents[i].amount,
                    ""
                )
            {
                // droped[_msgSender()] = true;
            } catch {
                // revert if failure is due to unapproved tokens
                require(
                    IERC1155(_tokenAddress).balanceOf(
                        _tokenOwner,
                        _contents[i].tokenId
                    ) >=
                        _contents[i].amount &&
                        IERC1155(_tokenAddress).isApprovedForAll(
                            _tokenOwner,
                            address(this)
                        ),
                    "Not balance or approved"
                );

                emit AirdropFailed(
                    _tokenAddress,
                    _tokenOwner,
                    _contents[i].recipient,
                    _contents[i].tokenId,
                    _contents[i].amount
                );
            }

            unchecked {
                i += 1;
            }
        }
    }
}
