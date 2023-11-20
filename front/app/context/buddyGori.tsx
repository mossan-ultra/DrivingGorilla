import React from "react";
import { createContext } from "react";
import { useBuddyGori } from "../_hooks/useBuddyGori";
import { GelatoContract } from "../gelato/gelatoContract";

export type BuddyGoriContext = {
    name: string | undefined;
    imgUrl: string | undefined;
    isHoldBuddy: boolean | undefined;
    isLoading: boolean | undefined;
    deleteBuddy: () => void;
    reload: () => void;
};
const defaultContext: BuddyGoriContext = {
    name: undefined,
    imgUrl: undefined,
    isHoldBuddy: undefined,
    isLoading: undefined,
    deleteBuddy: () => { },
    reload: () => { }
};

export const BuddyGoriContext = createContext<BuddyGoriContext>(defaultContext);

export default function BuddyGoriProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const buddyGori = useBuddyGori();
    return (
        <BuddyGoriContext.Provider value={buddyGori}>
            {children}
        </BuddyGoriContext.Provider>
    );
}
