import { PrivyClient } from "@privy-io/server-auth";
import { PRIVY_APP_ID, PRIVY_APP_SECRET } from "../lib/constants";
import {
  EthereumTransactionSignParams,
  MessageSignatureResponse,
  TransactionSignatureResponse,
  EthereumMessageParams,
  EthereumTypedDataParams,
} from "../lib/interfaces";

// Initialize and export Privy client
export const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

/**
 * Signs a message using an Ethereum wallet
 * @param params - The message parameters including wallet ID and message
 * @returns Promise containing the signature and encoding
 * @throws Error if signing fails
 */
export async function signEthereumMessage(
  params: EthereumMessageParams
): Promise<MessageSignatureResponse> {
  try {
    const response = await privy.walletApi.ethereum.signMessage(params);
    return {
      signature: response.signature,
      encoding: response.encoding,
    };
  } catch (error) {
    throw new Error(
      `Failed to sign Ethereum message: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Signs typed data using an Ethereum wallet (EIP-712)
 * @param params - The typed data parameters including wallet ID and typed data
 * @returns Promise containing the signature and encoding
 * @throws Error if signing fails
 */
export async function signEthereumTypedData(
  params: EthereumTypedDataParams
): Promise<MessageSignatureResponse> {
  try {
    console.log("Signing typed data with Privy...");
    console.log("Typed data:", JSON.stringify(params.typedData, null, 2));

    const response = await privy.walletApi.ethereum.signTypedData({
      walletId: params.walletId,
      typedData: params.typedData,
    });

    console.log("Signature received:", response.signature);

    return {
      signature: response.signature,
      encoding: response.encoding,
    };
  } catch (error) {
    console.error("Failed to sign typed data:", error);
    throw new Error(
      `Failed to sign Ethereum typed data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Signs a transaction using an Ethereum wallet
 * @param params - The transaction parameters including wallet ID and transaction details
 * @returns Promise containing the signed transaction
 * @throws Error if signing fails
 */
export async function signEthereumTransaction(
  params: EthereumTransactionSignParams
): Promise<TransactionSignatureResponse> {
  try {
    const response = await privy.walletApi.ethereum.signTransaction(params);
    return {
      signedTransaction: response.signedTransaction,
    };
  } catch (error) {
    throw new Error(
      `Failed to sign Ethereum transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
