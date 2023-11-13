const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { network } = require('hardhat');

const TokenIdPartnerGori = 0; //相棒ゴリ
const TokenIdDrivingTime = 1; //運転時間
const TokenIdEcoDrive = 2; //エコドライブ
const TokenIdDrivingDistance = 3; //運転距離
const TokenIdSafeDrive = 4; //安全運転
const TokenIdRefueling = 5; //給油


describe("GoriToken", function () {
    async function goriDeploy() {        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const GoriFactory = await ethers.getContractFactory("GoriToken");
        const DriveFactory = await ethers.getContractFactory("Drive");
        const GoriStakingFactory = await ethers.getContractFactory("GoriStaking");
        const GoriNFTFactory = await ethers.getContractFactory("GoriNFT");
        const gori = await GoriFactory.deploy(owner.address, 'Gori', 'GM', owner.address, 100);
        await gori.deployed();
        const drive = await DriveFactory.deploy(gori.address);
        await drive.deployed();
        const goriStaking = await GoriStakingFactory.deploy(1000, owner.address, 1, 1500, gori.address);
        await goriStaking.deployed();
        const goriNFT = await GoriNFTFactory.deploy();
        await goriNFT.deployed();

        await drive.addLocation(200, 1000);
        await drive.addLocation(100, 1001);
        await drive.addLocation(50, 1002);
        await drive.addLocation(30, 1003);
        // await drive.addLocation(0, 1);
        await gori.setGoriStaking(goriStaking.address);
        await goriStaking.changeStakingToken(gori.address);
        await gori.setGoriNFT(goriNFT.address);
        await goriNFT.addMinter(gori.address);

        return { gori, drive, goriStaking, owner, otherAccount, goriNFT };
    }
    describe("Deployment", function () {
        it("deploy", async function () {
            await expect(loadFixture(goriDeploy)).not.to.be.reverted;
        });
    });
    // describe("balanceOf", function () {
    //     it("オーナーはHPを1持っていること", async function () {
    //         const { gori, owner, otherAccount } = await loadFixture(goriDeploy);
    //         expect(await gori.connect(owner).balanceOf(owner.address, 0)).to.be.equal(1)
    //     });
    // });
    describe("mint", function () {
        it("mintが成功すること", async function () {
            const { gori, owner, otherAccount } = await loadFixture(goriDeploy);
            await gori.connect(owner).mint(otherAccount.address, TokenIdDrivingTime, 1);
            await gori.connect(owner).mint(otherAccount.address, TokenIdEcoDrive, 2);
            await gori.connect(owner).mint(otherAccount.address, TokenIdDrivingDistance, 3);
            await gori.connect(owner).mint(otherAccount.address, TokenIdSafeDrive, 4);
            await gori.connect(owner).mint(otherAccount.address, TokenIdRefueling, 5);

            expect(await gori.connect(owner).balanceOf(otherAccount.address, TokenIdDrivingTime)).to.be.equal(1);
            expect(await gori.connect(owner).balanceOf(otherAccount.address, TokenIdEcoDrive)).to.be.equal(2);
            expect(await gori.connect(owner).balanceOf(otherAccount.address, TokenIdDrivingDistance)).to.be.equal(3);
            expect(await gori.connect(owner).balanceOf(otherAccount.address, TokenIdSafeDrive)).to.be.equal(4);
            expect(await gori.connect(owner).balanceOf(otherAccount.address, TokenIdRefueling)).to.be.equal(5);
        });
    });
    describe("相棒ゴリ", function () {
        function base64Decode(text, charset) {
            return fetch(text).then(response => response.text());
        }

        it("initializeできること", async function () {
            const { gori, owner, otherAccount } = await loadFixture(goriDeploy);
            let meta;
            // 相棒ゴリをミントする
            await gori.connect(owner).mint(otherAccount.address, TokenIdPartnerGori, 10);

            // ユーザーウォレットで初期化、名前変更、ImageUri変更できること
            await gori.connect(otherAccount).initializeGori('gorigori', '2023/10/10', 'https://test/test.jpg');
            meta = JSON.parse(await base64Decode(await gori.connect(otherAccount).uri(TokenIdPartnerGori)));
            expect(meta.name).to.be.equal('gorigori');
            expect(meta.createdAt).to.be.equal('2023/10/10');
            expect(meta.image).to.be.equal('https://test/test.jpg');

            await gori.connect(otherAccount).updatePartnerGoriImageUri('https://test/test.png');
            meta = JSON.parse(await base64Decode(await gori.connect(otherAccount).uri(TokenIdPartnerGori)));
            expect(meta.image).to.be.equal('https://test/test.png');
            expect(meta.image).to.be.equal('https://test/test.png');

            await gori.connect(otherAccount).updatePartnerGoriName('gorigori2');
            meta = JSON.parse(await base64Decode(await gori.connect(otherAccount).uri(TokenIdPartnerGori)));
            expect(meta.name).to.be.equal('gorigori2');
        });
    });
    describe("エコ運転", function () {
        it("エコ運転レベルが一定以上でミントされる", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(61, 0, 0, 0, 0, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 2);
            expect(balance).to.be.equal(ethers.utils.parseEther('1')
            );

        });
        it("エコ運転レベルが一定以下はミントされない", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(60, 0, 0, 0, 0, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 2);
            expect(balance).to.be.equal(ethers.utils.parseEther('0')
            );

        });
    });

    describe("安全運転", function () {
        it("安全運転レベルが一定以上でミントされる", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 71, 0, 0, 0, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 4);
            expect(balance).to.be.equal(ethers.utils.parseEther('1')
            );

        });
        it("安全運転レベルが一定以下はミントされない", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 70, 0, 0, 0, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 4);
            expect(balance).to.be.equal(ethers.utils.parseEther('0')
            );

        });
    });

    describe("運転時間", function () {
        it("運転時間が一定以上でミントされる", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 0, 0, 0, 101, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 1);
            expect(balance).to.be.equal(ethers.utils.parseEther('1')
            );

        });
        it("運転時間が一定以下はミントされない", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 0, 0, 0, 100, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 1);
            expect(balance).to.be.equal(ethers.utils.parseEther('0')
            );
        });
    });
    describe("運転距離", function () {
        it("運転距離が一定以上でミントされる", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 0, 0, 101, 0, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 3);
            expect(balance).to.be.equal(ethers.utils.parseEther('1')
            );
        });
        it("運転距離が一定以下はミントされない", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 0, 0, 100, 0, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 3);
            expect(balance).to.be.equal(ethers.utils.parseEther('0')
            );
        });
    });
    describe("給油回数", function () {
        it("給油回数に応じてミントされる", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 0, 3, 0, 0, [0]);
            const balance = await gori.balanceOf(otherAccount.address, 5);
            expect(balance).to.be.equal(ethers.utils.parseEther('3')
            );
        });
    });
    describe("ご当地NFT", function () {
        it("ミントされること", async function () {
            const { gori, drive, owner, otherAccount } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 0, 0, 0, 0, [100]);
            const balance = await gori.balanceOf(otherAccount.address, 1001);
            expect(balance).to.be.equal(1);
        });
        it("ERC721に変換できる", async function () {
            const { gori, drive, owner, otherAccount, goriNFT } = await loadFixture(goriDeploy);
            await drive.connect(otherAccount).drivedata(0, 0, 0, 0, 0, [100, 200]);
            let balance = await gori.balanceOf(otherAccount.address, 1001);
            expect(balance).to.be.equal(1);
            balance = await gori.balanceOf(otherAccount.address, 1000);
            expect(balance).to.be.equal(1);

            await expect(gori.connect(otherAccount).toERC721(1001)).not.to.reverted;
            let tokenId0Owner = await goriNFT.ownerOf(0);
            expect(tokenId0Owner).to.be.equal(otherAccount.address);

            await expect(gori.connect(otherAccount).toERC721(1000)).not.to.reverted;
            tokenId0Owner = await goriNFT.ownerOf(1);
            expect(tokenId0Owner).to.be.equal(otherAccount.address);

            const nftAmount = await goriNFT.balanceOf(otherAccount.address);
            expect(nftAmount).to.be.equal(2);

            // burnされたことの確認
            balance = await gori.balanceOf(otherAccount.address, 1001);
            expect(balance).to.be.equal(0);
            balance = await gori.balanceOf(otherAccount.address, 1000);
            expect(balance).to.be.equal(0);


        });

    });
    describe("ゴリラステーキング", function () {
        // let _gori, _drive, _goriStaking, _owner, _otherAccount;
        // before(async () => {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
        //     _gori = gori;
        //     _drive = drive;
        //     _owner = owner;
        //     _otherAccount = otherAccount;
        //     _goriStaking = goriStaking;
        //     console.log('deployed')
        // });
        // it("残高不足であればステーキングできない", async function () {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);

        //     const mintAmount = 10;
        //     console.log(mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 1, mintAmount - 1);
        //     await gori.connect(owner).mint(otherAccount.address, 2, mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 3, mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 4, mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 5, mintAmount);
        //     await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
        //     await expect(
        //         goriStaking.connect(otherAccount).multiStake(1000, [1, 2, 3, 4, 5], [mintAmount, mintAmount, mintAmount, mintAmount, mintAmount], 10000)
        //     ).to.be.reverted;

        // });
        // it("ステーキング済みの座標には再度ステーキングできない", async function () {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
        //     const mintAmount = 10;
        //     console.log(mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 1, mintAmount);
        //     await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
        //     await expect(
        //         goriStaking.connect(otherAccount).multiStake(1000, [1], [mintAmount], 10000)
        //     ).not.to.be.reverted;
        //     await expect(
        //         goriStaking.connect(otherAccount).multiStake(1000, [1], [mintAmount], 10000)
        //     ).to.be.reverted;

        // });

        // it("ステーキングができる", async function () {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
        //     const latestBlock = await hre.ethers.provider.getBlock("latest")

        //     const mintAmount = ethers.utils.parseEther('1');
        //     await gori.connect(owner).mint(otherAccount.address, 1, mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 2, mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 3, mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 4, mintAmount);
        //     await gori.connect(owner).mint(otherAccount.address, 5, mintAmount);
        //     await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
        //     await goriStaking.connect(otherAccount).multiStake(1000, [1, 2, 3, 4, 5], [mintAmount, mintAmount, mintAmount, mintAmount, mintAmount], 1500000)
        //     const balance1 = await gori.balanceOf(otherAccount.address, 1);
        //     const balance2 = await gori.balanceOf(otherAccount.address, 2);
        //     const balance3 = await gori.balanceOf(otherAccount.address, 3);
        //     const balance4 = await gori.balanceOf(otherAccount.address, 4);
        //     const balance5 = await gori.balanceOf(otherAccount.address, 5);

        //     // トークンが転送されていることの確認
        //     expect(balance1).to.be.equal(0)
        //     expect(balance2).to.be.equal(0)
        //     expect(balance3).to.be.equal(0)
        //     expect(balance4).to.be.equal(0)
        //     expect(balance5).to.be.equal(0)

        // });
        // it("報酬を計算できる", async function () {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
        //     const latestBlock = await hre.ethers.provider.getBlock("latest")

        //     const mintAmount = ethers.utils.parseEther('1');
        //     await gori.connect(owner).mint(otherAccount.address, 1, mintAmount);
        //     await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
        //     await goriStaking.connect(otherAccount).multiStake(1000, [1], [mintAmount], 1800000)
        //     const balance1 = await gori.balanceOf(otherAccount.address, 1);

        //     console.log(await goriStaking.connect(otherAccount).getRewardTokenBalance(1000, 1))

        //     // トークンが転送されていることの確認
        //     // expect(balance1).to.be.equal(0)
        //     // expect(balance2).to.be.equal(0)
        //     // expect(balance3).to.be.equal(0)
        //     // expect(balance4).to.be.equal(0)
        //     // expect(balance5).to.be.equal(0)

        // });
        // it("ステーキング終了タイミングを取得できる", async function () {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
        //     const latestBlock = await hre.ethers.provider.getBlock("latest")

        //     const mintAmount = ethers.utils.parseEther('1');
        //     await gori.connect(owner).mint(otherAccount.address, 1, mintAmount);
        //     await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
        //     await goriStaking.connect(otherAccount).multiStake(1000, [1], [mintAmount], 1800000)
        //     const balance1 = await gori.balanceOf(otherAccount.address, 1);

        //     console.log(await goriStaking.connect(otherAccount).getStatkingFinishBlock(1000, 1))

        //     // トークンが転送されていることの確認
        //     // expect(balance1).to.be.equal(0)
        //     // expect(balance2).to.be.equal(0)
        //     // expect(balance3).to.be.equal(0)
        //     // expect(balance4).to.be.equal(0)
        //     // expect(balance5).to.be.equal(0)

        // });
        // it("ステーキング報酬を獲得できる", async function () {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
        //     const latestBlock = await hre.ethers.provider.getBlock("latest")

        //     //ステーキング報酬用に大量にミントしておく
        //     const stakingRewordToken = ethers.utils.parseEther('100');
        //     await gori.connect(owner).mint(goriStaking.address, 1, stakingRewordToken);

        //     const mintAmount = ethers.utils.parseEther('1');
        //     await gori.connect(owner).mint(otherAccount.address, 1, mintAmount);
        //     await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
        //     await goriStaking.connect(otherAccount).multiStake(1000, [1], [mintAmount], 1800000)
        //     await network.provider.send("hardhat_mine", ["0x16e360"]);
        //     await goriStaking.connect(otherAccount).claimRewards(1000, 1)

        //     console.log(await goriStaking.connect(otherAccount).getStatkingFinishBlock(1000, 1))

        //     // トークンが転送されていることの確認
        //     // expect(balance1).to.be.equal(0)
        //     // expect(balance2).to.be.equal(0)
        //     // expect(balance3).to.be.equal(0)
        //     // expect(balance4).to.be.equal(0)
        //     // expect(balance5).to.be.equal(0)

        // });
        // it("完了判定", async function () {
        //     const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
        //     const latestBlock = await hre.ethers.provider.getBlock("latest")

        //     //ステーキング報酬用に大量にミントしておく
        //     const stakingRewordToken = ethers.utils.parseEther('100');
        //     await gori.connect(owner).mint(goriStaking.address, 1, stakingRewordToken);

        //     const mintAmount = ethers.utils.parseEther('1');
        //     await gori.connect(owner).mint(otherAccount.address, 1, mintAmount);
        //     await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
        //     await goriStaking.connect(otherAccount).multiStake(1000, [1], [mintAmount], 0x10)

        //     let isComplete;
        //     await network.provider.send("hardhat_mine", ["0xf"]);
        //     isComplete = await goriStaking.connect(otherAccount).isComplete(1000);
        //     expect(isComplete).to.be.equal(false)

        //     await network.provider.send("hardhat_mine", ["0x1"]);
        //     isComplete = await goriStaking.connect(otherAccount).isComplete(1000);
        //     expect(isComplete).to.be.equal(true)

        //     // トークンが転送されていることの確認
        //     // expect(balance1).to.be.equal(0)
        //     // expect(balance2).to.be.equal(0)
        //     // expect(balance3).to.be.equal(0)
        //     // expect(balance4).to.be.equal(0)
        //     // expect(balance5).to.be.equal(0)

        // });
        it("おきゴリを作ることができる", async function () {
            const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
            const latestBlock = await hre.ethers.provider.getBlock("latest")
            const location = 100;
            const tokenId = 5001;
            //ステーキング報酬用に大量にミントしておく
            const stakingRewordToken = ethers.utils.parseEther('100');
            await gori.connect(owner).mint(goriStaking.address, 2, stakingRewordToken);

            // ステーキング用のトークンを持たせておく
            const mintAmount = ethers.utils.parseEther('1');
            await gori.connect(owner).mint(otherAccount.address, 2, mintAmount);
            await gori.connect(owner).mint(owner.address, 2, mintAmount);
            await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
            await gori.connect(owner).setApprovalForAll(goriStaking.address, true);

            // おきゴリ作成
            const filter = gori.filters.StayGoriMinted(null, null, null, null, null, null, null);
            const msgCatch = (_from, _msg) => {
                console.log("from: ", _from);
                console.log("message: ", _msg);
            };

            gori.on(filter, msgCatch);

            // await gori.connect(otherAccount).makeStayGori(location, "aaaaa", [2], [1000], 10)
            await (gori.connect(otherAccount).makeStayGori(location, "aaaaa", [2], [1000], 10))
            // //作った時点では脱走していないこと
            // const isEscape = await gori.connect(otherAccount).isEscape(location)
            // expect(isEscape).to.be.equal(false)

            // ステーキングトークンが不足している場合はエラー
            await expect(gori.connect(otherAccount).makeStayGori(location + 1, "aaaaa", [3], [1], 10)
            ).to.be.reverted;
            // おきゴリを存在する同一地点には作成できないこと
            // await expect(gori.connect(otherAccount).makeStayGori(location, "aaaaa", [2], [1000], 10)
            // ).to.be.reverted;
            // // 同一地点でも異なるstakerであればおきゴリできる
            await expect(gori.connect(owner).makeStayGori(tokenId, "aaaaa", [2], [1000], 10)
            ).not.to.be.reverted;
            // ステーキングしているトークン量を取得できる
            const depositAmount = await gori.connect(otherAccount).getStayGoriDepositToken(tokenId);
            expect(depositAmount[0][0]).to.be.equal(2)
            expect(depositAmount[1][0]).to.be.equal(1000)

            // console.log(depositAmount)
            // 作成時点では未完了状態
            let isComplete = await gori.connect(otherAccount).isStayGoriComplete(tokenId);
            expect(isComplete).to.be.equal(false)

            // // ステーキング期間を完了させる
            await network.provider.send("hardhat_mine", ["0xa"]);

            // 完了したこと
            isComplete = await gori.connect(otherAccount).isStayGoriComplete(tokenId);
            expect(isComplete).to.be.equal(true)
            // 完了処理が失敗しないこと
            await expect(gori.connect(otherAccount).completeStayGori(tokenId)
            ).not.to.be.reverted;
        });
        it("脱獄ゴリのテスト", async function () {
            const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
            const latestBlock = await hre.ethers.provider.getBlock("latest")
            const location = 100;
            const tokenId = 5001;
            const stakingAmount = ethers.utils.parseEther('0.9');
            //ステーキング報酬用に大量にミントしておく
            const stakingRewordToken = ethers.utils.parseEther('100');
            await gori.connect(owner).mint(goriStaking.address, 2, stakingRewordToken);

            // ステーキング用のトークンを持たせておく
            const mintAmount = ethers.utils.parseEther('1');
            await gori.connect(owner).mint(otherAccount.address, 2, mintAmount);
            await gori.connect(owner).mint(owner.address, 2, mintAmount);
            await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
            await gori.connect(owner).setApprovalForAll(goriStaking.address, true);

            // おきゴリ作成
            await gori.connect(otherAccount).makeStayGori(location, "aaaaa", [2], [stakingAmount], 10)
            // トークンが減っていること
            const balanceOf = await gori.connect(otherAccount).balanceOf(otherAccount.address, 2);
            const amount = ethers.utils.parseEther('0.1');
            expect(balanceOf).to.be.equal(amount)
            // ステーキング期間を完了させる

            await network.provider.send("hardhat_mine", ["0xa"]);

            // 完了したこと
            isComplete = await gori.connect(otherAccount).isStayGoriComplete(tokenId);
            expect(isComplete).to.be.equal(true)
            // 脱獄したこと
            isEscape = await gori.connect(otherAccount).getEscape(tokenId);
            expect(isEscape[0]).to.be.equal(true)
            // 完了処理が失敗しないこと
            await expect(gori.connect(otherAccount).completeStayGori(tokenId)
            ).not.to.be.reverted;

            // 脱獄後にコンプリートさせると当該座標から存在しなくなり再度おきゴリを作れる
            await gori.connect(otherAccount).makeStayGori(location, "aaaaa", [2], [1000], 10)

        });
        it("ステーキング報酬の獲得テスト", async function () {
            const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
            const latestBlock = await hre.ethers.provider.getBlock("latest")
            const location = 100;
            const tokenId = 5001;
            const tokenIds = [2, 3, 4];
            //ステーキング報酬用に大量にミントしておく
            const stakingRewordToken = ethers.utils.parseEther('100');
            await gori.connect(owner).mint(goriStaking.address, 2, stakingRewordToken);
            await gori.connect(owner).mint(goriStaking.address, 3, stakingRewordToken);
            await gori.connect(owner).mint(goriStaking.address, 4, stakingRewordToken);

            // ステーキング用のトークンを持たせておく
            const mintAmount = ethers.utils.parseEther('5');
            await gori.connect(owner).mint(otherAccount.address, 2, mintAmount);
            await gori.connect(owner).mint(otherAccount.address, 3, mintAmount);
            await gori.connect(owner).mint(otherAccount.address, 4, mintAmount);
            await gori.connect(owner).mint(owner.address, 2, mintAmount);
            await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);
            await gori.connect(owner).setApprovalForAll(goriStaking.address, true);

            // 脱獄しないブロックに移動する
            await network.provider.send("hardhat_mine", ["0x5"]);

            // おきゴリ作成
            await gori.connect(otherAccount).makeStayGori(location, "aaaaa", tokenIds,
                [ethers.utils.parseEther('1'), ethers.utils.parseEther('0.4'), ethers.utils.parseEther('3')], 0xFFFF)

            const isResisterd = await gori.connect(otherAccount).isRegistered(tokenId);
            expect(isResisterd).to.be.equal(true)

            // ステーキング期間を完了させる
            await network.provider.send("hardhat_mine", ["0xFFFF"]);

            // 完了したこと
            isComplete = await gori.connect(otherAccount).isStayGoriComplete(tokenId);
            expect(isComplete).to.be.equal(true)
            // 脱獄したこと
            isEscape = await gori.connect(otherAccount).getEscape(tokenId);
            expect(isEscape[0]).to.be.equal(false)
            // 完了処理が失敗しないこと
            await expect(gori.connect(otherAccount).completeStayGori(tokenId)
            ).not.to.be.reverted;
            //トークンが増えていること
            for (let i = 0; i < tokenIds.length; i++) {
                const balanceOf = await gori.connect(otherAccount).balanceOf(otherAccount.address, tokenIds[i]);
                let etherString = ethers.utils.formatEther(balanceOf)
                console.log(`after staking tokenId:${tokenIds[i]} amount:${etherString}`)
            }
            // 脱獄後にコンプリートさせると当該座標から存在しなくなり再度おきゴリを作れる
            // await gori.connect(otherAccount).makeStayGori(location, "aaaaa", [2], [1000], 10)

        });

        xit("脱走できるかテストする", async function () {
            const { gori, drive, goriStaking, owner, otherAccount } = await loadFixture(goriDeploy);
            const latestBlock = await hre.ethers.provider.getBlock("latest")

            const mintAmount = ethers.utils.parseEther('1');
            await gori.connect(otherAccount).setApprovalForAll(goriStaking.address, true);

            let escapeCount = 0;
            let testCount = 0;
            let isEscape;

            for (i = 0; i < 10; i++) {
                const tokenId = 1000 + i;
                await gori.connect(owner).mint(otherAccount.address, tokenId, mintAmount);
                await goriStaking.connect(otherAccount).multiStake(tokenId, [tokenId], [100], 300000,)
                await network.provider.send("hardhat_mine", ["0x16e360"]);
                isEscape = await goriStaking.connect(otherAccount).isEscape(tokenId);
                console.log('isEscape', isEscape)
                if (isEscape) {
                    escapeCount++;
                }
                testCount++;
            }
            console.log(`testCount=${testCount} ,escapeCount=${escapeCount}`)
        });

    });

});