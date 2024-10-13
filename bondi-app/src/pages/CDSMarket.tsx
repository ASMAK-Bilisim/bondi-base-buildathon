import React, { useEffect, useState } from 'react';
import { useContract, useContractRead } from "@thirdweb-dev/react";
import BondOrderBook from '../components/CDSMarket/BondOrderBook';
import { CDS_MANAGER_ADDRESS, cdsManagerABI } from '../constants/contractInfo';

interface BondInfo {
  hash: string;
  bondTokenAddress: string;
  nextCouponAmount: string;
  nextCouponDate: number;
}

const CDSMarket: React.FC = () => {
  const [bondsInfo, setBondsInfo] = useState<BondInfo[]>([]);
  const { contract } = useContract(CDS_MANAGER_ADDRESS, cdsManagerABI);

  const bondHashes = [
    "0x32097aa1da9e7bce4971f6119942240b9c2d959d2d660fdc17155f6c8103e833",
    "0x3cb36bcaa1008e2d3f5906ae1d92c50df4a06f107d51a027dd811785fabf8e01",
    "0x3e64795fbb48ec889da2c03bd058900a4d666a64e57fe472c08b1d346081edf8"
  ];

  const { data: bond1Data } = useContractRead(contract, "getBond", [bondHashes[0]]);
  const { data: bond2Data } = useContractRead(contract, "getBond", [bondHashes[1]]);
  const { data: bond3Data } = useContractRead(contract, "getBond", [bondHashes[2]]);

  useEffect(() => {
    if (bond1Data && bond2Data && bond3Data) {
      const newBondsInfo = [bond1Data, bond2Data, bond3Data].map((data, index) => ({
        hash: bondHashes[index],
        bondTokenAddress: data[0],
        nextCouponAmount: data[1].toString(),
        nextCouponDate: data[2].toNumber(),
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
