"use client";

import { Contract, ethers } from "ethers";
import GoriToken from "../_abi/GoriToken.json";
import DriveContractAbi from "../_abi/Drive.json";
import { DRIVE_CONTRACT_ADDRESS, GORITOKEN_CONTRACT_ADDRESS } from "../_const/contracts";

// ゴリラアドレス
const contractAddress = GORITOKEN_CONTRACT_ADDRESS;

const driveContractAddress = DRIVE_CONTRACT_ADDRESS;

let erc1155contract: ethers.Contract | null = null;
let driveContract: ethers.Contract | null = null;

export const getContract = (): Contract => {
  if (erc1155contract) {
    return erc1155contract;
  }
  // RPC
  const rpcUrl =
    `https://avalanche-fuji.infura.io/v3/${process.env.NEXT_PUBLIC_INFULA_CLIENT_ID}`;

  // Providerインスタンス作成
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // Contractインスタンス作成
  const contract: Contract = new ethers.Contract(
    contractAddress,
    GoriToken.abi,
    provider
  );
  erc1155contract = contract;

  return contract;
};

export const getDriveContract = () => {
  if (driveContract) {
    return driveContract;
  }
  // RPC
  const rpcUrl =
    `https://avalanche-fuji.infura.io/v3/${process.env.NEXT_PUBLIC_INFULA_CLIENT_ID}`;

  // Providerインスタンス作成
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // Contractインスタンス作成
  const contract: Contract = new ethers.Contract(
    driveContractAddress,
    DriveContractAbi.abi,
    provider
  );
  driveContract = contract;

  return contract;
};


export const getSignerWithWallet = () => {
  // MetamaskからProviderインスタンス作成
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // signer生成
  const signer = provider.getSigner();

  return signer;
};

export const getContractWithWallet = () => {
  // Contractインスタンス作成
  const contract: Contract = new ethers.Contract(
    contractAddress,
    GoriToken.abi,
    getSignerWithWallet()
  );

  return contract;
};

export const getContractWithSigner = (signer: any) => {
  const contract: Contract = new ethers.Contract(
    contractAddress,
    GoriToken.abi,
    signer
  );

  return contract;
};
