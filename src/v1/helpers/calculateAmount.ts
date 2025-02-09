import { BASE_MAINNET } from "../lib/constants";

/**
 * Calculate the USDC sell amount for an allocation
 * @param totalUsdcAmount Total USDC amount in base units (e.g., "5000000" for 5 USDC)
 * @param allocation Allocation percentage (e.g., 0.25 for 25%)
 * @returns The USDC amount in base units (6 decimals) to sell
 */
export function calculateUsdcSellAmount(
  totalUsdcAmount: string,
  allocation: number
): string {
  // Calculate allocated USDC amount from base units
  const allocatedAmount =
    (BigInt(totalUsdcAmount) * BigInt(Math.floor(allocation * 100))) /
    BigInt(100);
  return allocatedAmount.toString();
}

/**
 * Calculate the minimum buy amount for a token based on its decimals
 * @param usdcAmount USDC amount in base units (6 decimals)
 * @param price Price of 1 unit of target token in USDC
 * @param tokenSymbol Token symbol to get decimals
 * @returns The minimum buy amount in token's base units
 */
export function calculateMinBuyAmount(
  usdcAmount: string,
  price: number,
  tokenSymbol: keyof typeof BASE_MAINNET.DECIMALS
): string {
  // Convert USDC amount to human readable
  const usdcHumanAmount =
    Number(usdcAmount) / Math.pow(10, BASE_MAINNET.DECIMALS.USDC);

  // Calculate how many tokens we should get
  const tokenAmount = usdcHumanAmount / price;

  // Convert to token's base units
  const tokenDecimals = BASE_MAINNET.DECIMALS[tokenSymbol];
  return Math.floor(tokenAmount * Math.pow(10, tokenDecimals)).toString();
}
