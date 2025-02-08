export interface AllocationPayload {
  assets: string[];
  allocations: number[];
  analysis: {
    asset_name: string;
    reason: string;
  }[];
}

export interface TokenInfo {
  address: string;
  decimals: number;
}
