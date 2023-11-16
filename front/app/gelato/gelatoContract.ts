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

const GELATO_RELAY_API_KEY = process.env.NEXT_PUBLIC_GELATO_RELAY_API_KEY;

export class GelatoContract extends ethers.Contract {


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

        await sleep(5000);    //連続でトランザクション叩くとエラーになるのでまつ（根拠は特になし）



    };

};
