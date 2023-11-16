import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { walletConnectionAtom } from "../_recoil/atoms/web3";
import { getContract } from "../_utils/contract";

export const useDriveTokens = (walletAddress: string) => {
  // Contractインスタンス作成
  const contract: ethers.Contract = getContract();

  // 財布接続状況
  const isWalletConnected = useRecoilValue(walletConnectionAtom);

  // 対象のウォレットが持つ各パラメーターの数値を取得
  const [amounts, setAmounts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // 財布がつながっていない場合は処理をしない
    if (isWalletConnected) {
      const walletAddressList = new Array<string>(5).fill(walletAddress);
      const paramsId = ["1", "2", "3", "4", "5"];
      (async () => {
        const results = await contract.balanceOfBatch(
          walletAddressList,
          paramsId
        );

        const amountsTemp = results.map((r: BigNumber) =>
          Number(ethers.utils.formatEther(r))
        );
        setAmounts(amountsTemp);
        setIsLoading(false);
      })();
    }
  }, [contract, isWalletConnected, walletAddress]);
  return {
    amounts,
    isLoading,
  };
};
