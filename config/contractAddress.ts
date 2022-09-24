import { network } from 'hardhat';
import { CONTRACT_ADDRESS } from './contants';

export const contractAddress = (): string => {
  if (CONTRACT_ADDRESS[network.name] == null) {
    throw new Error('contract address is not found');
  }
  return CONTRACT_ADDRESS[network.name];
};
