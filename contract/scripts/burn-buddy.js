
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

const KEY = "ca069a5c1b3946fcfe86a69b387c54503e74625000ea9b2a2cbc94e8d473711e";
const GORI_OWNER = "0x6e3D7bEA9A5eEb1b7e9f6A0E9a95e4636654e289"
async function main() {
    const GoriToken = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriToken.sol/GoriToken.json', 'utf8'));
    const Drive = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/Drive.sol/Drive.json', 'utf8'));
    const GoriDrop = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriDrop.sol/GoriDrop.json', 'utf8'));
    const GoriStaking = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriStaking.sol/GoriStaking.json', 'utf8'));
    const GoriNFT = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriNFT.sol/GoriNFT.json', 'utf8'));
    const provider = new ethers.providers.JsonRpcProvider(`https://rpc.startale.com/zkatana/`)
    const signer = new ethers.Wallet(
        KEY,
        provider
    );

    const from = await signer.getAddress();
    console.log(`from=${from}`)

    console.log(process.env.ERC1155_CONTRACT_ADDRESS)
    const erc1155contract = new ethers.Contract(process.env.ERC1155_CONTRACT_ADDRESS, GoriToken.abi, signer);
    const driveContract = new ethers.Contract(process.env.DRIVE_CONTRACT_ADDRESS, Drive.abi, signer);
    const goriDropContract = new ethers.Contract(process.env.AIRDROP_CONTRACT_ADDRESS, GoriDrop.abi, signer);
    const goriStakingContract = new ethers.Contract(process.env.STAKING_CONTRACT_ADDRESS, GoriStaking.abi, signer);
    const goriNFTContract = new ethers.Contract(process.env.GORINFT_CONTRACT_ADDRESS, GoriNFT.abi, signer);

    const balance = await erc1155contract.balanceOf(
        from, 0
    )
    console.log(`balanse = ${balance}`)
    const ownerBalance = await erc1155contract.balanceOf(
        GORI_OWNER, 0
    )
    console.log(`owner balanse = ${ownerBalance}`)

    if (balance > 0) {
        console.log('now burn')

        await erc1155contract.burn(
            from, 0, balance
        )
        console.log('burn')

    }

    const contents = [[
        from, 0, 1
    ]];

    console.log('now drop!!')
    await goriDropContract.goridrop(
        from, process.env.ERC1155_CONTRACT_ADDRESS, GORI_OWNER, contents
    )
    console.log('air drop')
    await erc1155contract.initializeGori(
        from, 'inputName', (new Date()).toDateString(), "https://ipfs.io/ipfs/bafybeiedu2fk3bb4oucoeuibtkvdku2nby4zzrxzvnzmpytfr7fbothwdy/buddy.gif"
    )
    console.log('initializeGori')

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
