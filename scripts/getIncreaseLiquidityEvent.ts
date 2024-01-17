import {
  AbiCoder,
  ContractTransactionResponse,
  keccak256,
  toUtf8Bytes,
} from "ethers";

export const getIncreaseLiquidityEvent = async (
  tx: ContractTransactionResponse
) => {
  const receipt = await tx.wait();

  if (receipt === null) {
    throw new Error("Couldn't wait for the response");
  }

  const abiCoder = AbiCoder.defaultAbiCoder();

  const topic = keccak256(
    toUtf8Bytes("IncreaseLiquidity(uint256,uint128,uint256,uint256)")
  );

  const log = receipt.logs.find((log) => log.topics[0] === topic)!;

  const [tokenId] = abiCoder.decode(["uint256"], log.topics[1]);

  const [liquidity, amount0, amount1] = abiCoder.decode(
    ["uint128", "uint256", "uint256"],
    log.data
  );

  return {
    tokenId,
    liquidity,
    amount0,
    amount1,
  };
};
