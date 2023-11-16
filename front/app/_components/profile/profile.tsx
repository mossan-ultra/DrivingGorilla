import { useBuddyGori } from "@/app/_hooks/useBuddyGori";
import Image from "next/image";
import styles from "./profile.module.css";

export const Profile = () => {
  const { name, imgUrl, isLoading } = useBuddyGori();

  return (
    <div>
      {isLoading ? (
        <div>Now Loading...</div>
      ) : (
        <div className={styles.container}>
          <div className={styles.image}>
            <Image src={imgUrl} alt="Buddy Gori" fill objectFit="cover" />
          </div>
          <div className={styles.text}>
            <div>Name: {name}</div>
          </div>
        </div>
      )}
    </div>
  );
};
