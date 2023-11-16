import { ContractInterface } from "ethers";
import { useContext, useEffect, useState } from "react";
import { GelatoContract } from "../gelato/gelatoContract";
import { WalletContext } from "../context/wallet";

export const useContract = (contractAdress: string, abi: ContractInterface) => {
    // 財布接続状況
    const wallet = useContext(WalletContext);
    const [isLoading, setIsLoading] = useState(true);
    const [contract, setContract] = useState<GelatoContract>();


    useEffect(() => {
        (async () => {
            const signer = await wallet.provider?.getSigner();
            const _contract = new GelatoContract(contractAdress, abi, signer);
            setContract(_contract);
            setIsLoading(false);
        })()

    }, [])

    return {
        isLoading, contract
    };
};
