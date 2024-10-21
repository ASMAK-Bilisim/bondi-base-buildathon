"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { OG_NFT_ADDRESS, WHALE_NFT_ADDRESS } from "../constants/contractInfo";
import { parseAbiItem } from "viem";
import { viemClientPublic } from "../client";
import { Log } from "viem";

// Define the Transfer event type
type TransferEvent = Log<bigint, number, false> & {
  args: {
    from: `0x${string}`;
    to: `0x${string}`;
    tokenId: bigint;
  };
};

export type TAppContext = {
  ogNftTransfers: TransferEvent[];
  whaleNftTransfers: TransferEvent[];
  OG_NFT_ADDRESS: `0x${string}`;
  WHALE_NFT_ADDRESS: `0x${string}`;
};

const AppContext = createContext({} as TAppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const publicClient = viemClientPublic;
  const [ogNftTransfers, setOgNftTransfers] = useState<TransferEvent[]>([]);
  const [whaleNftTransfers, setWhaleNftTransfers] = useState<TransferEvent[]>(
    []
  );

  console.log(ogNftTransfers);
  console.log(whaleNftTransfers);

  useEffect(() => {
    const transferEvent = parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    );

    const unwatch1 = publicClient.watchEvent({
      address: OG_NFT_ADDRESS,
      event: transferEvent,
      onLogs: (logs) => {
        setOgNftTransfers((prev) => [...prev, ...(logs as TransferEvent[])]);
      },
      onError: (error) => {
        console.error(error);
      },
    });

    const unwatch2 = publicClient.watchEvent({
      address: WHALE_NFT_ADDRESS,
      event: transferEvent,
      onLogs: (logs) => {
        setWhaleNftTransfers((prev) => [...prev, ...(logs as TransferEvent[])]);
      },
      onError: (error) => {
        console.error(error);
      },
    });

    return () => {
      unwatch1();
      unwatch2();
    };
  }, [publicClient]);

  // CONTEXT
  //==============================================
  const contextData: TAppContext = {
    OG_NFT_ADDRESS,
    WHALE_NFT_ADDRESS,
    ogNftTransfers,
    whaleNftTransfers,
  };

  // RETURN
  //==============================================
  return (
    <AppContext.Provider value={contextData}>{children}</AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
