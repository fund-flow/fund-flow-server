import { Router, Request, Response, RequestHandler } from "express";
import { processSwap } from "../../services/swap.service";
import { AllocationPayload } from "../../lib/interfaces";

interface SwapRequestBody {
  totalUsdcAmount: string;
  allocations: {
    userWallet: string;
    assets: string[];
    allocations: number[];
    analysis: {
      asset_name: string;
      reason: string;
    }[];
  };
}

export const swapRouter = Router();

const handleSwap: RequestHandler<{}, any, SwapRequestBody> = async (
  req,
  res
) => {
  try {
    const { totalUsdcAmount, allocations } = req.body;

    // Validate request body
    if (!totalUsdcAmount || !allocations) {
      res.status(400).json({
        error: "Missing required fields: totalUsdcAmount and allocations",
      });
      return;
    }

    // Validate allocations
    if (
      !allocations.userWallet ||
      !allocations.assets ||
      !allocations.allocations ||
      !allocations.analysis ||
      allocations.assets.length !== allocations.allocations.length ||
      allocations.assets.length !== allocations.analysis.length
    ) {
      res.status(400).json({
        error: "Invalid allocations format",
      });
      return;
    }

    // Validate allocation percentages sum to 1
    const totalAllocation = allocations.allocations.reduce(
      (sum: number, allocation: number) => sum + allocation,
      0
    );
    if (Math.abs(totalAllocation - 1) > 0.0001) {
      res.status(400).json({
        error: "Allocations must sum to 1",
      });
      return;
    }

    // Convert USDC amount to proper decimal format (6 decimals)
    const usdcAmount = (Number(totalUsdcAmount) * 1000000).toString();

    // Format the allocation payload
    const allocationPayload: AllocationPayload = {
      userWalletAddress: allocations.userWallet,
      assets: allocations.assets,
      allocations: allocations.allocations,
      analysis: allocations.analysis,
    };

    // Process the swap
    const result = await processSwap(usdcAmount, allocationPayload);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Swap error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

swapRouter.post("/", handleSwap);
