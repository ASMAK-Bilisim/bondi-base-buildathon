import React, { useEffect, useState } from 'react';
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import BondOrderBook from '../components/CDSMarket/BondOrderBook';
import { CDS_MANAGER_ADDRESS, cdsManagerABI } from '../constants/contractInfo';
import { client } from '../client';
import { baseSepolia } from 'thirdweb/chains';

interface BondInfo {
  hash: string;
  bondTokenAddress: string;
  nextCouponAmount: string;
  nextCouponDate: number;
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
    "0x220f8f20bc27aa6e88706a7417c63c245c276cc06d8da33bce6d066b1bd072a8",
    "0x9802eb516f71fec07457cf51f95188082740c564b110b271b7ffa220bea8eca5",
    "0x2f0a4b27da03d5d5744fa5a2853d4299e16e2ca03e039deea00f21cbb1dc27cb"
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

  useEffect(() => {
    if (bond1Data && bond2Data && bond3Data) {
      const newBondsInfo = [bond1Data, bond2Data, bond3Data].map((data, index) => ({
        hash: bondHashes[index],
        bondTokenAddress: data[0],
        nextCouponAmount: data[1].toString(),
        nextCouponDate: Number(data[2]),
      }));
      setBondsInfo(newBondsInfo);
    }
  }, [bond1Data, bond2Data, bond3Data]);

  if (bondsInfo.length === 0) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-app-primary-2"></div>
    </div>
  );

  return (
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
  );
};

export default CDSMarket;
