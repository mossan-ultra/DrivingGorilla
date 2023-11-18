import { useContext, useEffect, useRef, useState } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Carousel from "./_components/carousel/Carousel";
import { Footer } from "./_components/footer/footer";
import { Header } from "./_components/header/Header";
import styles from "./mainPageWrapper.module.css";
import { Register } from "./_components/register/register";
import Login from "./login/login";
import { WalletContext } from "./context/wallet";
import { BuddyGoriContext } from "./context/buddyGori";

export default function MainPageWrapper() {
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const [isBuddy, setBuddy] = useState(false);
  const handleSwiperChange = (newSwiper: Swiper): void => setSwiper(newSwiper);
  // const { connected, connectWallet, setConnetWalletInfo } = useWallet();
  const { connected } = useContext(WalletContext);
  const { name, imgUrl, isLoading, isHoldBuddy, deleteBuddy } = useContext(BuddyGoriContext);

  return (
    <>
      {connected ? (
        <>
          <Header />
          <main>
            <div >
              <Register />
              <Carousel onSwiperChange={handleSwiperChange} />
            </div>
          </main>
          {isHoldBuddy ? <Footer swiper={swiper} /> : <></>}
        </>
      ) : (
        <div className={styles.body}>
          <p className={styles.welcome}>Welcome!</p>
          <p className={styles.welcome}>
            Connect your wallet and enter the world of Driving Gorilla!
          </p>

          <div className={styles.walletConnectButton}>
            <Login />
          </div>
        </div>
      )}
    </>
  );
}
