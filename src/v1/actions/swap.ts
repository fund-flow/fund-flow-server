import express, { RequestHandler } from "express";
import { swapService } from "../services/swap.service";

export const swapRouter = express.Router();

interface SwapRequest {
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

const handleSwap: RequestHandler<{}, any, SwapRequest> = async (req, res) => {
  try {
    console.log("Received swap request:", req.body);
    const { totalUsdcAmount, allocations } = req.body;

    // Validate request
    if (!totalUsdcAmount || !allocations || !allocations.userWallet) {
      console.log("Invalid request parameters");
      res.status(400).json({ error: "Invalid request parameters" });
      return;
    }

    if (allocations.assets.length !== allocations.allocations.length) {
      console.log("Assets and allocations length mismatch");
      res.status(400).json({ error: "Assets and allocations length mismatch" });
      return;
    }

    // Validate allocations sum to 1
    const totalAllocation = allocations.allocations.reduce(
      (sum: number, allocation: number) => sum + allocation,
      0
    );
    if (Math.abs(totalAllocation - 1) > 0.0001) {
      console.log("Allocations must sum to 1");
      res.status(400).json({ error: "Allocations must sum to 1" });
      return;
    }

    console.log("Executing swaps with total USDC amount:", totalUsdcAmount);
    // Execute swaps
    const swapResults = await swapService.executeAllocationSwaps(
      totalUsdcAmount,
      {
        ...allocations,
        userWallet: allocations.userWallet,
      }
    );

    console.log("Swaps executed successfully");
    res.json({
      success: true,
      message: "Swaps executed successfully",
      results: swapResults,
    });
  } catch (error) {
    console.error("Error in handleSwap:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

swapRouter.post("/", handleSwap);
