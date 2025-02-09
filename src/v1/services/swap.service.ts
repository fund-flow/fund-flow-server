import {
  OrderBookApi,
  OrderKind,
  OrderQuoteSideKindSell,
  TradeParameters,
  TradingSdk,
} from "@cowprotocol/cow-sdk";
import {
  BASE_MAINNET,
  COW_APP_CODE,
  PRIVATE_KEY,
  WALLET_ADDRESS,
} from "../lib/constants";
import { AllocationPayload } from "../lib/interfaces";
import { getTokenInfo } from "../helpers/getTokenInfo";

export class SwapService {
  private sdk: TradingSdk;
  private orderBookApi: OrderBookApi;
  private walletAddress: string;

  constructor() {
    if (!PRIVATE_KEY || !COW_APP_CODE || !WALLET_ADDRESS) {
      throw new Error(
        "PRIVATE_KEY, APP_CODE, and WALLET_ADDRESS environment variables are required"
      );
    }

    this.walletAddress = WALLET_ADDRESS;

    // Initialize SDK with Base mainnet
    this.sdk = new TradingSdk({
      chainId: BASE_MAINNET.CHAIN_ID,
      signer: PRIVATE_KEY,
      appCode: COW_APP_CODE,
    });

    this.orderBookApi = new OrderBookApi({ chainId: BASE_MAINNET.CHAIN_ID });
  }

  private calculateUsdcAmount(totalAmount: string, allocation: number): string {
    const amount = BigInt(totalAmount);
    const allocationBps = Math.floor(allocation * 10000); // Convert to basis points
    return ((amount * BigInt(allocationBps)) / BigInt(10000)).toString();
  }

  async executeAllocationSwaps(
    totalUsdcAmount: string,
    payload: AllocationPayload
  ) {
    const results = [];
    const usdcInfo = getTokenInfo("USDC");

    for (let i = 0; i < payload.assets.length; i++) {
      const asset = payload.assets[i];
      const allocation = payload.allocations[i];
      const tokenInfo = getTokenInfo(asset);

      // Calculate USDC amount for this allocation
      const usdcAmount = this.calculateUsdcAmount(totalUsdcAmount, allocation);

      try {
        // Get quote first
        const quote = await this.getQuote(
          usdcInfo.address,
          usdcInfo.decimals,
          tokenInfo.address,
          tokenInfo.decimals,
          usdcAmount
        );

        // Execute swap
        const result = await this.executeSwap(
          usdcInfo.address,
          usdcInfo.decimals,
          tokenInfo.address,
          tokenInfo.decimals,
          usdcAmount
        );

        results.push({
          asset,
          allocation,
          usdcAmount,
          expectedTokenAmount: quote.toAmount,
          orderId: result.orderId,
        });
      } catch (error) {
        console.error(`Error swapping for ${asset}:`, error);
        throw error;
      }
    }

    return results;
  }

  async getQuote(
    fromToken: string,
    fromTokenDecimals: number,
    toToken: string,
    toTokenDecimals: number,
    fromAmount: string
  ) {
    const quoteRequest = {
      sellToken: fromToken,
      buyToken: toToken,
      from: this.walletAddress,
      receiver: this.walletAddress,
      sellAmountBeforeFee: fromAmount,
      kind: "sell" as OrderQuoteSideKindSell,
    };

    try {
      const { quote } = await this.orderBookApi.getQuote(quoteRequest);
      return {
        fromToken,
        fromAmount,
        toToken,
        toAmount: quote.buyAmount,
      };
    } catch (error) {
      console.error("Error getting quote:", error);
      throw error;
    }
  }

  async executeSwap(
    fromToken: string,
    fromTokenDecimals: number,
    toToken: string,
    toTokenDecimals: number,
    fromAmount: string
  ) {
    const parameters: TradeParameters = {
      kind: OrderKind.SELL,
      sellToken: fromToken,
      sellTokenDecimals: fromTokenDecimals,
      buyToken: toToken,
      buyTokenDecimals: toTokenDecimals,
      amount: fromAmount,
    };

    try {
      const orderId = await this.sdk.postSwapOrder(parameters);
      return { orderId };
    } catch (error) {
      console.error("Error executing swap:", error);
      throw error;
    }
  }
}

export const swapService = new SwapService();
