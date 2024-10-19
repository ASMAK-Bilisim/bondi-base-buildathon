/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ADMIN_PRIVATE_KEY: string
    readonly VITE_BASE_SEPOLIA_RPC: string
    readonly VITE_BASE_SEPOLIA_CHAIN_ID: string
    readonly VITE_ALPHA_FUNDING_CONTRACT: string
    readonly VITE_BETA_FUNDING_CONTRACT: string
    readonly VITE_ZETA_FUNDING_CONTRACT: string
    // Add other env variables as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
