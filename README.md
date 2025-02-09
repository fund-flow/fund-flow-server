# Fund Flow Server

- Privy Server Wallet
- CoW Swap

## Example usage

```
POST http://localhost:3000/api/v1/swap/allocations
Content-Type: application/json

{
  "totalUsdcAmount": "100000000", // 100 USDC (6 decimals)
  "allocations": {
    "assets": ["OETHb", "WETH", "cbBTC", "AERO", "wstETH"],
    "allocations": [0.25, 0.25, 0.2, 0.15, 0.15],
    "analysis": [
      {
        "asset_name": "OETHb",
        "reason": "OETHb has a significant TVL and consistent trading volume..."
      },
      // ... other analysis entries
    ]
  }
}
```
