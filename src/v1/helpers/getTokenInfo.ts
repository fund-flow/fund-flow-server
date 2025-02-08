import { BASE_MAINNET } from "../lib/constants";
import { TokenInfo } from "../lib/interfaces";

export function getTokenInfo(symbol: string): TokenInfo {
  const address =
    BASE_MAINNET.TOKENS[symbol as keyof typeof BASE_MAINNET.TOKENS];
  const decimals =
    BASE_MAINNET.DECIMALS[symbol as keyof typeof BASE_MAINNET.DECIMALS];

  if (!address || !decimals) {
    throw new Error(`Token info not found for symbol: ${symbol}`);
  }

  return { address, decimals };
}
