import { ethers } from "hardhat";
import { makeMockERC20 } from "./makeMockER20";
import { encodePriceSqrt } from "./encodePriceSqrt";
import { MaxUint256 } from "ethers";
import { getIncreaseLiquidityEvent } from "./getIncreaseLiquidityEvent";

async function main() {
  console.log("creating the pool");

  const token0 = await makeMockERC20("Token0", "T0", 18);
  const token1 = await makeMockERC20("Token1", "T1", 18);

  const uniswapV3Factory = await ethers.getContractAt(
    "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol:IUniswapV3Factory",
    "0x1F98431c8aD98523631AE4a59f267346ea31F984"
  );

  await uniswapV3Factory.createPool(
    await token0.getAddress(),
    await token1.getAddress(),
    3000
  );

  const poolAddress = await uniswapV3Factory.getPool(
    await token0.getAddress(),
    await token1.getAddress(),
    3000
  );

  const pool = await ethers.getContractAt(
    "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol:IUniswapV3Pool",
    poolAddress
  );

  await pool.initialize(encodePriceSqrt("1", "1"));
  await pool.increaseObservationCardinalityNext("15");

  console.log("minting tokens");

  const [user] = await ethers.getSigners();

  await token0.mint(user.address, "1000000000000000000000");
  await token1.mint(user.address, "1000000000000000000000");

  const nonfungiblePositionManager = await ethers.getContractAt(
    "@aperture_finance/uni-v3-lib/src/interfaces/INonfungiblePositionManager.sol:INonfungiblePositionManager",
    "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
  );

  await token0.approve(
    await nonfungiblePositionManager.getAddress(),
    MaxUint256
  );
  await token1.approve(
    await nonfungiblePositionManager.getAddress(),
    MaxUint256
  );

  // mint the first position
  console.log("minting first liquidity position");

  let tx = await nonfungiblePositionManager.mint({
    token0: await pool.token0(),
    token1: await pool.token1(),
    fee: 3000,
    // creating the first position with the widest possible range will allow the second mint to work
    // tickLower: -887220n,
    // tickUpper: 887220n,
    tickLower: -2880,
    tickUpper: -1440,
    amount0Desired: "1000000000000000000",
    amount1Desired: "1000000000000000000",
    amount0Min: 0,
    amount1Min: 0,
    recipient: user.address,
    deadline: 1805311720,
  });
  let event = await getIncreaseLiquidityEvent(tx);
  console.log("tokenId", event.tokenId);
  console.log("liquidity", event.liquidity);
  console.log("amount0", event.amount0);
  console.log("amount1", event.amount1);

  // mint the next position using optimal swap
  console.log("minting next position with optimalSwap");

  const uniV3Automan = await ethers.getContractAt(
    "IUniV3Automan",
    "0x00000000ede6d8d217c60f93191c060747324bca"
  );

  await token0.approve(await uniV3Automan.getAddress(), MaxUint256);
  await token1.approve(await uniV3Automan.getAddress(), MaxUint256);

  // this will fail, when looking at the Hardhat node output
  // Gas used: 29999986 of 30000000
  tx = await uniV3Automan.mintOptimal(
    {
      token0: await pool.token0(),
      token1: await pool.token1(),
      fee: 3000,
      tickLower: 60n,
      tickUpper: 1440n,
      amount0Desired: "1000000",
      amount1Desired: "1000000",
      amount0Min: 0,
      amount1Min: 0,
      recipient: user.address,
      deadline: 1805311720,
    },
    new Uint8Array(0)
  );

  event = await getIncreaseLiquidityEvent(tx);
  console.log("tokenId", event.tokenId);
  console.log("liquidity", event.liquidity);
  console.log("amount0", event.amount0);
  console.log("amount1", event.amount1);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
