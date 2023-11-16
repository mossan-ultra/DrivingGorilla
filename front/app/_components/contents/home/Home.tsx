import { Profile } from "../../profile/profile";
import parentClasses from "../contents.module.css";
import { useBuddyGori } from "@/app/_hooks/useBuddyGori";
import Chatbot from '../../chatbot/Chatbot'
import { useEffect, useState } from "react";
import { useAddress, useContract } from "@thirdweb-dev/react";
import bg from "../../../../public/images/makeButton.jpeg";
import styles from "./home.module.css";
import { Button, Modal, TextInput, Title } from "@mantine/core";
import { AIRDROP_CONTRACT_ADDRESS, GORITOKEN_CONTRACT_ADDRESS } from "@/app/_const/contracts";
import { GORI_OWNER } from "@/app/_const/wallets";
import { useDisclosure } from "@mantine/hooks";

export const Home = () => {
  enum Status {
    Loading, NameInput, NotHold, Drop, Initilize, Normal
  }
  const [status, setStatus] = useState(Status.Loading);
  const [opened, { open, close }] = useDisclosure(false);

  const { name, imgUrl, isLoading, isHoldBuddy } = useBuddyGori();
  const { contract: dropContract, isLoading: isLoadingDropContract } = useContract(AIRDROP_CONTRACT_ADDRESS);
  const { contract: tokenContract, isLoading: isLoadingTokenContract } = useContract(GORITOKEN_CONTRACT_ADDRESS);
  const address = useAddress();
  const [inputName, setInputName] = useState('');

  const makeBuddy = async () => {
    setStatus(Status.Drop)
    const contents = [[
      address, 0, 1
    ]];

    const dropReceipt = await dropContract!.call(
      "goridrop",
      [
        GORITOKEN_CONTRACT_ADDRESS, GORI_OWNER, contents
      ]
    );
    setStatus(Status.Initilize)

    const initReceipt = await tokenContract!.call(
      "initializeGori",
      [
        inputName, (new Date()).toDateString(), "https://ipfs.io/ipfs/bafybeiedu2fk3bb4oucoeuibtkvdku2nby4zzrxzvnzmpytfr7fbothwdy/buddy.gif"
      ],
    );
    setStatus(Status.Normal)
  }

  useEffect(() => {
    if (!isLoading && !isLoadingDropContract && !isLoadingTokenContract) {
      if (isHoldBuddy) {
        setStatus(Status.Normal);
      } else {
        setStatus(Status.NotHold)
      }
    }

  }, [isLoadingDropContract, isLoadingTokenContract, isLoading, isHoldBuddy])

  const detectBuddyName = () => {
    close();
    makeBuddy();
  }

  const body = () => {
    switch (status) {
      case Status.Loading:
        return (
          <div>Now Loading...</div>
        )
      case Status.NotHold:
        return (
          <div>
            <Title order={3}>{'Press the button below to create your own gorilla buddy!'}</Title>
            <div className={styles.container}>
              <div
                className={styles.button}
                style={{
                  backgroundImage: `url(${bg.src})`,
                }}
                onClick={() => open()}
              ></div >
            </div>
          </div>
        )
      case Status.Drop:
        return (
          <div>取得中...</div>
        )
      case Status.Initilize:
        return (
          <div>初期化中...</div>
        )
      case Status.Normal:
        return (
          <>
            <Profile /><Chatbot goriname={name} /></>
        )
    }
  }
  return (
    <div className={parentClasses.container}>
      <div className={parentClasses.window}>
        <h1 className={parentClasses.title} data-swiper-parallax="-300">
          Home
        </h1>
        {
          body()
        }
      </div>
      <Modal
        opened={opened}
        onClose={close}
        title={"Please input buddy name"}
        withCloseButton={false}
      >
        <div>
          <TextInput value={inputName} onChange={(event) => setInputName(event.currentTarget.value)} />
          <Button variant="filled" onClick={() => detectBuddyName()}>OK</Button>

        </div>
      </Modal>

    </div>
  );


};
