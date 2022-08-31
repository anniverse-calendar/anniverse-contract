// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import 'hardhat/console.sol';

import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import { Context } from '@openzeppelin/contracts/utils/Context.sol';

abstract contract Anniversable is Context, ERC721 {
  struct _Anniversary {
    string name;
    string description;
  }
  struct Anniversary {
    string name;
    string description;
    bool isEmpty;
  }

  mapping(uint256 => _Anniversary) private _anniversaries;
  mapping(uint256 => uint256) private _indexToTokenId;
  int256 _anniversariesCount;

  /**
   * @dev
   */
  function anniversary(uint256 tokenId)
    public
    view
    virtual
    returns (Anniversary memory)
  {
    if (_exists(tokenId)) {
      return
        Anniversary(
          _anniversaries[tokenId].name,
          _anniversaries[tokenId].description,
          false
        );
    }

    return Anniversary('', '', true);
  }

  /**
   * @dev
   */
  function setAnniversary(
    uint256 tokenId,
    string memory _name,
    string memory _description
  ) public {
    _requireMinted(tokenId);

    address owner = ERC721.ownerOf(tokenId);
    require(owner == msg.sender, 'must have owner role to set');

    bytes memory nameBytes = bytes(_name);
    require(nameBytes.length <= 128, 'name is limited to 128 bytes');

    bytes memory b = bytes(_description);
    require(b.length <= 512, 'description is limited to 512 bytes');

    _anniversaries[tokenId] = _Anniversary(_name, _description);
  }
}
