import { DRIVE_CONTRACT_ADDRESS } from '@/app/_const/contracts';
import { useContract } from '@/app/_hooks/useContract';
import { useDriveTokens } from '@/app/_hooks/useDriveTokens';
import { StayGori } from '@/app/_hooks/useStayGori';
import { WalletContext } from '@/app/context/wallet';
import { Card, Image, Badge, Group, Table } from '@mantine/core';
import { ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import TokenContractAbi from "../../_abi/GoriToken.json";
import { getContract } from '@/app/_utils/contract';

interface Props {
    stayGori: StayGori;
}

export const OkigoResult = ({ stayGori }: Props) => {
    const wallet = useContext(WalletContext);
    const { amounts: driveTokens, isLoading: driveTokensIsLoading } =
        useDriveTokens(wallet.address as string);
    const [mintAmount, setMintAmount] = useState<TokenAmount[]>([]);
    const [isProcessingComplete, setIsProcessingComplete] = useState(true);
    const { contract: tokenContract, isLoading: isContractLoading } = useContract(DRIVE_CONTRACT_ADDRESS, TokenContractAbi.abi);
    const headers = ["STR", "LUK", "AGI", "DEF", "VIT"];

    type TokenAmount = {
        id: string;
        name: string;
        before: string;
        after: string;
    }

    const mintTokenRows = (data: TokenAmount[]) => data.map((element) => (
        <Table.Tr key={element.id}>
            <Table.Td>{element.name}</Table.Td>
            <Table.Td>{`${Number((element.before))} →`}</Table.Td>
            <Table.Td>{Number(ethers.utils.formatEther(element.after))}</Table.Td>
        </Table.Tr>
    ));

    const lostTokenRows = (deposit: { tokenid: number, amount: number }[]) => deposit.map((element) => (
        <Table.Tr key={element.tokenid}>
            <Table.Td>{headers[element.tokenid]}</Table.Td>
            <Table.Td>{Number(ethers.utils.formatEther(element.amount))}</Table.Td>
        </Table.Tr>
    ));


    useEffect(() => {
        //おきごりを完了させてクレームされたトークンを確認する
        if (isContractLoading || driveTokensIsLoading) {
            return;
        }
        (async () => {

            const data =
                await tokenContract!.interface.encodeFunctionData("completeStayGori",
                    [
                        wallet.address,
                        stayGori.tokenId
                    ]
                );
            await tokenContract?.txWithGelate(data, wallet.provider!, wallet.web3Auth!);

            const contract: ethers.Contract = getContract();

            const walletAddressList = new Array<string>(5).fill(wallet.address as string);
            const paramsId = ["1", "2", "3", "4", "5"];

            const results = await contract.balanceOfBatch(
                walletAddressList,
                paramsId
            );

            //画面に表示するデータの構築
            const tokens: TokenAmount[] = [];
            for (let i = 0; i < 5; i++) {
                tokens.push({
                    id: (i + 1).toString(),
                    name: headers[i],
                    before: driveTokens[i].toString(),
                    after: results[i].toString()
                })

            }
            setMintAmount(tokens)
            setIsProcessingComplete(false);
        })();

    }, [isContractLoading, driveTokensIsLoading])


    return (
        <>
            {
                stayGori.detail.isEscape ?
                    <>
                        <Badge color="red" variant="light" size="md"
                        >
                            Sorry, your gorilla escaped...
                        </Badge>
                    </>
                    : <Badge color="blue" variant="light" size="md"
                    >
                        Come Back!!
                    </Badge>
            }
            <p >location:{stayGori.location.toString()}</p>
            <p >tokenId:{stayGori.tokenId.toString()}</p>


            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section style={{ display: 'flex', justifyContent: 'center' }}>
                    <Image
                        src={stayGori.detail.isEscape ? '/images/escape.jpeg' : '/images/comeback.jpeg'}
                        style={{ width: '50%' }}
                    />
                </Card.Section>
                {stayGori.detail.isEscape ?
                    <>                        {
                        isProcessingComplete ?
                            <>Processing ...</> :
                            <>
                                The token you deposited is gone...
                                <Table>
                                    <Table.Tbody>{lostTokenRows(stayGori.detail.deposit)}</Table.Tbody>
                                </Table>

                            </>
                    }
                    </> :
                    <>
                        {
                            isProcessingComplete ?
                                <>Processing ...</> :
                                <>
                                    Congratulations! The gorilla has increased the number of tokens!
                                    <Table>
                                        <Table.Tbody>{mintTokenRows(mintAmount.filter(element => Number(element.id) <= 5).sort((a, b) => Number(a.id) - Number(b.id)))}</Table.Tbody>
                                    </Table>

                                </>
                        }
                    </>
                }


                <Group justify="space-between" mt="md" mb="xs" style={{ display: 'flex', justifyContent: 'center' }}>
                </Group>

                {/* <Text size="sm" c="dimmed">
                    With Fjord Tours you can explore more of the magical fjord landscapes with tours and
                    activities on and around the fjords of Norway
                </Text> */}

                {/* <Button variant="light" color="blue" fullWidth mt="md" radius="md">
                    
                </Button> */}
            </Card>

        </>
    );

}
