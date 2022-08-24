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

  // https://zenn.dev/cauchye/articles/ethereum-contract-erc721
  it('should be able to mint, transferFrom, burn. And it should return appropriate name, symbol, totalSupply, tokenURI, ownerOf, balanceOf', async function () {
    const [signer, badSigner] = await ethers.getSigners();
    const AnniversaryToken = await ethers.getContractFactory(
      'AnniversaryToken'
    );
    const anniversaryToken = await AnniversaryToken.deploy();
    await anniversaryToken.deployed();
    console.log(
      `anniversaryToken deploy tx hash: ${anniversaryToken.deployTransaction.hash}`
    );
    console.log(`greeter contract address: ${anniversaryToken.address}`);

    // before initial minting
    expect(await anniversaryToken.name()).to.equal('Anniversary');
    expect(await anniversaryToken.symbol()).to.equal('ANNIVERSE');
    expect(await anniversaryToken.totalSupply()).to.equal(0);

    // mint tokenId = 0
    const mint0Tx = await anniversaryToken.connect(signer).mint(signer.address);
    await mint0Tx.wait();
    console.log(`mint 0 tx hash: ${mint0Tx.hash}`);

    // Assertion for token(tokenId = 0)
    expect(await anniversaryToken.totalSupply()).to.equal(1);
    expect(await anniversaryToken.tokenURI(0)).to.equal(
      'https://anniverse.shwld.app/api/v1/tokens/0'
    );
    expect(await anniversaryToken.ownerOf(0)).to.equal(signer.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(1);

    // mint tokenId = 1
    const mint1Tx = await anniversaryToken.connect(signer).mint(signer.address);
    await mint1Tx.wait();
    console.log(`mint 1 tx hash: ${mint1Tx.hash}`);

    // Assertion for token(tokenId = 1) and contract state
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.tokenURI(1)).to.equal(
      'https://anniverse.shwld.app/api/v1/tokens/1'
    );
    expect(await anniversaryToken.ownerOf(1)).to.equal(signer.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(2);

    // transfer token(tokenId = 1) from signer.address to badSigner.address
    const transfer1FromSignerToAddressTx = await anniversaryToken
      .connect(signer)
      .transferFrom(signer.address, badSigner.address, 1);
    await transfer1FromSignerToAddressTx.wait();
    console.log(
      `transfer1FromSignerToAddressTx tx hash: ${transfer1FromSignerToAddressTx.hash}`
    );

    // Assertion for transferred token(tokenId = 1)
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.ownerOf(1)).to.equal(badSigner.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(1);
    expect(await anniversaryToken.balanceOf(badSigner.address)).to.equal(1);

    // burn token(tokenId = 0)
    const burn0Tx = await anniversaryToken.burn(0);
    await burn0Tx.wait();
    console.log(`burn0 tx hash: ${burn0Tx.hash}`);

    // Assertion for burned token(tokenId = 0)
    expect(await anniversaryToken.totalSupply()).to.equal(1);
    expect(anniversaryToken.ownerOf(0)).to.revertedWith(
      'ERC721: owner query for nonexistent token'
    );
    expect(anniversaryToken.tokenURI(0)).to.revertedWith(
      'ERC721Metadata: URI query for nonexistent token'
    );
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(0);

    // mint token(tokenId = 2)
    const mint2Tx = await anniversaryToken.mint(badSigner.address);
    await mint2Tx.wait();
    console.log(`mint 2 tx hash: ${mint2Tx.hash}`);

    // Assertion for re-minted token(tokenId = 0)
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.ownerOf(2)).to.equal(badSigner.address);
    expect(await anniversaryToken.tokenURI(2)).to.equal(
      'https://anniverse.shwld.app/api/v1/tokens/2'
    );
    expect(await anniversaryToken.balanceOf(badSigner.address)).to.equal(2);

    // transfer token(tokenId = 2) from badSigner.address to signer.address
    const transfer2FromBadSignerToSignerAddressTx = await anniversaryToken
      .connect(badSigner)
      .transferFrom(badSigner.address, signer.address, 2);
    await transfer2FromBadSignerToSignerAddressTx.wait();
    console.log(
      `transfer2FromBadSignerToSignerAddress tx hash: ${transfer2FromBadSignerToSignerAddressTx.hash}`
    );

    // Assertion for transferred token(tokenId = 2)
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.ownerOf(2)).to.equal(signer.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(1);
    expect(await anniversaryToken.balanceOf(badSigner.address)).to.equal(1);

    // Assertion fail to mint with badSigner who has not minter role
    expect(
      anniversaryToken.connect(badSigner).mint(signer.address)
    ).to.revertedWith(
      'ERC721PresetMinterPauserAutoId: must have minter role to mint'
    );
  });
});
