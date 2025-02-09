import dotenv from "dotenv";

dotenv.config();

// BASE TOKEN CONFIGS
export const BASE_MAINNET = {
  // Token Addresses on Base Mainnet
  TOKENS: {
    // STABLES
    USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    // ETH
    WETH: "0x4200000000000000000000000000000000000006",
    OETHb: "0xdbfefd2e8460a6ee4955a68582f85708baea60a3",
    wstETH: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
    // BTC
    cbBTC: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    LBTC: "0xecac9c5f704e954931349da37f60e39f515c11c1",
    // SOL
    uSOL: "0x9b8df6e244526ab5f6e6400d331db28c8fdddb55",
    // ALTS
    AERO: "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
    VIRTUAL: "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b",
    // MEMES
    AIXBT: "0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825",
  },
  // Token Decimals
  DECIMALS: {
    // STABLES
    USDC: 6,
    // ETH
    WETH: 18,
    OETHb: 18,
    wstETH: 18,
    // BTC
    cbBTC: 8,
    LBTC: 8,
    // SOL
    uSOL: 18,
    // ALTS
    AERO: 18,
    VIRTUAL: 18,
    // MEMES
    AIXBT: 18,
  },
  // Chain ID for Base Mainnet
  CHAIN_ID: 8453,
};

// PRIVY CONFIGS
export const PRIVY_APP_ID = process.env.PRIVY_APP_ID as string;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET as string;

// COW PROTOCOL CONFIGS
export const COW_APP_CODE = process.env.APP_CODE as string;

// PERSONAL CONFIGS
export const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
export const WALLET_ADDRESS = process.env.WALLET_ADDRESS as string;
