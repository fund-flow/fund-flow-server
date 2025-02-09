import { PrivyClient } from "@privy-io/server-auth";
import { PRIVY_APP_ID, PRIVY_APP_SECRET } from "../lib/constants";
import { TransactionResponse } from "../lib/interfaces";
import { EthereumTransactionParams } from "../lib/interfaces";

// Initialize Privy client
const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

/**
 * Sends an Ethereum transaction using a Privy server wallet
 * @param params - The transaction parameters including wallet ID, chain details, and transaction data
 * @returns Promise containing the transaction hash
 * @throws Error if transaction fails
 */
export async function sendEthereumTransaction(
  params: EthereumTransactionParams
): Promise<TransactionResponse> {
  try {
    const response = await privy.walletApi.ethereum.sendTransaction(params);
    return { hash: response.hash };
  } catch (error) {
    throw new Error(
      `Failed to send Ethereum transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
