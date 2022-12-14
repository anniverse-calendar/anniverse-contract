import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
import { CONTRACT_ADDRESS } from './config/contants';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    ...(process.env.GOERLI_ALCHEMY_API_KEY
      ? {
          goerli: {
            url: `https://eth-goerli.alchemyapi.io/v2/${process.env
              .GOERLI_ALCHEMY_API_KEY!}`,
            accounts: [process.env.GOERLI_PRIVATE_KEY!],
          },
        }
      : {}),
    ...(process.env.MAINNET_ALCHEMY_API_KEY
      ? {
          mainnet: {
            url: `https://eth-goerli.alchemyapi.io/v2/${process.env
              .MAINNET_ALCHEMY_API_KEY!}`,
            accounts: [process.env.MAINNET_PRIVATE_KEY!],
          },
        }
      : {}),
    localhost: {
      allowUnlimitedContractSize: true,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'JPY',
    gasPriceApi:
      'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};

task('mint', 'mint')
  .addParam('token', 'The tokenId')
  .setAction(async (taskArgs, { ethers, network }) => {
    const contractAddress = CONTRACT_ADDRESS[network.name];

    const factory = await ethers.getContractFactory('AnniversaryToken');
    const anniversaryToken = factory.attach(contractAddress);
    const [owner] = await ethers.getSigners();

    const tx = await anniversaryToken.mint(owner.address, taskArgs.token);
    const result = await tx.wait();
    console.log(result.gasUsed);
  });

task('minted', 'hasMinted')
  .addParam('month', 'month')
  .addParam('day', 'day')
  .setAction(async (taskArgs, { ethers, network }) => {
    const contractAddress = CONTRACT_ADDRESS[network.name];
    const factory = await ethers.getContractFactory('AnniversaryToken');
    const anniversaryToken = factory.attach(contractAddress);

    const tx = await anniversaryToken.hasMinted(
      Number(taskArgs.month),
      Number(taskArgs.day)
    );
    console.log(tx);
  });

task('is_minter', 'isMinter')
  .addParam('month', 'month')
  .addParam('day', 'day')
  .setAction(async (taskArgs, { ethers, network }) => {
    const contractAddress = CONTRACT_ADDRESS[network.name];
    const factory = await ethers.getContractFactory('AnniversaryToken');
    const anniversaryToken = factory.attach(contractAddress);

    const tx = await anniversaryToken.isMinter(
      Number(taskArgs.month),
      Number(taskArgs.day)
    );
    console.log(tx);
  });

task('price', 'getPrice')
  .addParam('token', 'tokenId')
  .setAction(async (taskArgs, { ethers, network }) => {
    const contractAddress = CONTRACT_ADDRESS[network.name];
    const factory = await ethers.getContractFactory('AnniversaryToken');
    const anniversaryToken = factory.attach(contractAddress);

    const tx = await anniversaryToken.getPrice(taskArgs.token);
    console.log(tx);
  });

task('view', 'view')
  .addParam('token', 'tokenId')
  .setAction(async (taskArgs, { ethers, network }) => {
    const contractAddress = CONTRACT_ADDRESS[network.name];
    const factory = await ethers.getContractFactory('AnniversaryToken');
    const anniversaryToken = factory.attach(contractAddress);

    const tx = await anniversaryToken.anniversary(taskArgs.token);
    console.log(tx);
  });

task('set_uri', 'uri')
  .addParam('uri', 'base uri')
  .setAction(async (taskArgs, { ethers, network }) => {
    const contractAddress = CONTRACT_ADDRESS[network.name];
    const factory = await ethers.getContractFactory('AnniversaryToken');
    const anniversaryToken = factory.attach(contractAddress);

    const tx = await anniversaryToken.setBaseURI(taskArgs.uri);
    console.log(tx);
  });

task('token_uri', 'uri')
  .addParam('token', 'tokenId')
  .setAction(async (taskArgs, { ethers, network }) => {
    const contractAddress = CONTRACT_ADDRESS[network.name];
    const factory = await ethers.getContractFactory('AnniversaryToken');
    const anniversaryToken = factory.attach(contractAddress);

    const tx = await anniversaryToken.tokenURI(Number(taskArgs.token));
    console.log(tx);
  });

export default config;
