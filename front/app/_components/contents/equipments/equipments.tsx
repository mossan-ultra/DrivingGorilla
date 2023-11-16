import { Equipment, useEquipments } from "../../../_hooks/useEquipments";
import parentClasses from "../contents.module.css";
import classes from "./equipments.module.css";
import { useContext, useState } from "react";
import { HoloEffectCard } from "../holoEffectCard";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { WalletContext } from "@/app/context/wallet";

export const Equipments = () => {
  const wallet = useContext(WalletContext);
  const { equipments, isLoading } = useEquipments(wallet.address as string);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectEquipment, setSelectEquipment] = useState<Equipment>();
  function modalOpen(eqipment: Equipment) {
    setSelectEquipment(eqipment);
    open();
  }

  const equipmentsComponent = equipments.map((equipment, i) => {
    return (
      <>
        <div className={classes.li_item_container}>
          <li
            key={`img${i}`}
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
              <text>{equipment.name}</text>
              <text>{equipment.category}</text>
              <text>
                STR:{equipment.driving},DEF:{equipment.safe}, LUK:
                {equipment.eco}, AGI:{equipment.distance}, VIT:
                {equipment.refuling}
              </text>
            </div>
          </li>
        </div>
      </>
    );
  });

  return (
    <div className={parentClasses.container}>
      <div className={parentClasses.window}>
        <h1 className={parentClasses.title} data-swiper-parallax="-300">
          Equipments
        </h1>
        <div className={classes.list_container} data-swiper-parallax="-200">
          {wallet.connected ? (
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