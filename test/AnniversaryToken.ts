import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('AnniversaryToken', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const AnniversaryToken = await ethers.getContractFactory(
      'AnniversaryToken'
    );
    const anniversaryToken = await AnniversaryToken.deploy();

    return { anniversaryToken, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Should set mint role to the owner', async function () {
      const { anniversaryToken, owner } = await loadFixture(deploy);

      expect(
        await anniversaryToken.hasRole(
          anniversaryToken.MINTER_ROLE(),
          owner.address
        )
      ).to.true;
    });

    it('Should set pauser role to the owner', async function () {
      const { anniversaryToken, owner } = await loadFixture(deploy);

      expect(
        await anniversaryToken.hasRole(
          anniversaryToken.PAUSER_ROLE(),
          owner.address
        )
      ).to.true;
    });

    it('Should set admin role to the owner', async function () {
      const { anniversaryToken, owner } = await loadFixture(deploy);

      expect(
        await anniversaryToken.hasRole(
          anniversaryToken.DEFAULT_ADMIN_ROLE(),
          owner.address
        )
      ).to.true;
    });
  });

  describe('Anniversary', async function () {
    async function createAnniversary() {
      const { anniversaryToken, owner } = await loadFixture(deploy);
      const tokenId = 101;
      await anniversaryToken.mint(owner.address, tokenId);

      return { anniversaryToken, tokenId, owner };
    }
    it('Should be able to get empty anniversary', async function () {
      const { anniversaryToken, tokenId } = await createAnniversary();
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be
        .empty;
      await expect((await anniversaryToken.anniversary(tokenId)).description).to
        .be.empty;
    });
    it('Should be able to set anniversary', async function () {
      const { anniversaryToken, tokenId } = await createAnniversary();
      await anniversaryToken.setAnniversary(tokenId, 'name', 'description');
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        'name'
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('description');
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

    // mint tokenId = 101
    const mint0Tx = await anniversaryToken
      .connect(signer)
      .mint(signer.address, 101);
    await mint0Tx.wait();
    console.log(`mint 101 tx hash: ${mint0Tx.hash}`);

    // Assertion for token(tokenId = 101)
    expect(await anniversaryToken.totalSupply()).to.equal(1);
    expect(await anniversaryToken.tokenURI(101)).to.equal(
      'https://anniverse.shwld.app/api/v1/tokens/101'
    );
    expect(await anniversaryToken.ownerOf(101)).to.equal(signer.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(1);

    // mint tokenId = 1002
    const mint1Tx = await anniversaryToken
      .connect(signer)
      .mint(signer.address, 1002);
    await mint1Tx.wait();
    console.log(`mint 1002 tx hash: ${mint1Tx.hash}`);

    // Assertion for token(tokenId = 1002) and contract state
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.tokenURI(1002)).to.equal(
      'https://anniverse.shwld.app/api/v1/tokens/1002'
    );
    expect(await anniversaryToken.ownerOf(1002)).to.equal(signer.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(2);

    // transfer token(tokenId = 101) from signer.address to badSigner.address
    const transfer1FromSignerToAddressTx = await anniversaryToken
      .connect(signer)
      .transferFrom(signer.address, badSigner.address, 1002);
    await transfer1FromSignerToAddressTx.wait();
    console.log(
      `transfer1FromSignerToAddressTx tx hash: ${transfer1FromSignerToAddressTx.hash}`
    );

    // Assertion for transferred token(tokenId = 1002)
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.ownerOf(1002)).to.equal(badSigner.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(1);
    expect(await anniversaryToken.balanceOf(badSigner.address)).to.equal(1);

    // burn token(tokenId = 101)
    const burn0Tx = await anniversaryToken.burn(101);
    await burn0Tx.wait();
    console.log(`burn0 tx hash: ${burn0Tx.hash}`);

    // Assertion for burned token(tokenId = 101)
    expect(await anniversaryToken.totalSupply()).to.equal(1);
    expect(anniversaryToken.ownerOf(101)).to.revertedWith(
      'ERC721: owner query for nonexistent token'
    );
    expect(anniversaryToken.tokenURI(101)).to.revertedWith(
      'ERC721Metadata: URI query for nonexistent token'
    );
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(0);

    // mint token(tokenId = 1203)
    const mint2Tx = await anniversaryToken.mint(badSigner.address, 1203);
    await mint2Tx.wait();
    console.log(`mint 2 tx hash: ${mint2Tx.hash}`);

    // Assertion for re-minted token(tokenId = 1203)
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.ownerOf(1203)).to.equal(badSigner.address);
    expect(await anniversaryToken.tokenURI(1203)).to.equal(
      'https://anniverse.shwld.app/api/v1/tokens/1203'
    );
    expect(await anniversaryToken.balanceOf(badSigner.address)).to.equal(2);

    // transfer token(tokenId = 1203) from badSigner.address to signer.address
    const transfer2FromBadSignerToSignerAddressTx = await anniversaryToken
      .connect(badSigner)
      .transferFrom(badSigner.address, signer.address, 1203);
    await transfer2FromBadSignerToSignerAddressTx.wait();
    console.log(
      `transfer2FromBadSignerToSignerAddress tx hash: ${transfer2FromBadSignerToSignerAddressTx.hash}`
    );

    // Assertion for transferred token(tokenId = 1203)
    expect(await anniversaryToken.totalSupply()).to.equal(2);
    expect(await anniversaryToken.ownerOf(1203)).to.equal(signer.address);
    expect(await anniversaryToken.balanceOf(signer.address)).to.equal(1);
    expect(await anniversaryToken.balanceOf(badSigner.address)).to.equal(1);

    // Assertion fail to mint with badSigner who has not minter role
    expect(
      anniversaryToken.connect(badSigner).mint(signer.address, 1203)
    ).to.revertedWith(
      'ERC721PresetMinterPauserAutoId: must have minter role to mint'
    );
  });
});
