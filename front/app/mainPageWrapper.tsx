import { useWallet } from "@/app/_hooks/useWallet";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Carousel from "./_components/carousel/Carousel";
import { Footer } from "./_components/footer/footer";
import { Header } from "./_components/header/Header";
import styles from "./mainPageWrapper.module.css";
import { Register } from "./_components/register/register";

export default function MainPageWrapper() {
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const handleSwiperChange = (newSwiper: Swiper): void => setSwiper(newSwiper);
  const { connected, setConnetWalletInfo } = useWallet();
  const address = useAddress();
  useEffect(() => {
    setConnetWalletInfo(address != undefined, address as string);
  }, [address, setConnetWalletInfo]);

  return (
    <>
      {connected ? (
        <>
          <Header />
          <main>
            <Register />
            <Carousel onSwiperChange={handleSwiperChange} />
          </main>
          <Footer swiper={swiper} />
        </>
      ) : (
        <div className={styles.body}>
          <p className={styles.welcome}>Welcome!</p>
          <p className={styles.welcome}>
            Connect your wallet and enter the world of Driving Gorilla!
          </p>

          <div className={styles.walletConnectButton}>
            <ConnectWallet />
          </div>
        </div>
      )}
    </>
  );
}
