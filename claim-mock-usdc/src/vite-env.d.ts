/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FAUCET_PRIVATE_KEY: string
    readonly VITE_MOCK_USDC_ADDRESS: string
    readonly VITE_BASE_SEPOLIA_CHAIN_ID: string
    // Add other env variables as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }