"use client";

import { RecoilRoot } from "recoil";
import MainPageWrapper from "./mainPageWrapper";
import { AvalancheFuji } from "@thirdweb-dev/chains";
import { ACCOUNT_FACTORY_CONTRACT_ADDRESS } from "./_const/contracts";
import {
  ThirdwebProvider,
  smartWallet,
  metamaskWallet,
  embeddedWallet,
} from "@thirdweb-dev/react";
const config = {
  factoryAddress: ACCOUNT_FACTORY_CONTRACT_ADDRESS,
  gasless: true,
};
export default function Home() {
  return (
    <RecoilRoot>
      <ThirdwebProvider
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        activeChain={AvalancheFuji}
        supportedWallets={[
          smartWallet(metamaskWallet(), config),
          smartWallet(embeddedWallet(), config),
        ]}
      >
        <MainPageWrapper />
      </ThirdwebProvider>
    </RecoilRoot>
  );
}
