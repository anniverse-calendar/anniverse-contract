import { ethers } from 'hardhat';

async function main() {
  const AnniversaryToken = await ethers.getContractFactory('AnniversaryToken');
  const anniversaryToken = await AnniversaryToken.deploy();

  await anniversaryToken.deployed();

  console.log(
    `AnniversaryToken with 1 ETH deployed to ${anniversaryToken.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
