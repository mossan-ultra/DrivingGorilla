import { useState, useEffect, useContext } from "react";
import { getContract } from "../_utils/contract";
import { Contract } from "ethers";
import { WalletContext } from "../context/wallet";

export type StayGori = {
  location: number;
  owner: string;
  imageUri: string;
  period: number;
  createdAt: number;
  tokenId: number;
};

export type UseStayGoriResult = {
  staygoris: StayGori[];
  isLoading: boolean;
};

export const useStayGori: () => UseStayGoriResult = () => {
  const [isLoading, setIsLoading] = useState(true);
  const contract: Contract = getContract();
  const [staygoris, setStayGoris] = useState<StayGori[]>([]);
  const wallet = useContext(WalletContext);

  useEffect(() => {
    const _stayGori: StayGori[] = [];
    if (wallet.connected) {
      (async () => {
        const recv = await contract.queryFilter(
          contract.filters.StayGoriMinted()
        );
        for (const log of recv) {
          // Eventのargsがない場合はスキップ
          if (!log.args) continue;
          // argsを分割代入
          const item = log.args;

          _stayGori.push({
            owner: item.owner,
            location: item.location as number,
            period: item.period as number,
            imageUri: item.imageUri,
            createdAt: item.createdAt as number,
            tokenId: item.tokenId as number,
          });
        }
        setStayGoris([..._stayGori]);
        setIsLoading(false);
      })();
    }
  }, [contract, wallet]);

  return {
    staygoris: staygoris,
    isLoading: isLoading,
  };
};
