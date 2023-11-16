"use client";

import { ConnectStatus } from "./ConnectStatus";
import { WalletIcon } from "./WalletIcon";
import classes from "./header.module.css";

export const Header = () => {
  return (
    <header className={classes.header}>
      <WalletIcon />
      <div className={classes.title_container}>
        <div className={classes.title}>Driving Gorilla</div>
        <ConnectStatus />
      </div>
    </header>
  );
};
