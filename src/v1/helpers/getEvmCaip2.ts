/**
 * Helper function to create the CAIP-2 identifier for different EVM networks
 * @param chainId - The numeric chain ID of the network
 * @returns The CAIP-2 identifier string
 */
export function getEvmCaip2(chainId: number): string {
  return `eip155:${chainId}`;
}
