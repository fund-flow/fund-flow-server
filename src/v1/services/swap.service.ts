import {
  OrderKind,
  SigningScheme,
  SwapAdvancedSettings,
  TradingSdk,
} from "@cowprotocol/cow-sdk";
import { AllocationPayload, TokenInfo } from "../lib/interfaces";
import {
  AGENT_WALLET_ADDRESS,
  AGENT_WALLET_ID,
  BASE_MAINNET,
  COW_APP_CODE,
  RPC_URL,
} from "../lib/constants";
import { JsonRpcProvider } from "@ethersproject/providers";
import { signEthereumTypedData } from "../privy/sign-transaction";
import { sendEthereumTransaction } from "../privy/send-transaction";
import { Contract } from "@ethersproject/contracts";
import { getEvmCaip2 } from "../helpers/getEvmCaip2";
import { Wallet } from "@ethersproject/wallet";
import {
  calculateUsdcSellAmount,
  calculateMinBuyAmount,
} from "../helpers/calculateAmount";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const COW_VAULT_RELAYER = "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";

/**
 * Process multiple token swaps based on allocations
 * @param totalUsdcAmount - Total USDC amount to swap
 * @param allocations - Token allocation details
 * @returns Array of swap results containing order IDs
 */
async function checkAndApproveToken(
  provider: JsonRpcProvider,
  tokenAddress: string,
  amount: string
) {
  console.log("\n🔍 Checking USDC balance and allowance...");

  const token = new Contract(tokenAddress, ERC20_ABI, provider);

  const balance = await token.balanceOf(AGENT_WALLET_ADDRESS);
  console.log(`Balance: ${balance.toString()}`);

  if (balance.lt(amount)) {
    throw new Error(
      `Insufficient USDC balance. Required: ${amount}, Available: ${balance.toString()}`
    );
  }
  console.log("✅ Sufficient balance available");

  const allowance = await token.allowance(
    AGENT_WALLET_ADDRESS,
    COW_VAULT_RELAYER
  );
  console.log(`Current allowance: ${allowance.toString()}`);

  if (allowance.lt(amount)) {
    console.log("⚠️ Insufficient allowance. Approving tokens...");

    const approveData = token.interface.encodeFunctionData("approve", [
      COW_VAULT_RELAYER,
      amount,
    ]);

    await sendEthereumTransaction({
      walletId: AGENT_WALLET_ID,
      caip2: getEvmCaip2(BASE_MAINNET.CHAIN_ID),
      transaction: {
        to: tokenAddress,
        data: approveData,
        value: "0",
        chainId: BASE_MAINNET.CHAIN_ID,
      },
    });

    console.log("✅ Approval transaction sent");
  } else {
    console.log("✅ Sufficient allowance already exists");
  }
}

export async function processSwap(
  totalUsdcAmount: string,
  allocations: AllocationPayload
) {
  try {
    console.log("🚀 Starting swap process...");
    console.log("Total USDC amount:", totalUsdcAmount);
    console.log("Allocations:", allocations);

    // Check USDC balance and approve if needed
    await checkAndApproveToken(
      new JsonRpcProvider(RPC_URL),
      BASE_MAINNET.TOKENS.USDC,
      totalUsdcAmount
    );

    // Create a temporary wallet just for getting quotes
    const provider = new JsonRpcProvider(RPC_URL);
    const tempWallet = Wallet.createRandom().connect(provider);

    const sdk = new TradingSdk({
      chainId: BASE_MAINNET.CHAIN_ID,
      signer: tempWallet,
      appCode: COW_APP_CODE,
    });

    // Process each swap sequentially
    const results = [];
    for (let i = 0; i < allocations.assets.length; i++) {
      const asset = allocations.assets[i];
      const allocation = allocations.allocations[i];
      console.log(
        `\n🔄 Processing swap ${i + 1} of ${allocations.assets.length}`
      );
      // Calculate USDC amount to sell for this allocation
      const sellAmount = calculateUsdcSellAmount(totalUsdcAmount, allocation);

      console.log(`\n🔄 Processing swap for ${asset}...`);
      console.log(
        `Amount allocated: ${sellAmount} USDC (${allocation * 100}% of total)`
      );

      // Get token info
      const sellToken: TokenInfo = {
        address: BASE_MAINNET.TOKENS.USDC,
        decimals: BASE_MAINNET.DECIMALS.USDC,
      };

      const buyToken: TokenInfo = {
        address: BASE_MAINNET.TOKENS[asset as keyof typeof BASE_MAINNET.TOKENS],
        decimals:
          BASE_MAINNET.DECIMALS[asset as keyof typeof BASE_MAINNET.DECIMALS],
      };

      // 1. Get quote
      console.log("📊 Getting quote...");
      const { quoteResults, postSwapOrderFromQuote } = await sdk.getQuote(
        {
          kind: OrderKind.SELL,
          sellToken: sellToken.address,
          sellTokenDecimals: sellToken.decimals,
          buyToken: buyToken.address,
          buyTokenDecimals: buyToken.decimals,
          amount: sellAmount,
          receiver: AGENT_WALLET_ADDRESS,
        },
        {
          quoteRequest: {
            signingScheme: SigningScheme.EIP712,
          },
        }
      );

      // Log quote details
      console.log("Quote details:", {
        sellAmount,
        buyAmount:
          quoteResults.amountsAndCosts.afterSlippage.buyAmount.toString(),
      });

      // 2. Sign the order using Privy
      console.log("✍️ Signing order...");
      const { signature } = await signEthereumTypedData({
        walletId: AGENT_WALLET_ID,
        typedData: quoteResults.orderTypedData,
      });

      // 3. Create order with signature
      console.log("📝 Creating order with signature...");
      const orderId = await postSwapOrderFromQuote();

      console.log("✅ Order created with ID:", orderId);

      // Add the result to our array
      results.push({
        asset,
        orderId,
        sellAmount,
        buyAmount:
          quoteResults.amountsAndCosts.afterSlippage.buyAmount.toString(),
        analysis: allocations.analysis.find((a) => a.asset_name === asset)
          ?.reason,
      });
    }

    console.log("\n✨ All swaps completed sequentially!");
    console.log("Results:", results);

    return results;
  } catch (error) {
    console.error("\n❌ Failed to process swap:", error);
    throw new Error(
      `Failed to process swap: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
