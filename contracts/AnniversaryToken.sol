// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import 'hardhat/console.sol';

import { AccessControlEnumerable } from '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import { ERC721Enumerable } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import { ERC721Burnable } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import { ERC721Pausable } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol';
import { Context } from '@openzeppelin/contracts/utils/Context.sol';
import { Counters } from '@openzeppelin/contracts/utils/Counters.sol';
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
  using Counters for Counters.Counter;
  Counters.Counter private _tokenCounter;
  address private _contractOwner;

  bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');
  string private _baseTokenURI = 'https://anniverse.shwld.app/api/tokens/';

  constructor() ERC721('Anniversary', 'ANNIVERSE') {
    _contractOwner = _msgSender();

    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(PAUSER_ROLE, _msgSender());
  }

  function mint(uint256 month, uint256 day) public payable virtual {
    uint256 price = getPrice();
    require(msg.value == price, 'must pay');
    require(month > 0 && month <= 12, 'month is invalid');
    require(day > 0 && day <= 31, 'day is invalid');

    _pay(price);

    uint256 tokenId = month * 100 + day;

    _mint(_msgSender(), tokenId);
  }

  function hasMinted(uint256 month, uint256 day)
    public
    view
    virtual
    returns (bool)
  {
    uint256 tokenId = month * 100 + day;
    return _exists(tokenId);
  }

  function isMinter(uint256 month, uint256 day)
    public
    view
    virtual
    returns (bool)
  {
    uint256 tokenId = month * 100 + day;
    if (!_exists(tokenId)) {
      return false;
    }
    return ownerOf(tokenId) == _msgSender();
  }

  function isContractOwner(address _address) public view returns (bool) {
    return _contractOwner == _address;
  }

  function getPrice() public view returns (uint256) {
    uint256 counter = _tokenCounter.current();
    uint256 price = 0;
    if (counter >= 265) {
      price = 1 ether;
    } else if (counter >= 165) {
      price = 0.5 ether;
    } else if (counter >= 100) {
      price = 0.05 ether;
    }

    return price;
  }

  function _pay(uint256 price) private {
    address payable receiver = payable(_contractOwner);
    receiver.transfer(price);
    _tokenCounter.increment();
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string memory newURI) public {
    require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), 'Caller is not admin');
    _baseTokenURI = newURI;
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
