import parentClasses from "../contents.module.css";
import { useStayGori } from "../../../_hooks/useStayGori";
import React, { useContext, useEffect, useState } from "react";
import GoriMap from "../../map/goriMap";
import Chatbot from "../../chatbot/Chatbot";
import { WalletContext } from "@/app/context/wallet";
import CheckInButton from "../../checkInButton";
import { BuildMode, buildMode } from "@/app/_utils/buildMode";
import { BuddyGoriContext } from "@/app/context/buddyGori";


interface OkiGoriParam {
  meshCode: string;
  imageUrl: string;
  owner: string;
  period: string;
  createAt: string;
}

//https://ipfs.io/ipfs/QmTt8EsiXAjyaLBjAbVEwMi2LZ8vyoTRM8FuCPhVQqc7xM/gorilla%20eating%20Takoyaki.png  変なゴリURL

export const Drive = () => {
  const { name, imgUrl, isLoading, isHoldBuddy, deleteBuddy, reload } = useContext(BuddyGoriContext);
  const { staygoris, isLoading: isStayGoriLoading } = useStayGori();
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const wallet = useContext(WalletContext);
  useEffect(() => {
    // ブラウザが位置情報をサポートしているかを確認
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLat(position.coords.latitude);
          setCurrentLng(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not available in this browser.");
    }
  }, []);

  if (wallet.address === undefined) {
    return (
      <div className={parentClasses.container}>
        <div className={parentClasses.window}>
          <p>Address is undefined. Please connect your wallet.</p>
        </div>
      </div>
    );
  }
  //console.log("koko");
  const filteredStaygoris = staygoris.filter((staygori) => {
    //console.log(
    //   "String(staygori.location).length",
    //   String(staygori.location).length
    //);
    //console.log("staygori.location:", staygori.location);
    return staygori.owner !== wallet.address && String(staygori.location).length === 8;
  });

  return (
    <div className={parentClasses.container}>
      <div className={parentClasses.window}>
        <h1 className={parentClasses.title} data-swiper-parallax="-300">
          Drive

        </h1>
        {!isLoading && currentLat && currentLng && !isStayGoriLoading ? (
          <GoriMap
            currentLat={currentLat}
            currentLng={currentLng}
            myImageUrl={imgUrl as string}
            okigoriParams={filteredStaygoris}
            mode="GoriDrive"
            showGoriDetail={true} myGoriName={name!} />
        ) : (
          <p>Now GoriMap Loading...</p>
        )}

        {isLoading ? (
          <div>Now Loading...</div>
        ) : !name ? (
          <div>最初に相棒ゴリラを受け取ってください</div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: "space-evenly", alignItems: "center" }}>
              <Chatbot goriname={name} isViewLog={false} />
              <CheckInButton meshCode={51324338} />
            </div>

            {buildMode() === BuildMode.Develop && (
              <>
                <h1>↓developのみ</h1>
                <div>
                  53393599(東京タワー)
                  <CheckInButton meshCode={53393599} />
                  53394611(東京駅)
                  <CheckInButton meshCode={53394611} />
                  52350349(大阪駅)
                  <CheckInButton meshCode={52350349} />
                  52350623(奈良)
                  <CheckInButton meshCode={52350623} />
                  63406310(長万部)
                  <CheckInButton meshCode={63406310} />
                  51324338(マツダ本社)
                  <CheckInButton meshCode={51324338} />
                  1(未登録)
                  <CheckInButton meshCode={1} />
                </div>
              </>
            )}
          </>
        )}
        {/*         <p>staygoris.length:{staygoris.length}</p>
        <p>filteredStaygoris.length:{filteredStaygoris.length}</p> */}
      </div>
    </div>
  );
};
