import { useCallback, useContext, useState } from "react";
import { base64Decode } from "../_utils/common";
import { getContract } from "../_utils/contract";
import { WalletContext } from "../context/wallet";
import { BuddyGoriContext } from "../context/buddyGori";
const BUDDY_GORI_TOKEN_ID = 0;

export const useBuddyGori = (): BuddyGoriContext => {
  // 財布接続状況
  const wallet = useContext(WalletContext);
  const contract = getContract();

  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isHoldBuddy, setIsHoldBuddy] = useState(false);

  const deleteBuddy = useCallback(() => {
    setIsHoldBuddy(false)
  }, []);


  const reload = useCallback(() => {
    if (!wallet.connected) {
      return;
    }
    (async () => {
      console.log(wallet)
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
  }, [wallet.connected]);



  return {
    name,
    imgUrl,
    isHoldBuddy,
    isLoading,
    deleteBuddy,
    reload
  };
};
