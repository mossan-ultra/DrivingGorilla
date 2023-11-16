"use client";
import { WalletContext } from "@/app/context/wallet";
import classes from "./header.module.css";
import { useContext, useState } from "react";
import WalletDialog from "./walletDialog";
import { Tube } from "@react-three/drei";
export const WalletIcon = () => {
  const wallet = useContext(WalletContext);
  const [dialogShow, setDialogShow] = useState(false);

  const customButton = () => (
    <div
    // onClick={connectWallet} // ボタン要素の外でクリックハンドラを設定
    >
      <img
        src="icons/header.png"
        className={wallet.connected ? classes.btn : classes.btn_disconnected}
        alt=""
        onClick={() => setDialogShow(true)}
      />
    </div>
  );
  return (
    <>
      {customButton()}
      <WalletDialog show={dialogShow} onClose={() => {
        setDialogShow(false)
      }}
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
