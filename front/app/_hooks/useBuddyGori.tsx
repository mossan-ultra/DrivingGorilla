import { useAddress, useSigner } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { walletConnectionAtom } from "../_recoil/atoms/web3";
import { base64Decode } from "../_utils/common";
import { getContractWithSigner } from "../_utils/contract";

const BUDDY_GORI_TOKEN_ID = 0;

export const useBuddyGori = () => {
  // 財布接続状況
  const isWalletConnected = useRecoilValue(walletConnectionAtom);
  const overrides = {
    from: useAddress(),
  };

  // Metamaskをproviderとしたcontractを利用
  const contract = getContractWithSigner(useSigner());

  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isHoldBuddy, setIsHoldBuddy] = useState(false);
  const address = useAddress();

  useEffect(() => {
    if (isWalletConnected) {
      (async () => {
        // Token0のデータを取得
        const balance = await contract.balanceOf(address, BUDDY_GORI_TOKEN_ID);
        setIsHoldBuddy(balance > 0);

        const myGori64 = await contract.uri(BUDDY_GORI_TOKEN_ID, overrides);
        const json = await base64Decode(myGori64);
        console.log(json);
        const myGori = JSON.parse(json);
        setName(myGori.name);
        setImgUrl(myGori.image);
        setIsLoading(false);
      })();
    }
  }, [isWalletConnected]);

  return {
    name,
    imgUrl,
    isHoldBuddy,
    isLoading,
  };
};
