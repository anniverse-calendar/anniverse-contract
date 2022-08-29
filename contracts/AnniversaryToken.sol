// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import 'hardhat/console.sol';

import { AccessControlEnumerable } from '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import { ERC721Enumerable } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import { ERC721Burnable } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import { ERC721Pausable } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol';
import { Context } from '@openzeppelin/contracts/utils/Context.sol';
import { Anniversable } from './extensions/Anniversable.sol';

// REF: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol

contract AnniversaryToken is
  Context,
  AccessControlEnumerable,
  ERC721Enumerable,
  ERC721Burnable,
  ERC721Pausable,
  Anniversable
{
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
  bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');
  string private _baseTokenURI = 'https://anniverse.shwld.app/api/v1/tokens/';

  constructor() ERC721('Anniversary', 'ANNIVERSE') {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

    _setupRole(MINTER_ROLE, _msgSender());
    _setupRole(PAUSER_ROLE, _msgSender());
  }

  function mint(address to, uint256 mdd) public virtual {
    require(
      hasRole(MINTER_ROLE, _msgSender()),
      'ERC721PresetMinterPauserAutoId: must have minter role to mint'
    );

    _mint(to, mdd);
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function pause() public virtual {
    require(
      hasRole(PAUSER_ROLE, _msgSender()),
      'ERC721PresetMinterPauserAutoId: must have pauser role to pause'
    );
    _pause();
  }

  function unpause() public virtual {
    require(
      hasRole(PAUSER_ROLE, _msgSender()),
      'ERC721PresetMinterPauserAutoId: must have pauser role to unpause'
    );
    _unpause();
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(AccessControlEnumerable, ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
