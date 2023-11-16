import { atom } from "recoil";

export const walletAddressAtom = atom({
  key: "walletAddress",
  default: "",
});

export const walletConnectionAtom = atom({
  key: "walletConnection",
  default: false,
});
