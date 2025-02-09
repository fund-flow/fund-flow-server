import { PrivyClient } from "@privy-io/server-auth";
import { PRIVY_APP_ID, PRIVY_APP_SECRET } from "../lib/constants";
import { ChainType, WalletResponse } from "../lib/interfaces";

// Initialize Privy client
const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

/**
 * Creates a new server wallet using Privy
 * @param chain - The blockchain type to create the wallet for ('ethereum' or 'solana')
 * @returns Promise containing the wallet details (id, address, and chain type)
 * @throws Error if wallet creation fails
 */
export async function createWallet(
  chain: ChainType = "ethereum"
): Promise<WalletResponse> {
  try {
    console.log(`Creating wallet for chain: ${chain}`);
    const { id, address, chainType } = await privy.walletApi.create({
      chainType: chain,
    });
    console.log(
      `Wallet created with ID: ${id}, Address: ${address}, ChainType: ${chainType}`
    );

    return {
      id,
      address,
      chainType: chainType as ChainType,
    };
  } catch (error) {
    console.error(`Error creating wallet for chain: ${chain}`, error);
    throw new Error(
      `Failed to create ${chain} wallet: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

createWallet()
  .then(() => {
    console.log("Wallet creation process completed.");
  })
  .catch((error) => {
    console.error("Wallet creation process encountered an error:", error);
  });
