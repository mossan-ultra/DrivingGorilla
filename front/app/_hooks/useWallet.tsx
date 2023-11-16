import { providers } from "ethers";
import { useCallback, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { WalletContext } from "../context/wallet";


export const useWallet = (): WalletContext => {
    const [web3Auth, setWeb3Auth] = useState<Web3Auth>();
    const [provider, setProvider] = useState<providers.Web3Provider>();
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState<string | undefined>();


    // onClickで利用するので、関数化して返却する
    const connectWallet = useCallback((provider: providers.Web3Provider, web3Auth: Web3Auth, address: string) => {
        setProvider(provider);
        setWeb3Auth(web3Auth);
        setConnected(true);
        setAddress(address)
    }, [provider, web3Auth]);

    const disConnectWallet = useCallback((provider: providers.Web3Provider, web3Auth: Web3Auth, address: string) => {
        web3Auth.logout({ cleanup: true });
        setWeb3Auth(web3Auth);
        setConnected(false);
        setAddress(undefined);
    }, [provider, web3Auth]);


    return { provider, web3Auth, connected, address, connectWallet, disConnectWallet };
};
