import {
  walletAddressAtom,
  walletConnectionAtom,
} from "@/app/_recoil/atoms/web3";
import { useCallback } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

export const useWallet = () => {
  // 財布の接続とアドレスを管理するState
  const [connected, setConnected] = useRecoilState(walletConnectionAtom);
  const setWalletAddress = useSetRecoilState(walletAddressAtom);

  // onClickで利用するので、関数化して返却する
  const connectWallet = useCallback(async () => {
    if (!connected) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        setConnected(true);
        console.log("Connected accounts:", accounts);
      } catch (error) {
        console.error("Error connecting to wallet", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  }, [connected, setConnected, setWalletAddress]);

  const setConnetWalletInfo = (isConnect: boolean, address: string) => {
    setConnected(isConnect);
    setWalletAddress(address);
  };

  return { connected, connectWallet, setConnetWalletInfo };
};
