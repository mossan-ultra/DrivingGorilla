"use client";
import { WalletContext } from "@/app/context/wallet";
import { useContext, useEffect } from "react";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CopyButton, Button } from '@mantine/core';
import styles from "./walletDialog.module.css";
import { BiCopy } from "react-icons/bi";

interface Props {
    show: boolean;
    onClose: () => void;
}
export default function WalletDialog(props: Props) {
    const wallet = useContext(WalletContext);
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        if (props.show) {
            open();
        } else {
            close();
        }


    }, [props.show])

    const onClose = () => {
        close()
        props.onClose();
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={"Info"}
                style={{ height: "1000px" }}
            >
                <Button onClick={() => { wallet.disConnectWallet(wallet.provider!, wallet.web3Auth!, wallet.address!) }}>
                    Disconnect
                </Button>

                <div className={styles.overflow}>
                    <div className={styles.walletaddress}>
                        Your Address:
                        <p>
                            {wallet.address}
                        </p>
                        <CopyButton value={wallet.address as string}>
                            {({ copied, copy }) => (
                                <BiCopy color={copied ? 'teal' : 'blue'} onClick={copy} fontSize={"20px"}>
                                    {copied ? 'Copied' : 'Copy'}
                                </BiCopy>
                            )}
                        </CopyButton>

                    </div>
                </div>

            </Modal >

        </>
    );
};

/* "use client";
import { useWallet } from "@/app/_hooks/useWallet";
import classes from "./header.module.css";

export const WalletIcon = () => {
  const { connected, connectWallet } = useWallet();
  return (
    <button
      className={connected ? classes.btn : classes.btn_disconnected}
      onClick={connectWallet}
    ></button>
  );
}; */
