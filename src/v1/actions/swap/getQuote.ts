import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk,
  SigningScheme,
  SwapAdvancedSettings,
} from "@cowprotocol/cow-sdk";
import { TokenInfo } from "../../lib/interfaces";
import {
  AGENT_WALLET_ADDRESS,
  BASE_MAINNET,
  COW_APP_CODE,
  RPC_URL,
} from "../../lib/constants";
import { VoidSigner } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";

/**
 * Gets a quote for a swap using COW Protocol
 * @param walletId - The Privy wallet ID
 * @param sellToken - The token to sell
 * @param buyToken - The token to buy
 * @param amount - The amount to trade (in base units)
 * @param kind - The type of order (BUY or SELL)
 * @returns Promise containing the quote results and a function to post the swap order
 * @throws Error if quote retrieval fails
 */
export async function getQuote(
  walletId: string,
  sellToken: TokenInfo,
  buyToken: TokenInfo,
  amount: string,
  kind: OrderKind = OrderKind.SELL
) {
  try {
    console.log("🔎 Getting quote for trade...");
    console.log({
      sellToken: sellToken.address,
      buyToken: buyToken.address,
      amount,
      kind,
    });

    const sdk = new TradingSdk({
      chainId: BASE_MAINNET.CHAIN_ID,
      signer: new VoidSigner(
        AGENT_WALLET_ADDRESS,
        new JsonRpcProvider(RPC_URL)
      ),
      appCode: COW_APP_CODE,
    });

    const parameters: TradeParameters = {
      kind,
      sellToken: sellToken.address,
      sellTokenDecimals: sellToken.decimals,
      buyToken: buyToken.address,
      buyTokenDecimals: buyToken.decimals,
      amount,
    };

    const advancedParameters: SwapAdvancedSettings = {
      quoteRequest: {
        signingScheme: SigningScheme.EIP712,
      },
    };

    console.log("📊 Fetching quote with parameters:", parameters);

    const { quoteResults, postSwapOrderFromQuote } = await sdk.getQuote(
      parameters,
      advancedParameters
    );

    console.log("✅ Quote received:", {
      sellAmount:
        quoteResults.amountsAndCosts.afterSlippage.sellAmount.toString(),
      buyAmount:
        quoteResults.amountsAndCosts.afterSlippage.buyAmount.toString(),
    });

    return {
      quoteResults,
      postSwapOrderFromQuote,
      orderToSign: quoteResults.orderToSign,
    };
  } catch (error) {
    console.error("❌ Failed to get quote:", error);
    throw new Error(
      `Failed to get quote: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
