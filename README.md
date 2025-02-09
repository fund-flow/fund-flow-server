# Fund Flow Server

- Privy Server Wallet
- CoW Swap

## Example usage

```bash
curl --location 'http://localhost:3050/api/v1/swap' \
--header 'Content-Type: application/json' \
--data '{
    "totalUsdcAmount": "5000000",
    "allocations": {
        "userWallet": "0x2e84B79dd9773d712f9D20a98C4ee76541B9533D",
        "assets": [
            "OETHb",
            "WETH",
            "cbBTC",
            "AERO",
            "wstETH"
        ],
        "allocations": [
            0.25,
            0.25,
            0.2,
            0.15,
            0.15
        ],
        "analysis": [
            {
                "asset_name": "OETHb",
                "reason": "OETHb has a significant TVL and consistent trading volume, indicating strong market activity and potential for long-term growth."
            },
            {
                "asset_name": "WETH",
                "reason": "WETH is a widely used asset with high liquidity and trading volume, making it a stable choice for a medium-risk portfolio."
            },
            {
                "asset_name": "cbBTC",
                "reason": "cbBTC offers exposure to Bitcoin'\''s price movements and has a substantial TVL, aligning with a medium-risk tolerance."
            },
            {
                "asset_name": "AERO",
                "reason": "AERO has a growing ecosystem and moderate TVL, providing diversification and potential for growth."
            },
            {
                "asset_name": "wstETH",
                "reason": "wstETH represents staked Ether, offering exposure to Ethereum'\''s ecosystem with added staking benefits."
            }
        ]
    }
}'
```