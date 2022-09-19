import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
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
    it('Should set contract owner role to the owner', async function () {
      const { anniversaryToken, owner } = await loadFixture(deploy);

      expect(await anniversaryToken.isContractOwner(owner.address)).to.true;
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

    it('Should can mint with eth', async function () {
      const { anniversaryToken, owner } = await loadFixture(deploy);

      async function testMinting(
        counter: number,
        options?: { value: BigNumber }
      ): Promise<void> {
        const month = Math.floor(counter / 31) + 1;
        const day = (counter % 31) + 1;
        const tx =
          options == null
            ? anniversaryToken.mint(month, day)
            : anniversaryToken.mint(month, day, options);
        await expect(tx).to.not.be.revertedWith('must pay');
        console.log(`tx (${month * 100 + day}): ${(await tx).hash}`);
      }

      let counter = 0;
      console.log('start:' + counter);
      while (counter < 100) {
        await testMinting(counter);
        counter++;
      }

      console.log('start:' + counter);
      const tx100 = anniversaryToken.mint(4, 8);
      await expect(tx100).to.be.revertedWith('must pay');

      while (counter < 165) {
        await testMinting(counter, {
          value: ethers.utils.parseEther('0.05'),
        });
        counter++;
      }

      console.log('start:' + counter);
      const tx165 = anniversaryToken.mint(6, 11, {
        value: ethers.utils.parseEther('0.05'),
      });
      await expect(tx165).to.be.revertedWith('must pay');

      while (counter < 265) {
        await testMinting(counter, {
          value: ethers.utils.parseEther('0.5'),
        });
        counter++;
      }

      console.log('start:' + counter);
      const tx265 = anniversaryToken.mint(9, 17, {
        value: ethers.utils.parseEther('0.5'),
      });
      await expect(tx265).to.be.revertedWith('must pay');

      while (counter < 365) {
        await testMinting(counter, {
          value: ethers.utils.parseEther('1'),
        });
        counter++;
      }
    });
  });

  async function mint101() {
    const [signer, otherSigner] = await ethers.getSigners();
    const { anniversaryToken, owner } = await loadFixture(deploy);
    const month = 1;
    const day = 1;
    await anniversaryToken.mint(month, day);
    const tokenId = month * 100 + day;

    return {
      anniversaryToken,
      tokenId,
      month,
      day,
      owner,
      signer,
      otherSigner,
    };
  }

  describe('Anniversary', async function () {
    it('Should be able to get empty anniversary', async function () {
      const { anniversaryToken, tokenId } = await mint101();
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be
        .empty;
      await expect((await anniversaryToken.anniversary(tokenId)).description).to
        .be.empty;
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .true;
    });
    it('Should be able to set anniversary', async function () {
      const { anniversaryToken, tokenId } = await mint101();
      await anniversaryToken.setAnniversary(
        tokenId,
        'name',
        'description',
        'shwld',
        'https://twitter.com/shwld'
      );
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        'name'
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('description');
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .false;
    });

    it('Should not change anniversary when not have minted.', async function () {
      const { anniversaryToken } = await loadFixture(deploy);
      const tokenId = 101;
      expect(
        anniversaryToken.setAnniversary(
          tokenId,
          'other name',
          'other description',
          'other',
          'https://twitter.com/other'
        )
      ).to.revertedWith('ERC721: invalid token ID');
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        ''
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('');
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .true;
    });

    it('Should not change anniversary by other user', async function () {
      const { anniversaryToken, tokenId, otherSigner } = await mint101();
      expect(
        anniversaryToken
          .connect(otherSigner)
          .setAnniversary(
            tokenId,
            'other name',
            'other description',
            'other',
            'https://twitter.com/other'
          )
      ).to.revertedWith('must have owner role to set');
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        ''
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('');
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .true;
    });

    it('Should change anniversary when name is 128 characters.', async function () {
      const { anniversaryToken, tokenId } = await mint101();
      await anniversaryToken.setAnniversary(
        tokenId,
        'A'.repeat(128),
        'description',
        'owner',
        'https://twitter.com/owner'
      );
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        'A'.repeat(128)
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('description');
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .false;
    });

    it('Should not change anniversary when name is 129 characters.', async function () {
      const { anniversaryToken, tokenId } = await mint101();
      expect(
        anniversaryToken.setAnniversary(
          tokenId,
          'A'.repeat(129),
          'description',
          'owner',
          'https://twitter.com/owner'
        )
      ).to.revertedWith('name is limited to 128 bytes');
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        ''
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('');
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .true;
    });

    it('Should change anniversary when description is 512 characters.', async function () {
      const { anniversaryToken, tokenId } = await mint101();
      await anniversaryToken.setAnniversary(
        tokenId,
        'name',
        'A'.repeat(512),
        'owner',
        'https://twitter.com/owner'
      );
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        'name'
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('A'.repeat(512));
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .false;
    });

    it('Should not change anniversary when description is 513 characters.', async function () {
      const { anniversaryToken, tokenId } = await mint101();
      expect(
        anniversaryToken.setAnniversary(
          tokenId,
          'name',
          'A'.repeat(513),
          'owner',
          'https://twitter.com/owner'
        )
      ).to.revertedWith('description is limited to 512 bytes');
      await expect((await anniversaryToken.anniversary(tokenId)).name).to.be.eq(
        ''
      );
      await expect(
        (
          await anniversaryToken.anniversary(tokenId)
        ).description
      ).to.be.eq('');
      await expect((await anniversaryToken.anniversary(tokenId)).isEmpty).to.be
        .true;
    });

    // TODO: isMinterのテスト
    // TODO: isContractOwnerのテスト
  });

  describe('#hasMinted', async function () {
    it('Should be true when have not minted', async function () {
      const { anniversaryToken } = await loadFixture(deploy);
      expect(await anniversaryToken.hasMinted(1, 1)).to.be.false;
    });

    it('Should be true when minted', async function () {
      const { anniversaryToken } = await mint101();
      expect(await anniversaryToken.hasMinted(1, 1)).to.be.true;
    });

    it('Should be true when minted by other account', async function () {
      const { anniversaryToken, otherSigner } = await mint101();
      expect(await anniversaryToken.connect(otherSigner).hasMinted(1, 1)).to.be
        .true;
    });
  });

  describe('EIP-165', async function () {
    it('Should be supported when EIP-165', async function () {
      const { anniversaryToken } = await loadFixture(deploy);
      expect(await anniversaryToken.supportsInterface('0x01ffc9a7')).to.be.true;
    });

    it('Should not be supported when 0xffffffff', async function () {
      const { anniversaryToken } = await loadFixture(deploy);
      expect(await anniversaryToken.supportsInterface('0xffffffff')).to.be
        .false;
    });

    it('Should be supported when ERC-721', async function () {
      const { anniversaryToken } = await loadFixture(deploy);
      expect(await anniversaryToken.supportsInterface('0x80ac58cd')).to.be.true;
    });
  });

  // https://zenn.dev/cauchye/articles/ethereum-contract-erc721
  describe('feature', async function () {
    it('should be able to mint101, transferFrom, burn. And it should return appropriate name, symbol, totalSupply, tokenURI, ownerOf, balanceOf', async function () {
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
      const mint0Tx = await anniversaryToken.connect(signer).mint(1, 1);
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
      const mint1Tx = await anniversaryToken.connect(signer).mint(10, 2);
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
      const mint2Tx = await anniversaryToken.connect(badSigner).mint(12, 3);
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
      expect(anniversaryToken.connect(badSigner).mint(12, 3)).to.revertedWith(
        'ERC721PresetMinterPauserAutoId: must have minter role to mint'
      );
    });
  });
});
