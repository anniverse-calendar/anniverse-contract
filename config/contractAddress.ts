import { network } from 'hardhat';

const CONTRACT_ADDRESS: { [name: string]: string } = {
  goerli: '0x1C000AD710eEC8067c41f4bb8641637Bf6fF7C7D',
  localhost: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
};

export const contractAddress = (): string => {
  if (CONTRACT_ADDRESS[network.name] == null) {
    throw new Error('contract address is not found');
  }
  return CONTRACT_ADDRESS[network.name];
};
