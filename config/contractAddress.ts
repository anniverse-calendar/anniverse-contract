import { network } from 'hardhat';

const CONTRACT_ADDRESS: { [name: string]: string } = {
  goerli: '0x4d538547cA4174527ea368075263ae962be8a7B5',
  localhost: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
};

export const contractAddress = (): string => {
  if (CONTRACT_ADDRESS[network.name] == null) {
    throw new Error('contract address is not found');
  }
  return CONTRACT_ADDRESS[network.name];
};
