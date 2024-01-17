import { ethers } from "hardhat";
import { MockERC20 } from "../typechain-types";

export const makeMockERC20 = async (
  name: string,
  symbol: string,
  decimals: number = 18
): Promise<MockERC20> => {
  const factory = await ethers.getContractFactory("MockERC20");

  return await factory.deploy(name, symbol, decimals);
};
