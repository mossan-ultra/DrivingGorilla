"use client";

import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { walletConnectionAtom } from "../_recoil/atoms/web3";
import { base64Decode } from "../_utils/common";
import { getContract } from "../_utils/contract";

// 装備のデータ
export type Equipment = {
  name: string;
  category: string;
  description: string;
  image: string;
  driving: number;
  eco: number;
  distance: number;
  safe: number;
  refuling: number;
};

// 装備データをJSONから読み取る際に、特定要素に変換をかけるための関数
const equipmentReviver = (k: string, v: string) => {
  const numberElements = ["driving", "eco", "distance", "safe", "refuling"];
  if (numberElements.includes(k)) {
    return Number(v);
  }
  return v;
};

export const useEquipments = (walletAddress: string) => {
  // Contractインスタンス作成
  const contract: Contract = getContract();

  // 財布接続状況
  const isWalletConnected = useRecoilValue(walletConnectionAtom);

  // 対象のウォレットが持つ装備のIDを取得
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 財布がつながっていない場合は処理をしない
    if (isWalletConnected) {
      (async () => {
        // 発行されたEquipmentのTokenIDのログ(Event)を取得
        // 装備はメタ情報が変わらない前提なので、Event検索でおk
        const recv = await contract.queryFilter(
          contract.filters.EquipmentMinted()
        );

        const tempEquipments = [];

        // ログからwalletが持ち主の装備を取得
        for (const log of recv) {
          // Eventのargsがない場合はスキップ
          if (!log.args) continue;

          // argsを分割代入
          const [owner, tokenId] = log.args;

          // 装備の持ち主が財布の持ち主と違う場合はスキップ
          if (owner !== walletAddress) continue;

          // 装備IDを元に装備詳細を取得
          const equipment64 = await contract.uri(tokenId);
          const json = await base64Decode(equipment64);
          let e: Equipment = JSON.parse(json, equipmentReviver);
          e.driving = Number(ethers.utils.formatEther(e.driving.toString()));
          e.eco = Number(ethers.utils.formatEther(e.eco.toString()));
          e.distance = Number(ethers.utils.formatEther(e.distance.toString()));
          e.refuling = Number(ethers.utils.formatEther(e.refuling.toString()));
          e.safe = Number(ethers.utils.formatEther(e.safe.toString()));

          tempEquipments.push(e);
        }
        setEquipments(tempEquipments);
        setIsLoading(false);
      })();
    }
  }, [isWalletConnected, walletAddress]);

  return {
    equipments,
    isLoading,
  };
};
