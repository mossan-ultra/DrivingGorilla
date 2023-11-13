
require("dotenv").config();
const { ethers, ContractFactory, Wallet } = require("ethers");
const fs = require('fs');

const starTale = 0;
const thirdWeb = 1;

const chainType = starTale;

function ethers2wei(ethers) {
    // return ethers.utils.parseEther(ethers)
    return (Number(ethers) * 10 ** 18).toString()
}
async function main() {
    const GoriToken = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriToken.sol/GoriToken.json', 'utf8'));
    const Drive = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/Drive.sol/Drive.json', 'utf8'));
    const GoriDrop = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriDrop.sol/GoriDrop.json', 'utf8'));
    const GoriStaking = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriStaking.sol/GoriStaking.json', 'utf8'));
    const GoriNFT = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriNFT.sol/GoriNFT.json', 'utf8'));
    const provider = new ethers.providers.JsonRpcProvider(`https://rpc.startale.com/zkatana/`)
    const signer = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        provider
    );
    
    const from = await signer.getAddress();

    console.log(process.env.ERC1155_CONTRACT_ADDRESS)
    const erc1155contract = new ethers.Contract(process.env.ERC1155_CONTRACT_ADDRESS, GoriToken.abi, signer);
    const driveContract = new ethers.Contract(process.env.DRIVE_CONTRACT_ADDRESS, Drive.abi, signer);
    const goriDropContract = new ethers.Contract(process.env.AIRDROP_CONTRACT_ADDRESS, GoriDrop.abi, signer);
    const goriStakingContract = new ethers.Contract(process.env.STAKING_CONTRACT_ADDRESS, GoriStaking.abi, signer);
    const goriNFTContract = new ethers.Contract(process.env.GORINFT_CONTRACT_ADDRESS, GoriNFT.abi, signer);

    // エアドロの設定
    await erc1155contract.setApprovalForAll(

        process.env.AIRDROP_CONTRACT_ADDRESS, true
    )
    await goriDropContract.changeERC1155Contract(
        process.env.ERC1155_CONTRACT_ADDRESS
    )

    console.log('Air Drop Setting:done')

    //ドライブインセンティブコントラクトの設定をする
    await driveContract.changeGoriTokenContract(
        process.env.ERC1155_CONTRACT_ADDRESS
    )
    console.log('Insentive Token Contract Setting:done')

    //ゴリステの設定
    await erc1155contract.setGoriStaking(
        process.env.STAKING_CONTRACT_ADDRESS
    )
    console.log('setup GoriStaking:done')

    await goriStakingContract.changeStakingToken(
        process.env.ERC1155_CONTRACT_ADDRESS
    )
    console.log(`changeStakingToken ${process.env.ERC1155_CONTRACT_ADDRESS}:done`)

    // GoriNFT setting
    const nftminter = process.env.ERC1155_CONTRACT_ADDRESS;
    await goriNFTContract.addMinter(
        nftminter
    )
    await erc1155contract.setGoriNFT(
        process.env.GORINFT_CONTRACT_ADDRESS
    )

    console.log(`goriNFTContract addMinter->${nftminter} :done`)


    //ステーキング報酬用に大量にミントしておく
    const rewardAmount = ethers.utils.parseEther('100');
    await erc1155contract.mint(
        process.env.STAKING_CONTRACT_ADDRESS, 1, rewardAmount
    )
    await erc1155contract.mint(
        process.env.STAKING_CONTRACT_ADDRESS, 2, rewardAmount
    )
    await erc1155contract.mint(
        process.env.STAKING_CONTRACT_ADDRESS, 3, rewardAmount
    )
    await erc1155contract.mint(
        process.env.STAKING_CONTRACT_ADDRESS, 4, rewardAmount
    )
    await erc1155contract.mint(
        process.env.STAKING_CONTRACT_ADDRESS, 5, rewardAmount
    )
    console.log('transfer staking token:done')


    // 相棒ゴリを生成する
    const mintAmount = 1000;
    await erc1155contract.mint(
        from, 0, mintAmount
    );
    console.log(`Mint Partner Gori:done, to ${from} ammount=${mintAmount} minted`)

    // NFTミントポイントを設定する
    const mintinfos = [
        // https://jstatmap.e-stat.go.jp/map.html
        {
            //東京タワー
            location: 53393599, tokenId: 1001, equipment: {
                name: "steel shield", category: 'shield', description: 'A fairly hard iron shield. Female gorillas will no longer like you.',
                imageUri: 'https://dalleproduse.blob.core.windows.net/private/images/1c882950-fb0b-4ca7-a476-c3748defb7d2/generated_00.png?se=2023-10-14T07%3A29%3A55Z&sig=iXxfL2hX4rtDtCylEv6XBU%2FmZxzrdYT%2F8NI9jmMXm7M%3D&ske=2023-10-16T08%3A21%3A44Z&skoid=09ba021e-c417-441c-b203-c81e5dcd7b7f&sks=b&skt=2023-10-09T08%3A21%3A44Z&sktid=33e01921-4d64-4f8c-a055-5bdaffd5e33d&skv=2020-10-02&sp=r&spr=https&sr=b&sv=2020-10-02',
                driving: ethers2wei('0.1'), eco: ethers2wei('0.1'), distance: ethers2wei('0.1'), safe: ethers2wei('0.1'), refuling: ethers2wei('0.1')
            },
        },
        {
            // 東京ディズニーランド
            location: 53393750, tokenId: 1002, equipment: {
                name: "Weak wooden weapon", category: 'weapon', description: 'It seems weak anyway. I also started losing at pachinko.',
                imageUri: 'https://dalleproduse.blob.core.windows.net/private/images/a1202425-8d33-4707-bc58-f85cf55f29c2/generated_00.png?se=2023-10-14T07%3A36%3A24Z&sig=3ZOKQmnL4y9I%2Fv0NCqOKH%2FdSOAWbnJv6o0UtlbT3wnc%3D&ske=2023-10-16T08%3A22%3A51Z&skoid=09ba021e-c417-441c-b203-c81e5dcd7b7f&sks=b&skt=2023-10-09T08%3A22%3A51Z&sktid=33e01921-4d64-4f8c-a055-5bdaffd5e33d&skv=2020-10-02&sp=r&spr=https&sr=b&sv=2020-10-02',
                driving: ethers2wei('0.02'), eco: ethers2wei('0.01'), distance: ethers2wei('0.5'), safe: ethers2wei('1'), refuling: ethers2wei('0.003')
            },
        },
        {
            location: 300,
            tokenId: 1003,
            equipment: {
                name: "アルミのメリケンサック",
                category: 'weapon',
                description: 'ゴリラ界の最新技術でアルミホイルを加工して作ったメリケンサック。殴ると曲がる。',
                imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Brass_knuckles_dsc04623.jpg/500px-Brass_knuckles_dsc04623.jpg',
                driving: ethers2wei('0.04'), eco: ethers2wei('0.04'), distance: ethers2wei('0.04'), safe: ethers2wei('0.04'), refuling: ethers2wei('0.04')
            },
        },
        {
            location: 400,
            tokenId: 1004,
            equipment: {
                name: "苦無(錆)",
                category: 'weapon',
                description: 'ゴリラが栃木県の山奥で拾った苦無。おそらく日光江戸村産のレプリカ。',
                imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Kunai05.jpg/440px-Kunai05.jpg',
                driving: ethers2wei('2'), eco: ethers2wei('3'), distance: ethers2wei('2'), safe: ethers2wei('5'), refuling: ethers2wei('0.0008')
            },
        },

        {
            // 長万部
            location: 63406310,
            tokenId: 1005,
            equipment: {
                name: "まんべくん",
                category: 'weapon',
                description: '最強のかに。暗黒大陸の住人。あと三回変身できる',
                imageUri: 'http://gotouchi-chara.jp/wp_jlca/wp-content/uploads/2020/03/manbekun-624x1024.png',
                driving: ethers2wei('5'), eco: ethers2wei('5'), distance: ethers2wei('5'), safe: ethers2wei('5'), refuling: ethers2wei('5')
            },
        },
        {
            // 奈良
            location: 52350623,
            tokenId: 1006,
            equipment: {
                name: "せんとくん",
                category: 'weapon',
                description: '装備すると仏感が増して後光がさす。しかし能力は低く後光以上の効果は期待できない',
                imageUri: 'https://www.pref.nara.jp/secure/125341/piisu_thumb.png',
                driving: ethers2wei('0.000001'), eco: ethers2wei('0.000001'), distance: ethers2wei('0.000001'), safe: ethers2wei('0.000001'), refuling: ethers2wei('0.000001')
            },
        },

    ];
    await mintinfos.reduce((promise, mintinfo) => {
        return promise.then(async () => {
            await driveContract.addLocation(
                mintinfo.location, mintinfo.tokenId
            )
            console.log(`add location ${mintinfo.location}->${mintinfo.tokenId}: done`)

        });
    }, Promise.resolve());
    await mintinfos.reduce((promise, mintinfo) => {
        return promise.then(async () => {
            const equipment = mintinfo.equipment;
            await erc1155contract.addEquipment(
                mintinfo.tokenId, [equipment.name, equipment.category, equipment.description, equipment.imageUri, equipment.driving, equipment.eco, equipment.distance, equipment.safe, equipment.refuling]
            )
            console.log(`add equpment ${mintinfo.tokenId}->${equipment.name}: done`)

        });
    }, Promise.resolve());
    console.log(`add location: done`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
