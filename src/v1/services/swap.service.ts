import {
  OrderBookApi,
  OrderKind,
  OrderQuoteSideKindSell,
  TradeParameters,
  TradingSdk,
} from "@cowprotocol/cow-sdk";
import { ethers } from "ethers";
import {
  BASE_MAINNET,
  COW_APP_CODE,
  PRIVATE_KEY,
} from "../lib/constants";
import { AllocationPayload } from "../lib/interfaces";
import { getTokenInfo } from "../helpers/getTokenInfo";

export class SwapService {
  private sdk: TradingSdk;
  private orderBookApi: OrderBookApi;
  private signerAddress: string;

  constructor() {
    if (!PRIVATE_KEY || !COW_APP_CODE) {
      throw new Error(
        "PRIVATE_KEY and APP_CODE environment variables are required"
      );
    }

    console.log("Initializing TradingSdk with Base mainnet...");
    this.sdk = new TradingSdk({
      chainId: BASE_MAINNET.CHAIN_ID,
      signer: PRIVATE_KEY,
      appCode: COW_APP_CODE,
    });

    console.log("Initializing OrderBookApi...");
    this.orderBookApi = new OrderBookApi({ chainId: BASE_MAINNET.CHAIN_ID });
    
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    this.signerAddress = wallet.address;
    console.log(`Signer address derived: ${this.signerAddress}`);
  }

  private calculateUsdcAmount(totalAmount: string, allocation: number): string {
    console.log(`Calculating USDC amount for totalAmount: ${totalAmount}, allocation: ${allocation}`);
    const amount = BigInt(totalAmount);
    const allocationBps = Math.floor(allocation * 10000); // Convert to basis points
    const calculatedAmount = ((amount * BigInt(allocationBps)) / BigInt(10000)).toString();
    console.log(`Calculated USDC amount: ${calculatedAmount}`);
    return calculatedAmount;
  }

  async executeAllocationSwaps(
    totalUsdcAmount: string,
    payload: AllocationPayload
  ) {
    console.log("Executing allocation swaps...");
    const results = [];
    const usdcInfo = getTokenInfo("USDC");

    for (let i = 0; i < payload.assets.length; i++) {
      const asset = payload.assets[i];
      const allocation = payload.allocations[i];
      const tokenInfo = getTokenInfo(asset);

      console.log(`Processing asset: ${asset}, allocation: ${allocation}`);
      const usdcAmount = this.calculateUsdcAmount(totalUsdcAmount, allocation);

      try {
        console.log(`Getting quote for asset: ${asset}`);
        const quote = await this.getQuote(
          usdcInfo.address,
          usdcInfo.decimals,
          tokenInfo.address,
          tokenInfo.decimals,
          usdcAmount,
          payload.userWallet
        );

        console.log(`Executing swap for asset: ${asset}`);
        const result = await this.executeSwap(
          usdcInfo.address,
          usdcInfo.decimals,
          tokenInfo.address,
          tokenInfo.decimals,
          usdcAmount,
          payload.userWallet
        );

        results.push({
          asset,
          allocation,
          usdcAmount,
          expectedTokenAmount: quote.toAmount,
          orderId: result.orderId,
        });
        console.log(`Swap executed for asset: ${asset}, orderId: ${result.orderId}`);
      } catch (error) {
        console.error(`Error swapping for ${asset}:`, error);
        throw error;
      }
    }

    console.log("Allocation swaps execution completed.");
    return results;
  }

  async getQuote(
    fromToken: string,
    fromTokenDecimals: number,
    toToken: string,
    toTokenDecimals: number,
    fromAmount: string,
    userWallet: string
  ) {
    console.log(`Requesting quote from ${fromToken} to ${toToken} for amount: ${fromAmount}`);
    const quoteRequest = {
      sellToken: fromToken,
      buyToken: toToken,
      from: this.signerAddress,
      receiver: userWallet,
      sellAmountBeforeFee: fromAmount,
      kind: "sell" as OrderQuoteSideKindSell,
    };

    try {
      const { quote } = await this.orderBookApi.getQuote(quoteRequest);
      console.log(`Quote received: ${quote.buyAmount} of ${toToken}`);
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
    fromAmount: string,
    userWallet: string
  ) {
    console.log(`Executing swap from ${fromToken} to ${toToken} for amount: ${fromAmount}`);
    const parameters: TradeParameters = {
      kind: OrderKind.SELL,
      sellToken: fromToken,
      sellTokenDecimals: fromTokenDecimals,
      buyToken: toToken,
      buyTokenDecimals: toTokenDecimals,
      amount: fromAmount,
      receiver: userWallet,
    };

    try {
      const orderId = await this.sdk.postSwapOrder(parameters);
      console.log(`Swap executed successfully, orderId: ${orderId}`);
      return { orderId };
    } catch (error) {
      console.error("Error executing swap:", error);
      throw error;
    }
  }
}

export const swapService = new SwapService();
