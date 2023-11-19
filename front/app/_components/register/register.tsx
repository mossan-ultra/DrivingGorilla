import { DRIVE_CONTRACT_ADDRESS } from "@/app/_const/contracts";
import { getContract } from "@/app/_utils/contract";
import { Modal, Table, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { useContext, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { BuildMode, buildMode } from "@/app/_utils/buildMode";
import bg from "../../../public/images/register.jpeg";
import styles from "./register.module.css";
import { useContract } from "@/app/_hooks/useContract";
import DriveContractAbi from "../../_abi/Drive.json";
import { WalletContext } from "@/app/context/wallet";
import { BuddyGoriContext } from "@/app/context/buddyGori";

export const Register = () => {
    enum Status {
        IDLE, TrasactionCall, Check, Finish
    }
    type TokenAmount = {
        id: string;
        name: string;
        amount: string;
    }

    const [opened, { open, close }] = useDisclosure(false);
    const [status, setStatus] = useState(Status.IDLE);
    const { contract: driveContract, isLoading: isContractLoading } = useContract(DRIVE_CONTRACT_ADDRESS, DriveContractAbi.abi);
    const [blockNumber, setBlockNumber] = useState();
    const [mintAmount, setMintAmount] = useState<TokenAmount[]>([]);
    const refFirstRef = useRef(true);
    const wallet = useContext(WalletContext);


    const { isLoading, isHoldBuddy } = useContext(BuddyGoriContext);

    const driveDemoData = [
        61,   //ecolevel
        72,   //safelevel
        1,      //refuelingCount
        343,   //distance
        376,   //time
        []
    ];
    const tableData = [
        { name: 'Eco Drive Score', amount: driveDemoData[0] },
        { name: 'Safe Drive Score', amount: driveDemoData[1] },
        { name: 'Refueling Score', amount: driveDemoData[2] },
        { name: 'Drive Distance', amount: driveDemoData[3] },
        { name: 'Driving Time', amount: driveDemoData[4] },
    ]
    const rows = tableData.map((element) => (
        <Table.Tr key={element.name}>
            <Table.Td>{element.name}</Table.Td>
            <Table.Td>{element.amount}</Table.Td>
        </Table.Tr>
    ));
    const mintTokenRows = (data: TokenAmount[]) => data.map((element) => (
        <Table.Tr key={element.id}>
            <Table.Td>{element.name}</Table.Td>
            <Table.Td>{Number(ethers.utils.formatEther(element.amount))}</Table.Td>
        </Table.Tr>
    ));

    useEffect(() => {
        if (!isContractLoading && !isLoading && isHoldBuddy) {
            open();

        }
    }, [isContractLoading, isLoading])



    useEffect(() => {

        if (buildMode() === BuildMode.Develop) {
            if (refFirstRef.current) {
                refFirstRef.current = false;
                return;
            }
        }

        const contract = getContract();
        const filter = contract.filters.TransferSingle(null, null, wallet.address, null, null)
        contract.on(filter, (operator, from, to, id, amount) => {

            if (to === wallet.address) {
                let name = "";
                switch (Number(id)) {
                    case 1:
                        name = "STR"
                        break;
                    case 2:
                        name = "DEF"
                        break;
                    case 3:
                        name = "LUK"
                        break;
                    case 4:
                        name = "AGI"
                        break;
                    case 5:
                    default:
                        name = "VIT"
                        break;
                }

                const tokenAmount: TokenAmount = {
                    id: id.toString(),
                    name: name, amount: amount.toString()
                }
                mintAmount.push(tokenAmount);
                setMintAmount([...mintAmount])
            }
        })

    }, [])

    const registerDrivingData = async () => {
        setStatus(Status.TrasactionCall)

        const data =
            await driveContract!.interface.encodeFunctionData("drivedata",
                [
                    wallet.address,
                    61,   //ecolevel
                    72,   //safelevel
                    1,      //refuelingCount
                    343,   //distance
                    376,   //time
                    []]
            );
        await driveContract?.txWithGelate(data, wallet.provider!, wallet.web3Auth!)

        // setBlockNumber(res.receipt.blockNumber)
        // receiptの中身でもできそうな気がしたがDecordうまくいかなった
        // const events = res.receipt.events;
        // const abiCoder = ethers.utils.defaultAbiCoder;
        // events.forEach((event: any) => {
        //     if (event.address === '0xc1702E1CeeBbB6D07bcEE6FC57bf7488B8275Ec1') {
        //         const decordData = abiCoder.decode(["address", "address", "address", "uint256", "uint256"], event.data.toString())
        //     }
        // })
        setStatus(Status.Check)

        const timer = setTimeout(() => {
            setStatus(Status.Finish)
        }, 2000);   // 一応ブロック時間くらい待つ
    }

    const body = () => {
        switch (status) {
            case Status.IDLE:
                return (
                    <>
                        <Title order={3}>{'Register yesterdays driving data. Click the gorilla button to proceed.'}</Title>
                        <div className={styles.container}>
                            <div
                                className={styles.button}
                                style={{
                                    backgroundImage: `url(${bg.src})`,
                                }}
                                onClick={() => registerDrivingData()}></div >

                        </div>

                        <Table>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    </>
                )
            case Status.TrasactionCall:
                return (
                    <>
                        <Title order={3}>{'Executing transaction to register driving data…'}</Title>
                    </>
                )
            case Status.Check:
                return (
                    <>
                        <Title order={3}>{'Checking issued token…'}</Title>
                    </>
                )
            case Status.Finish:
            default:
                return (
                    <>
                        <Title order={3}>{'The following tokens were minted!!'}</Title>
                        <Table>
                            <Table.Tbody>{mintTokenRows(mintAmount.filter(element => Number(element.id) <= 5).sort((a, b) => Number(a.id) - Number(b.id)))}</Table.Tbody>
                        </Table>
                    </>
                )
        }
    }

    return (<>
        <Modal
            opened={opened}
            onClose={close}
            title={"Driving data registration"}
            style={{ height: "1000px" }}
        >
            <div>
                {body()}
            </div>
        </Modal>

    </>)

}