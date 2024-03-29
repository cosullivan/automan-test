import bn from "bignumber.js";
import { BigNumberish } from "ethers";

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export function encodePriceSqrt(
  reserve1: BigNumberish,
  reserve0: BigNumberish
) {
  return new bn(reserve1.toString())
    .div(reserve0.toString())
    .sqrt()
    .multipliedBy(new bn(2).pow(96))
    .integerValue(3)
    .toString();
}
