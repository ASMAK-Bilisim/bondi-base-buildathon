import { useQuery, UseQueryResult } from "react-query";
import { useActiveAccount } from "thirdweb/react";
import { getViemClientWallet } from "../client";
import { WalletClient, Transport, Chain, Account } from "viem";

export const useWalletClient: () => UseQueryResult<WalletClient<
  Transport,
  Chain,
  Account
> | null> = () => {
  const account = useActiveAccount();

  const query = useQuery({
    queryKey: ["walletClient", account?.address],
    queryFn: () => getViemClientWallet(account),
  });

  return query;
};
