import styles from "./checkInButton.module.css";
import bg from "../../public/images/checkin.jpeg";
import { useContract } from "../_hooks/useContract";
import { DRIVE_CONTRACT_ADDRESS, GORITOKEN_CONTRACT_ADDRESS } from "../_const/contracts";
import DriveContractAbi from "../../app/_abi/Drive.json";
import TokenContractAbi from "../../app/_abi/GoriToken.json";
import { useContext, useState } from "react";
import { WalletContext } from "../context/wallet";
import { getContract } from "../_utils/contract";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { stringify } from "querystring";
import { HoloEffectCard } from "./contents/holoEffectCard";
import { base64Decode } from "../_utils/common";
import { Equipment } from "../_hooks/useEquipments";
import { ethers } from "ethers";
import { GelatoDetail } from "../gelato/gelatoContract";

interface Props {
    meshCode: number
}
const equipmentReviver = (k: string, v: string) => {
    const numberElements = ["driving", "eco", "distance", "safe", "refuling"];
    if (numberElements.includes(k)) {
        return Number(v);
    }
    return v;
};

export default function CheckInButton(props: Props) {
    type EquimpmentMintInfo = {
        isMint: boolean;
        info?: any;
    }

    const { contract: driveContract, isLoading: isContractLoading } = useContract(DRIVE_CONTRACT_ADDRESS, DriveContractAbi.abi);
    const tokenContract = getContract();
    const wallet = useContext(WalletContext);
    const [checkinProcessing, setCheckinProcessing] = useState(false);
    const [processingModalOpend, { open: processingModalOpen, close: processingModalClose }] = useDisclosure(false);
    const [equipmentModalOpend, { open: equipmentModalOpen, close: equipmentModalClose }] = useDisclosure(false);
    const [equipment, setEquipment] = useState<Equipment | undefined>(undefined);


    const checkEquipmentMinted = async (blockNumber: number) => {
        const filter = tokenContract!.filters.EquipmentMinted(wallet.address, null)
        const event = (await tokenContract!.queryFilter(filter)).pop(); // Gets the latest event matching the filter
        let rtn: EquimpmentMintInfo;
        if (event?.blockNumber === blockNumber) {
            console.log(event)


            const [owner, tokenId] = event.args as ethers.utils.Result;
            console.log(`tokenId2=${tokenId}`)

            const equipment64 = await tokenContract.myuri(wallet.address, tokenId.toString());
            const json = await base64Decode(equipment64);
            let e: Equipment = JSON.parse(json, equipmentReviver);
            e.driving = Number(ethers.utils.formatEther(e.driving.toString()));
            e.eco = Number(ethers.utils.formatEther(e.eco.toString()));
            e.distance = Number(ethers.utils.formatEther(e.distance.toString()));
            e.refuling = Number(ethers.utils.formatEther(e.refuling.toString()));
            e.safe = Number(ethers.utils.formatEther(e.safe.toString()));

            setEquipment(e)

        }
    }

    const checkin = async (meshCode: number) => {
        processingModalOpen();

        const data =
            await driveContract!.interface.encodeFunctionData("checkin",
                [
                    wallet.address,
                    meshCode.toString()
                ]
            );
        const detaile = await driveContract?.txWithGelate(data, wallet.provider!, wallet.web3Auth!) as GelatoDetail;
        processingModalClose();
        const mintInfo = await checkEquipmentMinted(Number(detaile.blockNumber));

        equipmentModalOpen();
        console.log(mintInfo)
    }
    return (<>
        <div className={styles.container}>
            <div
                className={styles.button}
                style={{
                    backgroundImage: `url(${bg.src})`,
                }}
                onClick={() => checkin(props.meshCode)}
            >

            </div >

            <Modal
                opened={processingModalOpend}
                onClose={processingModalClose}
                title={"Please wait"}
                style={{ height: "500px" }}
            >
                Processing check-in
            </Modal>


            {equipment &&

                <Modal
                    opened={equipmentModalOpend}
                    onClose={equipmentModalClose}
                    title={equipment?.name}
                    style={{ height: "500px" }}
                >
                    <HoloEffectCard
                        image={equipment?.image}
                        position={[0, 0, 0]}
                        className={styles.canvas}
                        enableOrbitContorls={true}
                        style={{ height: '400px' }}
                        autorotate={true}
                    ></HoloEffectCard>
                    {equipment?.description}
                </Modal>
            }
        </div>
    </>)

}