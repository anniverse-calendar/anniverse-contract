import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('AnniversaryToken', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const AnniversaryToken = await ethers.getContractFactory(
      'AnniversaryToken'
    );
    const anniversaryToken = await AnniversaryToken.deploy();

    return { anniversaryToken, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { anniversaryToken, owner } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await anniversaryToken.owner()).to.equal(owner.address);
    });
  });
});
