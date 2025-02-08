import { Router, RequestHandler } from "express";
import { swapService } from "../services/swap.service";
import { AllocationPayload } from "../lib/interfaces";

export const swapRouter: Router = Router();

interface QuoteQuery {
  fromToken?: string;
  fromTokenDecimals?: string;
  toToken?: string;
  toTokenDecimals?: string;
  fromAmount?: string;
}

interface SwapBody {
  fromToken: string;
  fromTokenDecimals: number;
  toToken: string;
  toTokenDecimals: number;
  fromAmount: string;
}

interface AllocationSwapBody {
  totalUsdcAmount: string;
  allocations: AllocationPayload;
}

// GET /api/v1/swap/quote
const getQuote: RequestHandler<{}, any, any, QuoteQuery> = async (req, res) => {
  try {
    const {
      fromToken,
      fromTokenDecimals,
      toToken,
      toTokenDecimals,
      fromAmount,
    } = req.query;

    if (
      !fromToken ||
      !fromTokenDecimals ||
      !toToken ||
      !toTokenDecimals ||
      !fromAmount
    ) {
      res.status(400).json({
        error: "Missing required parameters",
      });
      return;
    }

    const quote = await swapService.getQuote(
      fromToken,
      Number(fromTokenDecimals),
      toToken,
      Number(toTokenDecimals),
      fromAmount
    );

    res.json(quote);
  } catch (error) {
    console.error("Error getting quote:", error);
    res.status(500).json({
      error: "Failed to get quote",
    });
  }
};

// POST /api/v1/swap/execute
const executeSwap: RequestHandler<{}, any, SwapBody> = async (req, res) => {
  try {
    const {
      fromToken,
      fromTokenDecimals,
      toToken,
      toTokenDecimals,
      fromAmount,
    } = req.body;

    if (
      !fromToken ||
      !fromTokenDecimals ||
      !toToken ||
      !toTokenDecimals ||
      !fromAmount
    ) {
      res.status(400).json({
        error: "Missing required parameters",
      });
      return;
    }

    const result = await swapService.executeSwap(
      fromToken,
      fromTokenDecimals,
      toToken,
      toTokenDecimals,
      fromAmount
    );

    res.json(result);
  } catch (error) {
    console.error("Error executing swap:", error);
    res.status(500).json({
      error: "Failed to execute swap",
    });
  }
};

// POST /api/v1/swap/allocations
const executeAllocationSwaps: RequestHandler<
  {},
  any,
  AllocationSwapBody
> = async (req, res) => {
  try {
    const { totalUsdcAmount, allocations } = req.body;

    if (!totalUsdcAmount || !allocations) {
      res.status(400).json({
        error: "Missing required parameters",
      });
      return;
    }

    // Validate allocations sum to 1 (100%)
    const totalAllocation = allocations.allocations.reduce(
      (sum, allocation) => sum + allocation,
      0
    );
    if (Math.abs(totalAllocation - 1) > 0.0001) {
      // Allow for small floating point differences
      res.status(400).json({
        error: "Allocations must sum to 1 (100%)",
      });
      return;
    }

    const results = await swapService.executeAllocationSwaps(
      totalUsdcAmount,
      allocations
    );
    res.json(results);
  } catch (error) {
    console.error("Error executing allocation swaps:", error);
    res.status(500).json({
      error: "Failed to execute allocation swaps",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

swapRouter.get("/quote", getQuote);
swapRouter.post("/execute", executeSwap);
swapRouter.post("/allocations", executeAllocationSwaps);
