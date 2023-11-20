# DrivingGorilla

## Overview

<p>「自分だけの相棒ゴリラと冒険（ドライブ）に出かけよう！」</p> 
<p>相棒ゴリラはドライブ内容に応じて手に入るTokenで成長し、プレイヤーの相棒ゴリラ同士でバトルをしたりランキングを競い合える</p>

![DrivingGorilla_overview_image](/doc/DrivingGorilla_overview_image.png)
![DrivingGorilla_overview_ScreenShot](/doc/DrivingGorilla_overview_ScreenShot.png)

## Requirements

- チェーンはzKatanaを採用
- UX向上を目的にweb3Authでの認証可能とし、AAに対応
- 運転データをオンチェーン上に保存し、データに応じた経験値トークンをmint
mint条件=安全運転、エコドライブ、運転時間、運転距離、給油回数
- 自分だけの相棒ゴリラNFTアートを貰える
- ChatGPTを搭載した相棒ゴリラと音声対話チャットで繋がりのある会話のキャッチボールが可能
- 地図上に相棒ゴリラの分身を置きゴリとして配置可能
- 置きゴリにはステーキング機能を実装（但し、一定確率で脱獄し消滅）
- 特定のスポットにチェックインすることでご当地装備NFTを入手する事ができる
- 経験値トークンと装備NFTで相棒ゴリラが強くなる

## Things to install in advance

Please install the following tools in advance.<br>
- [node(v18 LTS)](https://nodejs.org/en/download)<br>
- [git](https://git-scm.com/downloads)<br>

## Getting Started

#### Contractをデプロイします

[ContractのREADME](/contract/README.md)を参照してContractをデプロイします

#### 環境変数を設定します

.env.localファイルを作成し以下の環境変数を設定します
```bash
NEXT_PUBLIC_GOOGLE_MAP_APIKEY={Google Map APIキー}
NEXT_PUBLIC_OPENAI_API_KEY={Azure OpenAI APIキー}
NEXT_PUBLIC_OPENAI_API_VERSION={Azure OpenAI APIバージョン}2023-08-01-preview
NEXT_PUBLIC_OPENAI_RESOURCE={Azure OpenAI リソース名}poc-gorimelo-oai
NEXT_PUBLIC_OPENAI_DEPLOYMENT={Azure OpenAI モデルデプロイ名}gorimelo-chatbot16k-poc
NEXT_PUBLIC_SPEECH_SDK_KEY={Azure AI Speech SDKキー}
NEXT_PUBLIC_SPEECHSDK_REGION={Azure AI Speech SDKリージョン}eastus
NEXT_PUBLIC_TEXT_ANALYSIS_KEY={Azure AI TextAnalysisキー}
NEXT_PUBLIC_TEXT_ANALYSIS_ENDPOINT=https://{Azure AI TextAnalysisリソース名}.cognitiveservices.azure.com/
NEXT_PUBLIC_GELATO_RELAY_API_KEY={Gelato　Relay APIキー}
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID={Web3Auth Client　ID}
```

#### 環境変数の説明

##### Google Map APIキーを準備します

ドライブマップを利用するにはGoogle MapのAPIキーが必要です。<br>
[Maps JavaScript API](https://developers.google.com/maps/documentation/javascript?hl=ja)の手順に沿ってGoogle MapのAPIキーを準備します。<br>
※Maps JavaScript API のご利用にあたっては、請求先アカウントと Maps JavaScript API が有効なプロジェクトが必要です。
詳しくは、[Cloud コンソール](https://developers.google.com/maps/documentation/javascript/cloud-setup?hl=ja)での設定をご覧ください。

##### Gelato　APIキーを準備します

[Gelato Network Relay](https://docs.gelato.network/developer-services/relay)

##### Gelato　Relay APIキーを準備します

[Gelato Network Relay](https://docs.gelato.network/developer-services/relay)

##### Web3Auth Client　IDを準備します

[Web3Auth Quick Start](https://web3auth.io/docs/quick-start?product=Plug+and+Play&sdk=Plug+and+Play+Web+Modal+SDK&platform=React)

##### Azure　Subscriptionを準備します

[Azure の無料アカウントを使ってクラウドで構築](https://azure.microsoft.com/ja-jp/free/)から無料のAzureアカウントを作成して有効なSubscriptionを準備します。
Azureを開始するにはMicrosoftのアカウントが必要です。<br>
まだ作成していない場合は[アカウントの作成](https://signup.live.com/signup?)よりアカウントを作成します。

##### Azure Open AIのリソースを準備します

[Azure OpenAI Service](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/how-to/create-resource?pivots=web-portal) のリソースを作成してデプロイする<br>
※2023/11/25現在 Azure OpenAI サービスは[登録](https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7en2Ais5pxKtso_Pz4b1_xUNTZBNzRKNlVQSFhZMU9aV09EVzYxWFdORCQlQCN0PWcu)が必要で、現在は承認された企業顧客およびパートナーのみが利用できます。<br>
※個人メールアドレス（Example: @gmail.com, @yahoo.com, @hotmail.com, etc.）での申請は拒否されるようです。詳しくは[コチラ](https://learn.microsoft.com/ja-jp/legal/cognitive-services/openai/limited-access?context=%2Fazure%2Fcognitive-services%2Fopenai%2Fcontext%2Fcontext)をご確認ください。

- [Azure OpenAI Studio](https://oai.azure.com/portal/)

##### 続いて作成したAzure OpenAIリソースの展開の管理からモデルをデプロイします

※ここで設定したモデルのデプロイ名は「Azure Open AIのリソースの情報」として後で使用します<br>
準備した「Azure Open AIのリソースの情報」を.env.localファイルの所定のキー値とします

```bash
NEXT_PUBLIC_OPENAI_API_KEY={Azure OpenAI APIキー}
NEXT_PUBLIC_OPENAI_API_VERSION={Azure OpenAI APIバージョン}
NEXT_PUBLIC_OPENAI_RESOURCE={Azure OpenAI リソース名}
NEXT_PUBLIC_OPENAI_DEPLOYMENT={Azure OpenAI モデルデプロイ名}
```
[公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/reference)の「サポートされているバージョン」の日付部分（例：2023-08-01-preview）をバージョン情報として使います<br>

##### Azure AI Speech Serviceのリソースを準備します

[Azure AI Speech Serviceとは](https://learn.microsoft.com/ja-jp/azure/ai-services/speech-service/speech-studio-overview)<br>
- [Azure AI Speech Studio](https://speech.microsoft.com/portal?)

準備した「音声サービスのリソースの情報」を.env.localファイルの所定のキー値とします<br>

```bash
NEXT_PUBLIC_SPEECH_SDK_KEY={Azure AI Speech SDKキー}
NEXT_PUBLIC_SPEECHSDK_REGION={Azure AI Speech SDKリージョン}
```

##### Azure AI Language Serviceのリソースを準備します

[Azure AI Language Serviceとは](https://learn.microsoft.com/ja-jp/azure/ai-services/language-service/language-studiobr)<br>

- [Azure AI Language Studio](https://language.cognitive.azure.com/home)

準備した「言語サービスのリソースの情報」を.env.localファイルの所定のキー値とします<br>

```bash
NEXT_PUBLIC_TEXT_ANALYSIS_KEY={Azure AI TextAnalysisキー}
NEXT_PUBLIC_TEXT_ANALYSIS_ENDPOINT=https://{Azure AI TextAnalysisリソース名}.cognitiveservices.azure.com/
```

## Quickstart

Githubより本アプリのgitリポジトリをcloneします
```bash
git clone git@github.com:mossan-ultra/DrivingGorilla.git
```

カレントディレクトを./frontに変更してアプリを開始します
```bash
cd ./front
npx run build
npx next dev
```

コンソールのURLをクリックするかブラウザのアドレス欄に以下を貼り付けて実行します
```
http://localhost:3000
```

## 機能一覧

## 使い方の説明

## next.js

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
