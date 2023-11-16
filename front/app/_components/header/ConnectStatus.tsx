import { WalletContext } from "@/app/context/wallet";
import classes from "./header.module.css";
import { useContext } from "react";

export const ConnectStatus = () => {
  const wallet = useContext(WalletContext);

  return (
    <div className={classes.status}>
      {wallet.connected
        ? "🟢 Connected"
        : "🔴 Click left icon to connect your wallet."}
    </div>
  );
};
