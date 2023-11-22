import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Map } from "./map";
import { Marker } from "./marker";
import { useRef, useState, useEffect, useContext } from "react";
import React from "react";
import isEqual from "lodash/isEqual";
import { ethers } from "ethers";
import { Container } from "@mantine/core";
import { Button, Modal, TextInput, Title, ModalBaseStylesNames } from "@mantine/core";
import GoriBattleStyle from "../contents/collection/collectionStyle.module.css"
import { ChartOkigori } from "../contents/collection/chartOkigori";
import ChartOkigoriModal from "../contents/collection/chartOkigoriModal";
import { StayGori } from "../../_hooks/useStayGori";
import TokenAbi from "../../_abi/GoriToken.json";
import { GORITOKEN_CONTRACT_ADDRESS } from "@/app/_const/contracts";
import { useContract } from "@/app/_hooks/useContract";
import { WalletContext } from "@/app/context/wallet";
import Image from "next/image";
import { Chart } from "../contents/collection/chart";


interface Props {
  currentLat: number;
  currentLng: number;
  myGoriName: string;
  myImageUrl: string;
  okigoriParams: StayGori[]; // 置きゴリのリストを受け取る
  mode: string;
  showGoriDetail: boolean;
}
const OpponentGoriParam = {
  name: "Pesos Gori",
  imageURI:
    "https://ipfs.io/ipfs/QmY6JMPQDjfNn29LxRBDAJUtoLQBFcnYQLU1dn4fYnDz1D/wonderful_gorilla_with_mazda_300.png",
  Driving: 5,
  Safe: 2,
  Eco: 5,
  Distance: 8,
  Refuling: 4,
};

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
    setSelectedMarker(null); // 選択中のマーカーを解除
  };
  const ref = useRef<HTMLDivElement>(null);
  const render = (status: Status) => {
    return <div>{status}</div>;
  };
  function closeModal() {
    setModalOpen(false)
  }

  const AsyncGoriColleInfo = ({ tokenId }: { tokenId: number }) => {
    const { contract: tokenContract, isLoading: isContractLoading } = useContract(GORITOKEN_CONTRACT_ADDRESS, TokenAbi.abi);

    useEffect(() => {
      if (!isContractLoading) {

        //console.log("Fetching GoriColle info...");
        const fetchData = async () => {
          try {
            const result = await tokenContract!.getStayGoriDepositToken(wallet.address, tokenId);

            // BigNumber オブジェクトから通常の数値に変換した tokenIds 配列
            const tokenIdsArray = result[0].map((value: ethers.BigNumber) =>
              value.toNumber()
            );

            // 新しいステータス配列を作成
            const newStayStatusArray = ["1", "2", "3", "4", "5"].map(
              (tokenId) => {
                const amountIndex = tokenIdsArray.indexOf(Number(tokenId));




                
                //console.log(tokenId, amountIndex);
                return amountIndex !== -1
                  ? Number(ethers.utils.formatEther(result[1][amountIndex]) || 0)
                  : 0;
              }
            );

            //console.log("Setting StayStatusArray:", newStayStatusArray);

            // 新しいステートをセット
            // 現在のステートと新しいステートが同じでない場合のみセット
            if (!isEqual(newStayStatusArray, StayStatusArray)) {
              setStayStatusArray(newStayStatusArray);
            }
          } catch (error) {
            console.error("Error fetching GoriColle info:", error);
          }
        };

        fetchData();
      }

    }, [tokenId, isContractLoading]);

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
              <p>owner:{selectedMarker.owner.toString().slice(0, 6) + "..."}</p>
              <AsyncGoriColleInfo tokenId={selectedMarker.tokenId} />
              {isModalOpen &&  wallet.address && selectedMarker.owner.toString()!==wallet.address &&(
                <Modal
                  onClose={closeModal}
                  opened={isModalOpen}
                  centered={true}
                  padding={0}
                  withCloseButton={false}
                >
                  <div className={GoriBattleStyle.modalStyle}>
                    <div className={GoriBattleStyle.goriBattleTitle}>Gorilla Battle</div>
                    <Container className={GoriBattleStyle.container}>
                      <div className={GoriBattleStyle.item}>
                        <p>{props.myGoriName}</p>
                        {props.myImageUrl && (
                          <Image
                            src={props.myImageUrl}
                            alt="Gorilla Image"
                            layout="fixed"
                            object-position="center"
                            width={300}
                            height={300}
                          />
                        )}
                        <Chart />
                      </div>
                      <div className={GoriBattleStyle.item}>
                        <p>{OpponentGoriParam.name}</p>
                        {OpponentGoriParam.imageURI && (
                          <Image
                            src={OpponentGoriParam.imageURI}
                            alt="Gorilla Image"
                            layout="fixed"
                            object-position="center"
                            width={300}
                            height={300}
                          />
                        )}
                        <ChartOkigoriModal
                          Driving={OpponentGoriParam.Driving}
                          Eco={OpponentGoriParam.Eco}
                          Distance={OpponentGoriParam.Distance}
                          Refuling={OpponentGoriParam.Refuling}
                          Safe={OpponentGoriParam.Safe}
                        />
                      </div>
                    </Container>
                    <br />
                    <div className={GoriBattleStyle.buttonContainer}>
                      <button className={GoriBattleStyle.battleButton}>
                        Let{"'"}s Gorilla Battle!!
                      </button>
                    </div>
                    <br />
                  </div>
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

