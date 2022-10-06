// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import 'hardhat/console.sol';

import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import { Context } from '@openzeppelin/contracts/utils/Context.sol';

abstract contract Anniversable is Context, ERC721 {
  struct _Anniversary {
    string name;
    string description;
    string author;
    string authorUrl;
    string lang;
  }
  struct Anniversary {
    uint8 month;
    uint8 day;
    string name;
    string description;
    string author;
    string authorUrl;
    string lang;
    bool isEmpty;
  }

  event AnniversaryUpdated(uint256 indexed _tokenId, _Anniversary _value);

  mapping(uint256 => _Anniversary) private _anniversaries;

  function anniversary(uint256 tokenId)
    public
    view
    virtual
    returns (Anniversary memory)
  {
    uint8 month = uint8(tokenId / 100);
    uint8 day = uint8(tokenId % 100);
    if (_anniversaryExisted(tokenId)) {
      return
        Anniversary(
          month,
          day,
          _anniversaries[tokenId].name,
          _anniversaries[tokenId].description,
          _anniversaries[tokenId].author,
          _anniversaries[tokenId].authorUrl,
          _anniversaries[tokenId].lang,
          false
        );
    }

    return Anniversary(month, day, '', '', '', '', '', true);
  }

  function setAnniversary(
    uint256 tokenId,
    string memory _name,
    string memory _description,
    string memory _author,
    string memory _authorUrl,
    string memory _lang
  ) public {
    _requireMinted(tokenId);

    address owner = ERC721.ownerOf(tokenId);
    require(owner == msg.sender, 'must have owner role to set');

    bytes memory nameBytes = bytes(_name);
    require(nameBytes.length > 0, 'name is required');
    require(nameBytes.length <= 128, 'name is limited to 128 bytes');

    bytes memory descriptionBytes = bytes(_description);
    require(
      descriptionBytes.length <= 512,
      'description is limited to 512 bytes'
    );

    bytes memory authorBytes = bytes(_author);
    require(authorBytes.length <= 128, 'author is limited to 128 bytes');

    bytes memory authorUrlBytes = bytes(_authorUrl);
    require(authorUrlBytes.length <= 512, 'authorUrl is limited to 512 bytes');

    _anniversaries[tokenId] = _Anniversary(
      _name,
      _description,
      _author,
      _authorUrl,
      _lang
    );
    emit AnniversaryUpdated(tokenId, _anniversaries[tokenId]);
  }

  function anniversaries365() public view returns (Anniversary[] memory) {
    Anniversary[] memory results = new Anniversary[](372);
    for (uint256 month = 1; month <= 12; month++) {
      for (uint256 day = 1; day <= 31; day++) {
        uint256 i = (month - 1) * 31 + day - 1;
        uint256 tokenId = month * 100 + day;
        results[i] = anniversary(tokenId);
      }
    }

    return results;
  }

  function _anniversaryExisted(uint256 tokenId) private view returns (bool) {
    bytes memory nameBytes = bytes(_anniversaries[tokenId].name);
    return nameBytes.length > 0;
  }
}
