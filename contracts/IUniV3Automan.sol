// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.4;

import { V3PoolCallee } from "@aperture_finance/uni-v3-lib/src/PoolCaller.sol";
import { INonfungiblePositionManager } from "@aperture_finance/uni-v3-lib/src/interfaces/INonfungiblePositionManager.sol";

interface IUniV3Automan {

    function getOptimalSwap(
        V3PoolCallee pool,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired
    ) external view returns (uint256 amountIn, uint256 amountOut, bool zeroForOne, uint160 sqrtPriceX96);

    function mint(
        INonfungiblePositionManager.MintParams memory params
    ) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
    
    function mintOptimal(
        INonfungiblePositionManager.MintParams memory params,
        bytes calldata swapData
    ) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
}