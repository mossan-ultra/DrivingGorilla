運転をより楽しくをテーマに設計されたドラゴリのコントラクトです。

# 主要概念

## 相棒ゴリ
 ユーザーは一人の相棒ゴリを所有することができます
 相棒ゴリはエアドロップで入手することができる。

## 経験値トークン
運転データをオンチェーン上に保存し、データに応じたトークンをミントします。このトークンは相棒ゴリの強さパラメータとなります
- tokenId1 = 運転時間に応じたトークン
- tokenId2 = エコドライブに応じたトークン
- tokenId3 = 運転距離に応じたトークン
- tokenId4 = 安全運転に応じたトークン
- tokenId5 = 給油回数に応じたトークン

## 装備NFT
特定地点を訪れるとERC1155NFTトークンがミントされます。メタ情報には経験値トークンが記載され、相棒ゴリの強さを上乗せすることができます。
相棒ゴリはtokenId=0で固定され、ウォレットアドレス毎にメタ情報を持つ。
メタ情報は名前、画像URLで構成される。

### 装備NFTをERC721のNFTに変換
装備NFT（ERC1155）をNFT721に変換することが出来ます。
これは、交換券への対応を想定していて、ERC6672にも対応しています。

## おきゴリ
任意の地点に分身のゴリラを置いてくることができる。
おきゴリはステーキング機能を有していて、作成時に経験値トークンのIDと量、ステーキング期間を指定するとステーキングができます。
（ステーキングに渡したトークンは相棒ゴリから引かれます）
ステーキング期間中には一定確率で脱獄し、脱獄してしまうとステーキングしたトークンはバーンされてしまいます。

## その他
- UX向上のためにアカウントアブストラクションに対応しています

# コントラクトの構成
- Drive：運転データを登録するコントラクト
- GoriDrop：エアドロップのコントロール
- GoriToken：経験値トークン、装備NFTのMint、管理
- GoriNFT：装備NFTの交換先ERC721のMint、管理
- GoriStaking：置きゴリのステーキングを管理

<img width="662" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/1950a279-1934-4bd0-93b5-056637c8b0f0">


# ビルド方法
```
npx hardhat compile
```

# デプロイ方法
デプロイに使用するエンドポイントの設定をscript/deploy.jsで行います。
Fujiにデプロイする場合
const chainType = thirdWeb;

zKatanaにデプロイする場合
const chainType = starTale;

```
node script/deploy.js
```

# セットアップ方法
## Fuji
```
node script/setup.js
```

## zKatana
```
node script/setup_zKatana.js
```

# シーケンス図
##  相棒入手
![Positive Gorilla](/contract/doc/goridrop.png) 

##  相棒初期化
![Positive Gorilla](/contract/doc/initgori.png) 

##  運転データ登録
![Positive Gorilla](/contract/doc/checkin.png) 

##  チェックイン
![Positive Gorilla](/contract/doc/checkin.png) 

##  おきゴリ作成
![Positive Gorilla](/contract/doc/makeStayGori.png) 

##  おきゴリ完了
![Positive Gorilla](/contract/doc/completeStayGori.png) 

