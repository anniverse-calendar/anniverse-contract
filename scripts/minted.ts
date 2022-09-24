import { ethers } from 'hardhat';
import { contractAddress } from '../config/contractAddress';

async function main() {
  const factory = await ethers.getContractFactory('AnniversaryToken');
  const anniversaryToken = factory.attach(contractAddress());
  // const [owner] = await ethers.getSigners();
  const tx = await anniversaryToken.hasMinted(9, 24);
  console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
