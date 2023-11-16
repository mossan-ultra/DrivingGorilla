import { useRanking } from "@/app/_hooks/useRanking";
import classes from "./status.module.css";
import { WalletContext } from "@/app/context/wallet";
import { useContext } from "react";

export const Ranking = () => {
    const wallet = useContext(WalletContext);

    const { ranking, isLoading: rankingIsLoading } =
        useRanking(wallet.address as string);

    return (
        <>
            {wallet.connected ? (
                <>
                    {rankingIsLoading ? (
                        <div>Now Loading...</div>
                    ) : (
                        <>
                            <div className="static flex-row">
                                <ul>
                                    {ranking.map((d) => (
                                        <li key={d.toAddress}>
                                            {
                                                (wallet.address) == d.toAddress ? (
                                                    <div className='flex flex-row animate-pulse bg-rose-700'>
                                                        <div className="w-12 text-sm text-center">{(d.rank).toLocaleString()}</div>
                                                        <div className="w-48 text-xs truncate">{d.toAddress}</div>
                                                        <div className="w-24 text-xs text-right">{(d.exp).toLocaleString()}</div>
                                                    </div>
                                                ) : (
                                                    <div className='flex flex-row'>
                                                        <div className="w-12 text-sm text-center">{(d.rank).toLocaleString()}</div>
                                                        <div className="w-48 text-xs truncate">{d.toAddress}</div>
                                                        <div className="w-24 text-xs text-right">{(d.exp).toLocaleString()}</div>
                                                    </div>
                                                )
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div>Not Connected</div>
            )}
        </>
    );
}