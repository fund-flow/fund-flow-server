import { PrivyClient } from "@privy-io/server-auth";
import { PRIVY_APP_ID, PRIVY_APP_SECRET } from "../lib/constants";
import { TransactionResponse } from "../lib/interfaces";
import { EthereumTransactionParams } from "../lib/interfaces";

// Initialize Privy client
const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

/**
 * Ensures a value is properly formatted as a hex string
 * @param value - The value to format
 * @returns The value formatted as a hex string with 0x prefix
 */
function toHexString(value: string | number): string {
  // If already a hex string, ensure it has 0x prefix
  if (typeof value === 'string' && value.toLowerCase().startsWith('0x')) {
    return value.toLowerCase();
  }

  // Convert to BigInt and then to hex string
  try {
    const bigIntValue = BigInt(value.toString());
    return `0x${bigIntValue.toString(16)}`;
  } catch {
    throw new Error(`Invalid value for hex conversion: ${value}`);
  }
}

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
    // Format transaction values as hex strings
    const transaction = {
      ...params.transaction,
      value: toHexString(params.transaction.value),
      data: params.transaction.data?.toLowerCase() || '0x',
    };

    if (transaction.gasLimit) {
      transaction.gasLimit = toHexString(transaction.gasLimit);
    }
    if (transaction.maxFeePerGas) {
      transaction.maxFeePerGas = toHexString(transaction.maxFeePerGas);
    }
    if (transaction.maxPriorityFeePerGas) {
      transaction.maxPriorityFeePerGas = toHexString(transaction.maxPriorityFeePerGas);
    }

    const response = await privy.walletApi.ethereum.sendTransaction({
      ...params,
      transaction,
    });

    return { hash: response.hash };
  } catch (error) {
    throw new Error(
      `Failed to send Ethereum transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
