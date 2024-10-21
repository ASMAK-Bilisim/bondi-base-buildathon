import { createThirdwebClient } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import { baseSepolia } from "thirdweb/chains";
import { Account } from "thirdweb/wallets";
import {
  Chain,
  Transport,
  WalletClient,
  Account as ViemAccount,
  PublicClient,
} from "viem";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

// convert a thirdweb account to viem wallet client
export const getViemClientWallet: (
  account: Account | undefined
) => Promise<WalletClient<Transport, Chain, ViemAccount>> = (account) =>
  !account
    ? null
    : (viemAdapter.walletClient.toViem({
        client,
        chain: baseSepolia,
        account,
      }) as any);

// convert a thirdweb account to viem public client
export const viemClientPublic: PublicClient<Transport, Chain> =
  viemAdapter.publicClient.toViem({
    client,
    chain: baseSepolia,
  }) as any;
