import { ethers } from 'hardhat';

async function main() {
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  // We get the contract to deploy
  const factory = await ethers.getContractFactory('AnniversaryToken');
  const anniversaryToken = factory.attach(contractAddress);

  const [owner] = await ethers.getSigners();

  const tx = await anniversaryToken.mint(owner.address, 101);
  const result = await tx.wait();
  console.log(result.gasUsed);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
