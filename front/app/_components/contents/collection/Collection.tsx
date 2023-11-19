import parentClasses from "../contents.module.css";
import { useStayGori } from "../../../_hooks/useStayGori";
import React, { useContext, useEffect, useState } from "react";
import GoriMap from "../../map/goriMap";
import { ethers } from "ethers";
import { Table } from "@mantine/core";
import {
  GORITOKEN_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
} from "../../../_const/contracts";
import { useDriveTokens } from "@/app/_hooks/useDriveTokens";
import { Button, Modal, TextInput, Title } from "@mantine/core";
import { useContract } from "@/app/_hooks/useContract";
import { WalletContext } from "@/app/context/wallet";
import TokenAbi from "../../../_abi/GoriToken.json";
import { GelatoContract } from "@/app/gelato/gelatoContract";
import styles from "./collectionStyle.module.css";
import { BuddyGoriContext } from "../../../context/buddyGori";


enum token {
  Driving,
  Eco,
  Distance,
  Safe,
  Refuling,
}

export const Collection = () => {

  const wallet = useContext(WalletContext);

  //ドライブで得た経験値を取得;
  const { amounts: driveTokens, isLoading: driveTokensIsLoading } =
    useDriveTokens(wallet.address as string);
  const [isLoadingModal, setIsLoadingModal] = useState(false); // モーダル内のローディングフラグを追加
  const [okiGoriPeriod, setOkiGoriPeriod] = useState(1); // 初期値を1に設定（短い期間）
  const { name, imgUrl, isLoading, isHoldBuddy, deleteBuddy, reload } = useContext(BuddyGoriContext);
  const { staygoris, isLoading: isStayGoriLoading } = useStayGori();
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [eco, setEco] = useState(0);
  const [distance, setDistance] = useState(0);
  const [safe, setSafe] = useState(0);
  const [refuel, setRefuel] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true); // ローディングフラグを追加
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの可視性を管理するためのステートを追加
  const [modalMessage, setModalMessage] = useState(""); // モーダル内のメッセージを追加
  const headers = ["STR", "LUK", "AGI", "DEF", "VIT"];
  interface TableRowProps {
    values: number[];
    isSelectRow?: boolean;
  }
  const TableRow: React.FC<TableRowProps> = ({
    values,
    isSelectRow = false,
  }) => (
    <Table.Tr>
      {values.map((value, index) => (
        <Table.Td
          key={index}
        >
          {isSelectRow ? (
            <select
              value={value}
              onChange={(event) => handleSelectChange(event, index)}
            >
              {Array.from({ length: maxValues[index] + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          ) : (
            value
          )}
        </Table.Td>
      ))}
    </Table.Tr>
  );
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });
  const { contract: goriTokenContract, isLoading: isGoriTokenContractLoading } = useContract(GORITOKEN_CONTRACT_ADDRESS, TokenAbi.abi);

  const [selectedValues, setSelectedValues] = useState([0, 0, 0, 0, 0]);
  const maxValues = [time, safe, eco, distance, refuel]; // それぞれの選択肢の最大値を設定
  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    const value = Number(event.target.value);
    const newSelectedValues = [...selectedValues]; // 現在の配列をコピー
    newSelectedValues[index] = value; // 選択した値を更新
    setSelectedValues(newSelectedValues); // 新しい配列をセット
  };

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
  useEffect(() => {
    if (!isGoriTokenContractLoading) {
      initialize();
    }
  }, [isGoriTokenContractLoading, driveTokensIsLoading]);

  useEffect(() => {
    if (!isLoading) {
      initialize();
    }
  }, [isLoading]);




  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }
  };

  const handleOkiGoriPeriodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value, 10); // スライダーの値を整数に変換
    setOkiGoriPeriod(value); // okiGoriPeriodの値を更新
  };

  async function initialize() {
    try {
      if (goriTokenContract && wallet.address) {

        await setTime(driveTokens[token.Driving]);
        await setEco(driveTokens[token.Eco]);
        await setDistance(driveTokens[token.Distance]);
        await setSafe(driveTokens[token.Safe]);
        await setRefuel(driveTokens[token.Refuling]);
        // データの取得が完了したらローディングフラグをオフにする
        setIsLoadingData(false);
        getCurrentLocation();
      } else {
        console.log("ゴリトークンコントラクトが空です");
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      setIsLoadingData(false); // エラー時もローディングフラグをオフにする
    }
  }

  if (!wallet.address) {
    return (
      <div className={parentClasses.container}>
        <div className={parentClasses.window}>
          <p>Address is undefined. Please connect your wallet.</p>
        </div>
      </div>
    );
  }

  const filteredStaygoris = staygoris.filter((staygori) => {
    //  return staygori.owner === wallet.address && String(staygori.location).length === 8;
    return String(staygori.location).length === 8;
  });

  const onClickOkigoriButton = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    // モーダルを閉じる
    setIsModalOpen(false);
  };

  async function clickMakeOkigori() {
    if (wallet.address) {
      setIsLoadingModal(true);
      setModalMessage("Generating...");
      {
        await makeOkiGoriCode(
          wallet.address,
          calculate3rdMeshCode(
            currentLocation.latitude,
            currentLocation.longitude
          ).toString(),
          imgUrl as string,
          selectedValues,
          okiGoriPeriod
        );
      }
      // ローディングを無効にし、メッセージを変更し、モーダルを閉じる
      setIsLoadingModal(false);
      setModalMessage("Generation completed!");
      setTimeout(() => {
        setModalMessage(""); // メッセージをクリア
        handleCloseModal();
      }, 2000); // 2秒後にメッセージをクリアしてモーダルを閉じる
    } else {
      console.log("Unable to retrieve the address successfully");
    }
  }

  async function makeOkiGoriCode(
    address: string,
    meshCode: string,
    imageUrl: string,
    goriParam: number[],
    goriPeriod: number
  ) {
    const indicesAndNonZeroElements = findIndicesOfZeroElements(goriParam);
    const parsedValues = indicesAndNonZeroElements[1].map((value) =>
      ethers.utils.parseEther(value.toString())
    );
    // arrayBを10進数の文字列の配列に変換
    const decimalParsedValues = parsedValues.map((bigNumberValue) =>
      bigNumberValue.toString()
    );

    if (goriTokenContract) {
      await action(goriTokenContract);
    } else {
      //ここから生成周りの処理//
    }
    async function action(contract: GelatoContract) {
      const period = (goriPeriod * 24 * 60 * 60) / 2;
      let isApprove = await contract.isApprovedForAll(
        address,
        STAKING_CONTRACT_ADDRESS,
      );
      if (!isApprove) {
        const setApprovalForAll =
          await contract!.interface.encodeFunctionData("setApprovalForAllGori",
            [
              address,
              STAKING_CONTRACT_ADDRESS,
              true,
            ]
          );
        await contract?.txWithGelate(setApprovalForAll, wallet.provider!, wallet.web3Auth!)
      }
      const makeStayGori =
        await contract!.interface.encodeFunctionData("makeStayGori",
          [
            address,
            meshCode,
            imageUrl,
            indicesAndNonZeroElements[0], // stakingするtokenId  の一覧
            decimalParsedValues, // それぞれのtokenIdに対してステーキングするトークン量（ユーザーが持っているトークン以下の設定）
            period, // おきゴリ期間（単位：BlockNumber
          ]
        );
      await contract?.txWithGelate(makeStayGori, wallet.provider!, wallet.web3Auth!)
    }
  }

  return (
    <div className={parentClasses.container}>
      <div className={parentClasses.window}>
        <h1 className={parentClasses.title} data-swiper-parallax="-300">
          Collection
        </h1>
        {isLoading ? (
          <div>Now Loading...</div>
        ) : !name ? (
          <div>最初に相棒ゴリラを受け取ってください</div>
        ) : (
          <>
            {" "}
            <div className="text-center">
              <button
                onClick={onClickOkigoriButton}
                //disabled={isLoadingData} // ローディング中はボタンを無効化
                className={styles.createOkigoriButton}
              >
                Generate Okigori here
              </button>
              <Modal
                title="Generate Okigori here"
                onClose={handleCloseModal}
                opened={isModalOpen}
              >
                <div className="text-center">
                  <p>Set Parameters for the Okigori</p>
                  {currentLat && currentLng ? (
                    <>
                      <Table className={styles.tableOkigoriStyle}>
                        <Table.Tbody>
                          <Table.Tr>
                            {headers.map((header, index) => (
                              <Table.Th className={styles.tableOkigoriCellStyle} key={index}>
                                {header}
                              </Table.Th>
                            ))}
                          </Table.Tr>
                          <TableRow values={[time, eco, distance, safe, refuel]} />
                          <TableRow values={selectedValues} isSelectRow />
                        </Table.Tbody>
                      </Table>

                    </>
                  ) : (
                    <p>
                      Unable to Generate Okigori as Location Information is Unavailable
                    </p>
                  )}

                  <br />
                  <p>
                    Period:  Short
                    <input
                      type="range"
                      min="1"
                      max="9"
                      step="1"
                      value={okiGoriPeriod}
                      onChange={handleOkiGoriPeriodChange}
                    />
                    Long
                  </p>
                  <br />
                  {modalMessage && <p>{modalMessage}</p>}{" "}
                  {/* メッセージを表示 */}
                  <Button
                    onClick={() => clickMakeOkigori()}
                    style={{ margin: "0 8px" }} // 左右にマージンを追加
                    disabled={isLoadingModal} // ローディング中はボタンを無効化
                  >
                    {isLoadingModal ? "Generating..." : "Generate"}
                  </Button>
                  <Button
                    onClick={() => handleCloseModal()}
                    style={{ margin: "0 8px" }} // 左右にマージンを追加
                    disabled={isLoadingModal} // ローディング中はボタンを無効化
                  >
                    Cancel
                  </Button>
                </div>
              </Modal>
            </div>
          </>
        )}
        {!isLoading && currentLat && currentLng && !isStayGoriLoading ? (
          <GoriMap
            currentLat={currentLat}
            currentLng={currentLng}
            myGoriName={name as string}
            myImageUrl={imgUrl as string}
            okigoriParams={filteredStaygoris}
            mode="GoriColle"
            showGoriDetail={true}
          />
        ) : (
          <p>Now GoriMap Loading...</p>
        )}
      </div>
    </div>
  );
};

function calculate3rdMeshCode(latitude: number, longitude: number) {
  if (
    latitude < 20.0 ||
    latitude >= 45.0 ||
    longitude < 100.0 ||
    longitude >= 145.0
  ) {
    return "位置情報が日本国内にありません";
  }
  // 北方向のメッシュ数を計算
  const northMeshCount = Math.floor(latitude / (30 / 3600));
  const firstDigit = Math.floor(northMeshCount / 80);
  const seventhDigit = northMeshCount % 10;
  const fifthDigit = (northMeshCount - firstDigit * 80 - seventhDigit) / 10;
  const eastMeshCount = Math.floor((longitude - 100) / (45 / 3600));
  const thirdDigit = Math.floor(eastMeshCount / 80);
  const eighthDigit = eastMeshCount % 10;
  const sixthDigit = (eastMeshCount - thirdDigit * 80 - eighthDigit) / 10;
  const meshCode = `${firstDigit}${thirdDigit}${fifthDigit}${sixthDigit}${seventhDigit}${eighthDigit}`;
  return meshCode;
}

function findIndicesOfZeroElements(arr: number[]): number[][] {
  const zeroIndices: number[][] = [[], []];
  //0でない要素のみを取得
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 0) {
    } else {
      zeroIndices[0].push(i + 1);
      zeroIndices[1].push(arr[i]);
    }
  }
  return zeroIndices;
}
