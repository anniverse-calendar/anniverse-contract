// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract AnniversaryToken is Ownable, ERC721PresetMinterPauserAutoId  {
  constructor() ERC721PresetMinterPauserAutoId("Anniversary", "ANNIVERSE", "https://anniverse.shwld.app/api/v1/tokens/") {
  }
}
