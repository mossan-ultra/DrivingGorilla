import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import React from "react";
import { createContext } from "react";
import { useWallet } from "../_hooks/useWallet";

export type WalletContext = {
    provider: ethers.providers.Web3Provider | undefined;
    web3Auth: Web3Auth | undefined;
    connected: boolean;
    address: string | undefined;
    connectWallet: (provider: ethers.providers.Web3Provider, web3auth: Web3Auth, address: string) => void;
    disConnectWallet: (provider: ethers.providers.Web3Provider, web3auth: Web3Auth, address: string) => void;
};
const defaultContext: WalletContext = {
    provider: undefined,
    web3Auth: undefined,
    connected: false,
    address: undefined,
    connectWallet: (provider: ethers.providers.Web3Provider, web3auth: Web3Auth, address: string) => {
        provider; web3auth; address;
    },
    disConnectWallet: (provider: ethers.providers.Web3Provider, web3auth: Web3Auth, address: string) => {
        provider; web3auth; address;
    },
};

export const WalletContext = createContext<WalletContext>(defaultContext);

export default function WalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const wallet = useWallet()
    return (
        <WalletContext.Provider value={wallet}>
            {children}
        </WalletContext.Provider>
    );
}
