import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Map } from "./map";
import { Marker } from "./marker";
import { useRef, useState, useEffect, useContext } from "react";
import React from "react";
import { Button, Modal, TextInput, Title } from "@mantine/core";
import { ethers } from "ethers";
import { getContractWithSigner } from "../../_utils/contract";
import isEqual from "lodash/isEqual";
import { ChartOkigori } from "../contents/collection/chartOkigori";
import { StayGori } from "../../_hooks/useStayGori";
import TokenAbi from "../../_abi/GoriToken.json";
import { GORITOKEN_CONTRACT_ADDRESS } from "@/app/_const/contracts";
import { useContract } from "@/app/_hooks/useContract";
import { WalletContext } from "@/app/context/wallet";

interface Props {
  currentLat: number;
  currentLng: number;
  myImageUrl: string;
  okigoriParams: StayGori[]; // 置きゴリのリストを受け取る
  mode: string;
  showGoriDetail: boolean;
}

export default function GoriMap(props: Props) {
  const [selectedMarker, setSelectedMarker] = useState<StayGori | null>(null);
  const [StayStatusArray, setStayStatusArray] = useState<number[]>([
    0, 0, 0, 0, 0,
  ]);
  const [isModalOpen, setModalOpen] = useState(false);
  const wallet = useContext(WalletContext);
  const handleMarkerClick = (param: StayGori) => {
    setSelectedMarker(param);
    setModalOpen(true);
  };
  const handleMyGoriClick = () => {
    //console.log("mygoriがクリックされました");
    setSelectedMarker(null); // 選択中のマーカーを解除
  };
  const ref = useRef<HTMLDivElement>(null);
  const render = (status: Status) => {
    return <div>{status}</div>;
  };
  function closeModal(){
    setModalOpen(false)
  }

  const AsyncGoriColleInfo = ({ tokenId }: { tokenId: number }) => {
    const { contract: tokenContract, isLoading: isContractLoading } = useContract(GORITOKEN_CONTRACT_ADDRESS, TokenAbi.abi);

    return (
      <>
        {StayStatusArray !== null ? (
          <>
            <p>GoriColle Info:</p>
            <ChartOkigori StayStatusArray={StayStatusArray} />
          </>
        ) : (
          <p>Loading GoriColle Info...</p>
        )}
      </>
    );
  };



  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_APIKEY as string}
      render={render}
    >
      <Map
        style={{ width: "100%", aspectRatio: "16 / 14" }}
        center={{
          lat: props.currentLat,
          lng: props.currentLng,
        }}
      >
        <>
          {props.okigoriParams.map((param, index) => {
            const locationData = parseMeshCode(param.location);
            if (locationData) {
              return (
                <Marker
                  key={index.toString()}
                  position={{ lat: locationData.lat, lng: locationData.lon }}
                  url={param.imageUri}
                  clickable={true}
                  onClick={() => handleMarkerClick(param)} // マーカーがクリックされたときの処理
                />
              );
            }
            return null; // You might want to handle cases where locationData is not available
          })}
        </>

        <Marker
          key={"myGori"}
          position={{ lat: props.currentLat, lng: props.currentLng }}
          url={props.myImageUrl}
          clickable={true}
          onClick={handleMyGoriClick} // マーカーがクリックされたときの処理を追加
        />
      </Map>

      {/* クリックしたマーカーの情報を表示 */}
      {selectedMarker && (
        <>
          {props.mode === "GoriDrive" && (
            <>
              <p>meshCode:{selectedMarker.location.toString()}</p>
              <p>owner:{selectedMarker.owner.toString().slice(0, 6) + "..."}</p>
              <p>tokenId:{selectedMarker.tokenId.toString()}</p>
            </>
          )}
          {props.mode === "GoriColle" && (
            <>
              <p>tokenId:{selectedMarker.tokenId.toString()}</p>
              <AsyncGoriColleInfo tokenId={selectedMarker.tokenId} />
        {/* モーダルの描画 */}
        {isModalOpen && (
          <Modal
            title="ここでOkigoriを生成"
            onClose={closeModal}  // モーダルを閉じるために状態を更新
            opened={isModalOpen}
          >
            {/* モーダルの中身がここに入ります */}
          </Modal>

        )}
      </>
          )}
        </>
      )}
      {!selectedMarker && (
        <>
          {props.mode === "GoriDrive" && <></>}
          {props.mode === "GoriColle" && (
            <>
              <p>Buddy Gori is selected.</p>
            </>
          )}
        </>
      )}
    </Wrapper>
  );
}

function parseMeshCode(meshCode: number) {
  const meshCodeStr = meshCode.toString();
  // 文字列の長さが8であることを確認
  if (meshCodeStr.length !== 8) {
    // エラーハンドリングまたはエラーログを記述
    console.error("Invalid meshCode length");
    return null; // またはエラーを処理する他の方法を選択
  }
  const [a, b, c, d, e, f, g, h] = meshCodeStr.split("").map(Number);
  const lat = (((a * 10 + b) * 80 + e * 10 + g) * 30) / 3600;
  const lon = (((c * 10 + d) * 80 + f * 10 + h) * 45) / 3600 + 100;
  return { lat, lon };
}
