import Image from "next/image";
import styles from "./profile.module.css";
import { BuddyGoriContext } from "@/app/context/buddyGori";
import { useContext } from "react";

export const Profile = () => {
  const { name, imgUrl, isLoading } = useContext(BuddyGoriContext);

  return (
    <div>
      {isLoading ? (
        <div>Now Loading...</div>
      ) : (
        <div className={styles.container}>
          <div className={styles.image}>
            <Image src={imgUrl as string} alt="Buddy Gori" fill objectFit="cover" />
          </div>
          <div className={styles.text}>
            <div>Name: {name}</div>
          </div>
        </div>
      )}
    </div>
  );
};
