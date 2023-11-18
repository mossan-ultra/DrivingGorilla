import { useCallback, useContext, useEffect, useState } from "react";
import { base64Decode } from "../_utils/common";
import { getContract } from "../_utils/contract";
import { GORITOKEN_CONTRACT_ADDRESS } from "../_const/contracts";
import { WalletContext } from "../context/wallet";
import { BuddyGoriContext } from "../context/buddyGori";
import { useContract } from "./useContract";
import TokenContract from "../_abi/GoriToken.json";
import { Contract } from "ethers";
import { GelatoContract } from "../gelato/gelatoContract";

const BUDDY_GORI_TOKEN_ID = 0;

export const useBuddyGori = (): BuddyGoriContext => {
  // 財布接続状況
  const wallet = useContext(WalletContext);
  // const { contract: tokenContract, isLoading: contractLoading } = useContract(GORITOKEN_CONTRACT_ADDRESS, TokenContract.abi);
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
  const [isReload, setReload] = useState(false);

  useEffect(() => {

    if (wallet.connected) {

      (async () => {
        // Token0のデータを取得
        const myGori64 = await contract!.myuri(wallet.address, BUDDY_GORI_TOKEN_ID);
        const balance = await contract!.balanceOf(wallet.address, BUDDY_GORI_TOKEN_ID);
        setIsHoldBuddy(balance > 0);

        const json = await base64Decode(myGori64);
        const myGori = JSON.parse(json);
        setName(myGori.name);
        setImgUrl(myGori.image);
        setIsLoading(false);
      })();
    }
  }, [isReload, wallet.connected]);

  const deleteBuddy = useCallback(() => {
    setIsHoldBuddy(false)
  }, []);


  const reload = useCallback(() => {
    (async () => {
      // Token0のデータを取得
      const myGori64 = await contract!.myuri(wallet.address, BUDDY_GORI_TOKEN_ID);
      const balance = await contract!.balanceOf(wallet.address, BUDDY_GORI_TOKEN_ID);
      setIsHoldBuddy(balance > 0);

      const json = await base64Decode(myGori64);
      const myGori = JSON.parse(json);
      setName(myGori.name);
      setImgUrl(myGori.image);
      setIsLoading(false);
    })();
  }, []);



  return {
    name,
    imgUrl,
    isHoldBuddy,
    isLoading,
    deleteBuddy,
    reload
  };
};
