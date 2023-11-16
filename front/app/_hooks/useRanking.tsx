import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { getContract } from "../_utils/contract";
import { WalletContext } from "../context/wallet";

// Rankingのデータ
export type Ranking = {
    rank: number;
    toAddress: string;
    exp: number;
}

export const useRanking = (walletAddress: string) => {

    // 財布接続状況
    const [ranking, setRanking] = useState<Ranking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const wallet = useContext(WalletContext);

    useEffect(() => {
        const _ranking: Ranking[] = [];
        if (wallet.connected) {
            const contract = getContract();
            (async () => {

                const _items: any[] = [];
                const recv = await contract.queryFilter(
                    // contract.filters.TransferSingle(null, null, null, 0, null)
                    //  _id=0 のみを拾いたいがrecvが常にundefinedになる・・・
                    contract.filters.TransferSingle()
                );
                for (const log of recv) {
                    if (!log.args) continue;
                    if (log.args._id != 0) continue;
                    const item = log.args._to;
                    _items.push(item);
                }
                const wallets = new Set(_items);

                for (const log of wallets) {
                    const walletAddressList = new Array<string>(5).fill(log);
                    const paramsId = ["1", "2", "3", "4", "5"];
                    const results = await contract.balanceOfBatch(
                        walletAddressList,
                        paramsId
                    );

                    const exp: any = results.map((r: BigNumber) =>
                        Number(ethers.utils.formatEther(r))
                    );

                    _ranking.push({
                        rank: 0,
                        toAddress: log,
                        exp: exp[0] + exp[1] + exp[2] + exp[3] + exp[4],
                    })
                }

                var _sorted = Array.from(_ranking);
                _sorted.sort((a, b) => b.exp - a.exp);

                var rank: number = 0;
                setRanking(
                    _sorted.map((item) => {
                        rank++;
                        item.rank = rank;
                        return item;
                    }));
                setIsLoading(false);
            })();
        }
    }, [wallet, walletAddress]);

    return {
        ranking,
        isLoading,
    };
}