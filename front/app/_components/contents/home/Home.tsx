import {
  AIRDROP_CONTRACT_ADDRESS,
  GORITOKEN_CONTRACT_ADDRESS,
} from "@/app/_const/contracts";
import { GORI_OWNER } from "@/app/_const/wallets";
import { useContract } from "@/app/_hooks/useContract";
import { BuildMode, buildMode } from "@/app/_utils/buildMode";
import { BuddyGoriContext } from "@/app/context/buddyGori";
import { WalletContext } from "@/app/context/wallet";
import { Button, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useContext, useEffect, useState } from "react";
import bg from "../../../../public/images/makeButton.jpeg";
import AirDropContract from "../../../_abi/GoriDrop.json";
import TokenContract from "../../../_abi/GoriToken.json";
import Chatbot from "../../chatbot/Chatbot";
import { Profile } from "../../profile/profile";
import parentClasses from "../contents.module.css";
import styles from "./home.module.css";

export const Home = () => {
  enum Status {
    Loading,
    NameInput,
    NotHold,
    Drop,
    Initilize,
    Normal,
  }
  const [status, setStatus] = useState(Status.Loading);
  const [opened, { open, close }] = useDisclosure(false);

  const { name, isLoading, isHoldBuddy, deleteBuddy, reload } =
    useContext(BuddyGoriContext);
  const { contract: dropContract, isLoading: isLoadingDropContract } =
    useContract(AIRDROP_CONTRACT_ADDRESS, AirDropContract.abi);
  const { contract: tokenContract, isLoading: isLoadingTokenContract } =
    useContract(GORITOKEN_CONTRACT_ADDRESS, TokenContract.abi);
  const wallet = useContext(WalletContext);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const [inputName, setInputName] = useState("");

  const Delete = async () => {
    const initialData = await tokenContract!.interface.encodeFunctionData(
      "burn",
      [wallet.address, 0, 1]
    );
    await tokenContract?.txWithGelate(
      initialData,
      wallet.provider!,
      wallet.web3Auth!
    );
    deleteBuddy();
  };

  const makeBuddy = async () => {
    setStatus(Status.Drop);
    const contents = [[wallet.address, 0, 1]];
    const goriDropData = await dropContract!.interface.encodeFunctionData(
      "goridrop",
      [wallet.address, GORITOKEN_CONTRACT_ADDRESS, GORI_OWNER, contents]
    );
    await dropContract?.txWithGelate(
      goriDropData,
      wallet.provider!,
      wallet.web3Auth!
    );

    setStatus(Status.Initilize);
    const initialData = await tokenContract!.interface.encodeFunctionData(
      "initializeGori",
      [
        wallet.address,
        inputName,
        new Date().toDateString(),
        "https://ipfs.io/ipfs/bafybeiedu2fk3bb4oucoeuibtkvdku2nby4zzrxzvnzmpytfr7fbothwdy/buddy.gif",
      ]
    );
    await tokenContract?.txWithGelate(
      initialData,
      wallet.provider!,
      wallet.web3Auth!
    );
    reload();
    setStatus(Status.Normal);
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoadingDropContract && !isLoadingTokenContract) {
      if (isHoldBuddy) {
        setStatus(Status.Normal);
      } else {
        setStatus(Status.NotHold);
      }
    }
  }, [isLoadingDropContract, isLoadingTokenContract, isLoading, isHoldBuddy]);

  const detectBuddyName = () => {
    close();
    makeBuddy();
  };

  const body = () => {
    switch (status) {
      case Status.Loading:
        return <div>Now Loading...</div>;
      case Status.NotHold:
        return (
          <div className={styles.container_nobuddy}>
            <div className={styles.title}>
              Press the button below to create your own gorilla buddy!
            </div>
            <div className={styles.container}>
              <div
                className={styles.button}
                style={{
                  backgroundImage: `url(${bg.src})`,
                }}
                onClick={() => open()}
              ></div>
            </div>
          </div>
        );
      case Status.Drop:
        return (
          <div className={styles.container_nobuddy}>
            <div className={styles.title}>
              <span className={styles.blink}>Waiting for the gorilla...</span>
            </div>
          </div>
        );
      case Status.Initilize:
        return (
          <div className={styles.container_nobuddy}>
            <div className={styles.title}>
              <span className={styles.blink}>Initializing the gorilla...</span>
            </div>
          </div>
        );
      case Status.Normal:
        return (
          <>
            {/* {相棒を殺す隠し機能} */}
            {buildMode() == BuildMode.Develop && (
              <div
                className={styles.button}
                style={{
                  backgroundImage: `url(${bg.src})`,
                }}
                onClick={() => Delete()}
              ></div>
            )}

            <Profile />
            <Chatbot goriname={name as string} isViewLog={true} />
          </>
        );
    }
  };
  return (
    <div className={parentClasses.container}>
      <div className={parentClasses.window}>
        <h1 className={parentClasses.title} data-swiper-parallax="-300">
          Home
        </h1>
        {body()}
      </div>
      <Modal
        opened={opened}
        onClose={close}
        title={"Please input your buddy's name"}
        withCloseButton={false}
      >
        <div className={styles.input_container}>
          <TextInput
            className={styles.nameinput}
            value={inputName}
            onChange={(event) => setInputName(event.currentTarget.value)}
          />
          <Button
            className={styles.okbutton}
            variant="filled"
            onClick={() => detectBuddyName()}
          >
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};
