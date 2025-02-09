import { sendEthereumTransaction } from "../../privy/send-transaction";
import { AGENT_WALLET_ID, BASE_MAINNET } from "../../lib/constants";
import { getEvmCaip2 } from "../../helpers/getEvmCaip2";

/**
 * Posts a signed CoW Protocol swap transaction
 * @param signedTransaction - The signed transaction data
 * @returns Promise containing the transaction hash
 * @throws Error if posting the swap fails
 */
export async function postSwap(signedTransaction: any): Promise<string> {
  try {
    console.log("✅ Posting swap to CoW Protocol...");

    const response = await sendEthereumTransaction({
      walletId: AGENT_WALLET_ID,
      caip2: getEvmCaip2(BASE_MAINNET.CHAIN_ID),
      transaction: signedTransaction,
    });

    console.log("🎉 Swap transaction submitted:", response.hash);
    console.log("Waiting for transaction to be mined...");

    return response.hash;
  } catch (error) {
    console.error("❌ Failed to post swap:", error);
    throw new Error(
      `Failed to post swap: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
