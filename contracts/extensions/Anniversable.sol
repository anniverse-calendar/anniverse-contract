// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import 'hardhat/console.sol';

import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import { Context } from '@openzeppelin/contracts/utils/Context.sol';

abstract contract Anniversable is Context, ERC721 {
  struct Anniversary {
    string name;
    string description;
  }

  mapping(uint256 => Anniversary) private _anniversaries;

  /**
   * @dev
   */
  function anniversary(uint256 tokenId)
    public
    view
    virtual
    returns (Anniversary memory)
  {
    _requireMinted(tokenId);
    return _anniversaries[tokenId];
  }

  /**
   * @dev
   */
  function setAnniversary(
    uint256 tokenId,
    string memory _name,
    string memory _description
  ) internal virtual {
    _requireMinted(tokenId);

    address owner = ERC721.ownerOf(tokenId);
    require(owner == msg.sender);

    bytes memory nameBytes = bytes(_name);
    require(nameBytes.length <= 128, 'name is limited to 128 bytes');

    bytes memory b = bytes(_description);
    require(b.length <= 512, 'description is limited to 512 bytes');

    _anniversaries[tokenId] = Anniversary(_name, _description);
  }
}
