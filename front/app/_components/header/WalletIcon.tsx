"use client";
import { useWallet } from "@/app/_hooks/useWallet";
import classes from "./header.module.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ConnectWallet } from "@thirdweb-dev/react";
export const WalletIcon = () => {
  const { connected, connectWallet } = useWallet();

  const customButton = () => (
    <div
      onClick={connectWallet} // ボタン要素の外でクリックハンドラを設定
    >
      <img
        src="icons/header.png"
        className={connected ? classes.btn : classes.btn_disconnected}
        alt=""
      />
    </div>
  );
  return (
    <>
      <ConnectWallet
        // detailsBtn プロパティにカスタムボタンを指定
        detailsBtn={customButton}
        theme="light"
        btnTitle="ゴリ"
        modalTitleIconUrl=""
      />
    </>
  );
};

/* "use client";
import { useWallet } from "@/app/_hooks/useWallet";
import classes from "./header.module.css";

export const WalletIcon = () => {
  const { connected, connectWallet } = useWallet();
  return (
    <button
      className={connected ? classes.btn : classes.btn_disconnected}
      onClick={connectWallet}
    ></button>
  );
}; */
