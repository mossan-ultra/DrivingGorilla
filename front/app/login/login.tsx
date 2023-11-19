import { Button } from "@mantine/core";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { ethers, providers } from "ethers";
import { useContext, useState } from "react";
import AccountAbstraction, {
  AccountAbstractionConfig,
} from "zkatana-gelato-account-abstraction-kit";
import { GelatoRelayPack } from "zkatana-gelato-relay-kit";
import { WalletContext } from "../context/wallet";

interface Props {
  onConnected?: (address: string, provider: providers.Web3Provider) => void;
}
export default function Login(props: Props) {
  const [status, setStatus] = useState("Sign in");
  const GELATO_RELAY_API_KEY = process.env
    .NEXT_PUBLIC_GELATO_RELAY_API_KEY as string;
  const WEB3AUTH_CLIENT_ID = process.env
    .NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string;
  const wallet = useContext(WalletContext);

  // const { connected, connectWallet, setConnetWalletInfo } = useWallet();
  const onConnect = async () => {
    setStatus("Connecting...");
    const web3auth = new Web3Auth({
      clientId: WEB3AUTH_CLIENT_ID, // get it from Web3Auth Dashboard
      web3AuthNetwork: "sapphire_devnet",
      chainConfig: {
        chainNamespace: "eip155",
        chainId: "0x133e40", // hex of 1261120
        rpcTarget: "https://rpc.zkatana.gelato.digital",
        // Avoid using public rpcTarget in production.
        // Use services like Infura, Quicknode etc
        displayName: "zKatana Testnet",
        blockExplorer: "https://zkatana.blockscout.com",
        ticker: "ETH",
        tickerName: "ETH",
      },
    });
    await web3auth!.initModal({
      modalConfig: {
        // Disable Wallet Connect V2
        [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
          label: "wallet_connect",
          showOnModal: false,
        },
        // Disable Metamask
        [WALLET_ADAPTERS.METAMASK]: {
          label: "metamask",
          showOnModal: false,
        },
        // Disable Metamask
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: "torus",
          showOnModal: false,
        },
      },
    });

    const web3authProvider = await web3auth!.connect();
    const provider = new ethers.providers.Web3Provider(web3authProvider!);

    const signer = await provider?.getSigner();
    const signerAddress = (await signer?.getAddress()) as string;
    const relayPack = new GelatoRelayPack(GELATO_RELAY_API_KEY);
    const safeAccountAbstraction = new AccountAbstraction(signer!);
    const sdkConfig: AccountAbstractionConfig = {
      relayPack,
    };
    await safeAccountAbstraction.init(sdkConfig);

    const safeAddress = await safeAccountAbstraction.getSafeAddress();
    const isDeployed = await safeAccountAbstraction.isSafeDeployed();

    const user = await web3auth!.getUserInfo();
    wallet.connectWallet(provider, web3auth, signerAddress);
    setStatus("Connected!");
  };
  return (
    <>
      <Button onClick={onConnect} disabled={status !== "Sign in"}>
        <span style={{ position: "relative", top: "0px" }}>{status}</span>
      </Button>
    </>
  );
}
