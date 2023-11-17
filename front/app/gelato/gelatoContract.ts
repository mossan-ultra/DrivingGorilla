import { ethers } from "ethers";
import {
    MetaTransactionData,
    OperationType,
} from "@safe-global/safe-core-sdk-types";
import { GelatoRelayPack } from "zkatana-gelato-relay-kit";
import AccountAbstraction, {
    AccountAbstractionConfig,
} from "zkatana-gelato-account-abstraction-kit";
import { Web3Auth } from "@web3auth/modal";
import axios from "axios";
import { TaskState } from "../_components/status/status";

const GELATO_RELAY_API_KEY = process.env.NEXT_PUBLIC_GELATO_RELAY_API_KEY;

export type GelatoDetail = {
    txHash: string;
    chainId: string;
    blockNumber: string;
    executionDate: string;
    creationnDate: string;
    taskState: string;
}
export class GelatoContract extends ethers.Contract {

    wait = async (taskIdToQuery: string) => {

        return new Promise((resolve, reject) => {
            let details;
            const intervalId = setInterval(async () => {
                details = await this.getGelatoTaskStatus(taskIdToQuery);
                let isStopTimer = false;

                switch (details.taskState!) {
                    case TaskState.WaitingForConfirmation:
                    case TaskState.Pending:
                    case TaskState.CheckPending:
                    case TaskState.ExecPending:
                        isStopTimer = false;

                        break;
                    case TaskState.ExecSuccess:
                    case TaskState.Cancelled:
                    case TaskState.ExecReverted:
                    case TaskState.NotFound:
                    case TaskState.Blacklisted:
                    default:
                        isStopTimer = true;
                        break;
                }

                if (isStopTimer) {
                    clearInterval(intervalId);
                    resolve(details);
                }
            }, 1000);
        });
    }

    getGelatoTaskStatus = async (taskIdToQuery: string) => {
        const res = await axios.get(
            `https://relay.gelato.digital/tasks/status/${taskIdToQuery}`
        );

        let status = res.data.task;

        let details: GelatoDetail = {
            txHash: status?.transactionHash || undefined,
            chainId: status?.chainId?.toString() || undefined,
            blockNumber: status?.blockNumber?.toString() || undefined,
            executionDate: status?.executionDate || undefined,
            creationnDate: status?.creationDate || undefined,
            taskState: (status?.taskState as TaskState) || undefined,
        };

        return details;

    }
    async txWithGelate(transaction: string, provider: ethers.providers.Web3Provider, web3auth: Web3Auth) {
        const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

        const gasLimit = "10000000";
        const txConfig = {
            to: this.address,
            data: transaction,
            value: "0",
            // operation: 0,
            gasLimit,
            GAS_TOKEN: ethers.constants.AddressZero,
        };

        const safeTransactions: MetaTransactionData[] = [
            {
                to: txConfig.to,
                data: txConfig.data,
                value: txConfig.value,
                operation: OperationType.Call,
            },
        ];
        let web3AuthSigner;
        try {
            const privateKey = "0x" + await web3auth!.provider!.request({
                method: "eth_private_key"
            }) as string;
            web3AuthSigner = new ethers.Wallet(privateKey!, provider!);
        } catch (error) {

        }
        const relayPack = new GelatoRelayPack(GELATO_RELAY_API_KEY);
        const safeAccountAbstraction = new AccountAbstraction(web3AuthSigner!);
        const sdkConfig: AccountAbstractionConfig = {
            relayPack,
        };
        await safeAccountAbstraction.init(sdkConfig);

        const response = await safeAccountAbstraction.relayTransaction(
            safeTransactions,
            {
                gasLimit: (txConfig.gasLimit),
                // gasToken: txConfig.GAS_TOKEN,
                isSponsored: true,
            }
        );
        console.log(`response,${response}`)
        console.log(`https://relay.gelato.digital/tasks/status/${response}`);

        // await sleep(5000);    //連続でトランザクション叩くとエラーになるのでまつ（根拠は特になし）
        const detail = await this.wait(response);
        console.log(detail)
        return detail;



    };

};
