////////////////////////
///// COW PROTOCOL /////
////////////////////////

export interface AllocationPayload {
  userWallet: string;
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

export type ChainType = "ethereum" | "solana";

/////////////////
///// PRIVY /////
/////////////////

// create-wallet.ts //
export interface WalletResponse {
  id: string;
  address: string;
  chainType: ChainType;
}

// send-transaction.ts //
export interface EthereumTransactionParams {
  walletId: string;
  caip2: string;
  transaction: {
    to: string;
    value: number | string;
    chainId: number;
    // Optional parameters that Privy will populate if not provided
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
    data?: string;
  };
}

export interface TransactionResponse {
  hash: string;
}

// sign-transaction.ts //
export interface EthereumMessageParams {
  walletId: string;
  message: string;
}

export interface EthereumTransactionSignParams {
  walletId: string;
  transaction: {
    to: string;
    value: number | string;
    chainId: number;
    // Optional parameters
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
    data?: string;
  };
}

export interface MessageSignatureResponse {
  signature: string;
  encoding: string;
}

export interface TransactionSignatureResponse {
  signedTransaction: any; // Keep as any since the format varies between chains
}
