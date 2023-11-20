"use client";

import MainPageWrapper from "./mainPageWrapper";
import React from 'react';
import WalletProvider from "./context/wallet";
import BuddyGoriProvider from "./context/buddyGori";

export default function Home() {

  return (
    <WalletProvider>
      <BuddyGoriProvider>
        <MainPageWrapper />
      </BuddyGoriProvider>
    </WalletProvider>
  );
}
