"use client";

import MainPageWrapper from "./mainPageWrapper";
import React from 'react';
import WalletProvider from "./context/wallet";

export default function Home() {

  return (
    <WalletProvider>
      <MainPageWrapper />
    </WalletProvider>
  );
}
