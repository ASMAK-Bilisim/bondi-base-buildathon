import React, { useEffect, useState } from 'react';
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import BondOrderBook from '../components/CDSMarket/BondOrderBook';
import { CDS_MANAGER_ADDRESS, cdsManagerABI } from '../constants/contractInfo';
import { client } from '../client';
import { baseSepolia } from 'thirdweb/chains';
import { NotificationProvider } from '../components/contexts/NotificationContext';


interface BondInfo {
  hash: `0x${string}`;
  bondTokenAddress: string;
  nextCouponAmount: string;
  nextCouponDate: number;
  baseName: string;
}

const CDSMarket: React.FC = () => {
  const [bondsInfo, setBondsInfo] = useState<BondInfo[]>([]);

  const cdsManagerContract = getContract({
    client,
    address: CDS_MANAGER_ADDRESS,
    abi: cdsManagerABI,
    chain: baseSepolia,
  });

  const bondHashes = [
    "0x0265c651436ffc2bf316776ba3e9574d01d3d1c651c59059dab7dc22a4e891c3",
    "0xa29ce4538e275a93c7c2421b6222f2f034d9b7e487808551519112e060f8ef0a",
    "0xcecde1728274de089ac3991a0d71061962be8bd1a0f6100b9578873f31f967da"
  ];

  const { data: bond1Data } = useReadContract({
    contract: cdsManagerContract,
    method: "function getBond(bytes32 bondAddressAndExpiration) view returns (address, uint256, uint256)",
    params: [bondHashes[0] as `0x${string}`],
  });

  const { data: bond2Data } = useReadContract({
    contract: cdsManagerContract,
    method: "function getBond(bytes32 bondAddressAndExpiration) view returns (address, uint256, uint256)",
    params: [bondHashes[1] as `0x${string}`],
  });

  const { data: bond3Data } = useReadContract({
    contract: cdsManagerContract,
    method: "function getBond(bytes32 bondAddressAndExpiration) view returns (address, uint256, uint256)",
    params: [bondHashes[2] as `0x${string}`],
  });

  const baseNameMap: { [key: string]: string } = {
    "0xe48B71132F2E8df6De19C13Ed1D68b52D82f094A": "zetabondzz.basetest.eth",
    "0x093A98F9fAeA01c73a51F978714a638708FFa90f": "betabondzz.basetest.eth",
    "0x01Cf7c1C65A66f65A38893e831a3107EE842Ce81": "alphabondzz.basetest.eth"
  };

  //Fetching addresses from basenames resolver works but cannot fetch basenames from addresses

  useEffect(() => {
    const fetchBondInfo = async () => {
      if (bond1Data && bond2Data && bond3Data) {
        const newBondsInfo = [bond1Data, bond2Data, bond3Data].map((data, index) => {
          const bondTokenAddress = data[0] as `0x${string}`;
          if (!bondTokenAddress) {
            console.error(`Bond token address is undefined for hash: ${bondHashes[index]}`);
            return null;
          }
          
          return {
            hash: bondHashes[index] as `0x${string}`,
            bondTokenAddress,
            nextCouponAmount: data[1]?.toString() || '0',
            nextCouponDate: Number(data[2]) || 0,
            baseName: baseNameMap[bondTokenAddress] || bondTokenAddress,
          };
        });
        
        const validBondsInfo = newBondsInfo.filter(Boolean) as BondInfo[];
        setBondsInfo(validBondsInfo);
        console.log('Updated Bonds Info:', validBondsInfo);
      }
    };

    fetchBondInfo();
  }, [bond1Data, bond2Data, bond3Data]);

  if (bondsInfo.length === 0) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-app-primary-2"></div>
    </div>
  );

  return (
    <NotificationProvider>
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bondsInfo.map((bondInfo) => (
              <div key={bondInfo.hash} className="flex justify-center">
                <BondOrderBook bondInfo={bondInfo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default CDSMarket;