import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { getContract } from "../_utils/contract";
import { WalletContext } from "../context/wallet";

export const useDriveTokens = (walletAddress: string) => {
  // Contractインスタンス作成
  const contract: ethers.Contract = getContract();
  const wallet = useContext(WalletContext);


  // 対象のウォレットが持つ各パラメーターの数値を取得
  const [amounts, setAmounts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // 財布がつながっていない場合は処理をしない
    if (wallet.connected) {
      const walletAddressList = new Array<string>(5).fill(wallet.address as string);
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
  }, [contract, wallet]);
  return {
    amounts,
    isLoading,
  };
};
