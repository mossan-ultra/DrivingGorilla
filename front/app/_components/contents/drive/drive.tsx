import parentClasses from "../contents.module.css";
import { useBuddyGori } from "../../../_hooks/useBuddyGori";
import { useStayGori } from "../../../_hooks/useStayGori";
import React, { useEffect, useState } from "react";
import GoriMap from "../../map/goriMap";
import Chatbot from "../../chatbot/Chatbot";
import { useAddress } from "@thirdweb-dev/react";

interface OkiGoriParam {
  meshCode: string;
  imageUrl: string;
  owner: string;
  period: string;
  createAt: string;
}

//https://ipfs.io/ipfs/QmTt8EsiXAjyaLBjAbVEwMi2LZ8vyoTRM8FuCPhVQqc7xM/gorilla%20eating%20Takoyaki.png  変なゴリURL

export const Drive = () => {
  const address = useAddress();
  const { name, imgUrl, isLoading } = useBuddyGori();
  const { staygoris, isLoading: isStayGoriLoading } = useStayGori();
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
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

  if (address === undefined) {
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
    return staygori.owner !== address && String(staygori.location).length === 8;
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
            myImageUrl={imgUrl}
            okigoriParams={filteredStaygoris}
            mode="GoriDrive"
            showGoriDetail={true}
          />
        ) : (
          <p>Now GoriMap Loading...</p>
        )}

        {isLoading ? (
          <div>Now Loading...</div>
        ) : !name ? (
          <div>最初に相棒ゴリラを受け取ってください</div>
        ) : (
          <Chatbot goriname={name} />
        )}
        {/*         <p>staygoris.length:{staygoris.length}</p>
        <p>filteredStaygoris.length:{filteredStaygoris.length}</p> */}
      </div>
    </div>
  );
};
