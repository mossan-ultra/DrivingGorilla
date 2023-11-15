/*
.env
THIRDWEB_CLIENT_ID=xxxx
THIRDWEB_SECRET_KEY=xxxx
PRIVATE_KEY=xxxx

*/
require("dotenv").config();
const { ethers, ContractFactory, Wallet } = require("ethers");
const fs = require('fs');
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { AvalancheFuji } = require("@thirdweb-dev/chains");

const starTale = 0;
const thirdWeb = 1;

const chainType = starTale;

const airDropContractAddress = "0x4DEbA5fBb9da5085e2141e18f011B28DF7aC49d2";

async function main() {
    const Gori = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriToken.sol/GoriToken.json', 'utf8'));
    const DriveApp = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/Drive.sol/Drive.json', 'utf8'));
    const GoriDrop = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriDrop.sol/GoriDrop.json', 'utf8'));
    const GoriNFT = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriNFT.sol/GoriNFT.json', 'utf8'));
    const GoriStaking = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriStaking.sol/GoriStaking.json', 'utf8'));
    let provider;

    if (chainType === thirdWeb) {
        const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, AvalancheFuji, {
            clientId: `${process.env.THIRDWEB_CLIENT_ID}`, // Use client id if using on the client side, get it from dashboard settings
            secretKey: `${process.env.THIRDWEB_SECRET_KEY}`, // Use secret key if using on the server, get it from dashboard settings
        })
        provider = sdk.provider;
    } else if (chainType === starTale) {
        const connection = {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        }

        //APIキー使えない…
        // provider = new ethers.providers.JsonRpcProvider(`https://rpc.startale.com/zkatana/?apiKey=${process.env.ASTAR_API_KEY}`)
        provider = new ethers.providers.JsonRpcProvider(`https://rpc.startale.com/zkatana/`)

    }

    const signer = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        provider
    );
    const address = await signer.getAddress();

    const driveAppFactory = new ContractFactory(DriveApp.abi, DriveApp.bytecode, signer);
    const goriFactory = new ContractFactory(Gori.abi, Gori.bytecode, signer);
    const goriDropFactory = new ContractFactory(GoriDrop.abi, GoriDrop.bytecode, signer);
    const goriStakingFactory = new ContractFactory(GoriStaking.abi, GoriStaking.bytecode, signer);
    const goriNFTFactory = new ContractFactory(GoriNFT.abi, GoriNFT.bytecode, signer);


    const driveContract = await driveAppFactory.deploy(await signer.getAddress());
    await driveContract.deployed()


    console.log('DRIVE_CONTRACT_ADDRESS=', driveContract.address);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
