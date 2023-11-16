import { useContext, useEffect, useState } from "react";
import { base64Decode } from "../_utils/common";
import { getContract, getContractWithSigner } from "../_utils/contract";
import { useContract } from "./useContract";
import GoriTokenAbi from "../_abi/GoriToken.json";
import { GORITOKEN_CONTRACT_ADDRESS } from "../_const/contracts";
import { WalletContext } from "../context/wallet";

const BUDDY_GORI_TOKEN_ID = 0;

export const useBuddyGori = () => {
  // 財布接続状況
  const wallet = useContext(WalletContext);
  const overrides = {
    from: wallet.address,
  };

  // Metamaskをproviderとしたcontractを利用
  // const { contract, isLoading: isContractLoading } = useContract(GORITOKEN_CONTRACT_ADDRESS, GoriTokenAbi.abi);
  const contract = getContract();

  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isHoldBuddy, setIsHoldBuddy] = useState(false);

  useEffect(() => {
    if (wallet.connected) {
      (async () => {
        // Token0のデータを取得
        const myGori64 = await contract!.myuri(wallet.address, BUDDY_GORI_TOKEN_ID);
        const balance = await contract.balanceOf(wallet.address, BUDDY_GORI_TOKEN_ID);
        setIsHoldBuddy(balance > 0);

        const json = await base64Decode(myGori64);
        const myGori = JSON.parse(json);
        setName(myGori.name);
        setImgUrl(myGori.image);
        setIsLoading(false);
      })();
    }
  }, [wallet]);

  return {
    name,
    imgUrl,
    isHoldBuddy,
    isLoading,
  };
};
