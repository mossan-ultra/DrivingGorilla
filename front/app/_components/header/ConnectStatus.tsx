import { walletConnectionAtom } from "@/app/_recoil/atoms/web3";
import { useRecoilValue } from "recoil";
import classes from "./header.module.css";

export const ConnectStatus = () => {
  const isWalletConnected = useRecoilValue(walletConnectionAtom);

  return (
    <div className={classes.status}>
      {isWalletConnected
        ? "🟢 Connected"
        : "🔴 Click left icon to connect your wallet."}
    </div>
  );
};
