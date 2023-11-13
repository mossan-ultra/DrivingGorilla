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

async function main() {
    const GoriToken = JSON.parse(fs.readFileSync('./artifacts-zk/contracts/GoriToken.sol/GoriToken.json', 'utf8'));
    const sdk = ThirdwebSDK.fromPrivateKey("ca069a5c1b3946fcfe86a69b387c54503e74625000ea9b2a2cbc94e8d473711e", AvalancheFuji, {
        clientId: `${process.env.THIRDWEB_CLIENT_ID}`, // Use client id if using on the client side, get it from dashboard settings
        secretKey: `${process.env.THIRDWEB_SECRET_KEY}`, // Use secret key if using on the server, get it from dashboard settings
    });

    const from = await sdk.wallet.getAddress();

    const contract = await sdk.getContract(process.env.ERC1155_CONTRACT_ADDRESS, GoriToken.abi);

    const partnerBalanceOf = await contract.call(
        "balanceOf",
        [
            "0xcf033F4039c14246927919f133B6fF02A490d445", 0
        ],
    );
    const json = await contract.call(
        "uri",
        [
            0
        ],
    );

    console.log(partnerBalanceOf)
    console.log(json)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
