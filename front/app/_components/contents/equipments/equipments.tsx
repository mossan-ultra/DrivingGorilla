import { WalletContext } from "../../../context/wallet";
import { Equipment, useEquipments } from "../../../_hooks/useEquipments";
import parentClasses from "../contents.module.css";
import classes from "./equipments.module.css";
import { useContext, useState } from "react";
import { HoloEffectCard } from "../holoEffectCard";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useContract } from "@/app/_hooks/useContract";
import TokenContractAbi from "../../../_abi/GoriToken.json";
import { BiSolidTrash } from "react-icons/bi";
import { GORITOKEN_CONTRACT_ADDRESS } from "@/app/_const/contracts";

export const Equipments = () => {
  const wallet = useContext(WalletContext);
  const { equipments, isLoading } = useEquipments(wallet.address as string);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectEquipment, setSelectEquipment] = useState<Equipment>();
  const { contract: tokenContract, isLoading: isContractLoading } = useContract(GORITOKEN_CONTRACT_ADDRESS, TokenContractAbi.abi);
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

  async function burn(eqipment: Equipment) {
    setIsDeleteProcessing(true);

    const burnTx =
      await tokenContract!.interface.encodeFunctionData("burn",
        [
          wallet.address,
          eqipment.tokenId,
          1,
        ]
      );
    await tokenContract?.txWithGelate(burnTx, wallet.provider!, wallet.web3Auth!);

    setIsDeleteProcessing(false);
    close();

  }
  function modalOpen(eqipment: Equipment) {
    setSelectEquipment(eqipment);
    open();
  }

  const equipmentsComponent = equipments.map((equipment, i) => (
    <div key={equipment.name + i} className={classes.li_item_container}>
      <li
        key={equipment.name}
        className={classes.li}
        onClick={() =>
          modalOpen({
            name: equipment.name,
            category: equipment.category,
            description: equipment.description,
            image: equipment.image,
            driving: 0,
            eco: 0,
            distance: 0,
            safe: 0,
            refuling: 0,
            tokenId: equipment.tokenId
          })
        }
      >
        <div style={{ position: "relative", width: 100, height: 100 }}>
          <HoloEffectCard
            image={equipment.image}
            position={[i, i, 0]}
            className={classes.canvas}
            enableOrbitContorls={false}
          ></HoloEffectCard>
        </div>

        <div className={classes.equipment_detail_container}>
          <p>{equipment.name}</p>
          <p>{equipment.category}</p>
          <p>
            STR:{equipment.driving},DEF:{equipment.safe}, LUK:
            {equipment.eco}, AGI:{equipment.distance}, VIT:
            {equipment.refuling}
          </p>
        </div>
      </li>
    </div>
  ));

  return (
    <div className={parentClasses.container}>
      <div className={parentClasses.window}>
        <h1 className={parentClasses.title} data-swiper-parallax="-300">
          Equipments
        </h1>
        <div className={classes.list_container} data-swiper-parallax="-200">
          {wallet ? (
            isLoading ? (
              <div>Now loading...</div>
            ) : (
              <>
                <div>{equipmentsComponent}</div>

                <Modal
                  opened={opened}
                  onClose={close}
                  title={selectEquipment?.name}
                  style={{ height: "500px" }}
                >
                  <HoloEffectCard
                    image={selectEquipment?.image}
                    position={[0, 0, 0]}
                    className={classes.canvas}
                    enableOrbitContorls={true}
                  ></HoloEffectCard>
                  {selectEquipment?.description}
                  <Button justify="center" fullWidth leftSection={<BiSolidTrash size={14} />} variant="default" onClick={() => burn(selectEquipment!)} loading={isDeleteProcessing}>
                    delete
                  </Button>
                </Modal>
              </>
            )
          ) : (
            <div>Not connected</div>
          )}
        </div>
      </div>
    </div>
  );
};