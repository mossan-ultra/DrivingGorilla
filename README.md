# DrivingGorilla

![DrivingGorilla_overview_image](/doc/DrivingGorilla_overview_image.png)

# System Architecture
<img width="651" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/b03e847e-11f2-46e6-b8ed-26739b4bf919">

# Overview

<p>「自分だけの相棒ゴリラと冒険（ドライブ）に出かけよう！」</p> 
<p>相棒ゴリラはドライブ内容に応じて手に入るTokenで成長し、プレイヤーの相棒ゴリラ同士でバトルをしたりランキングを競い合える</p>

![DrivingGorilla_overview_ScreenShot](/doc/DrivingGorilla_overview_ScreenShot.png)

# Requirements

- チェーンはzKatanaを採用
- UX向上を目的にweb3Authでの認証可能とし、AAに対応
- 運転データをオンチェーン上に保存し、データに応じた経験値トークンをmint<br>
mint条件=安全運転、エコドライブ、運転時間、運転距離、給油回数
- 自分だけの相棒ゴリラ(NFTアート)を貰える
- ChatGPTを搭載した相棒ゴリラと音声対話チャットで繋がりのある会話のキャッチボールが可能
- 地図上に相棒ゴリラの分身を置きゴリとして配置可能
- 置きゴリにはステーキング機能を実装（但し、一定確率で脱獄し消滅）
- 特定のスポットにチェックインすることでご当地装備NFTを入手する事ができる
- 経験値トークンと装備NFTで相棒ゴリラが強くなりステータスとランキングを確認できる

# Getting Started

<p>ここからは本アプリをローカルPCで試験動作させるための手順の説明になります</p>

デモアプリを試したい場合は 
[コチラ](https://front-inky-one.vercel.app/) 
から試す事もできます</p>

# Things to install in advance

Please install the following tools in advance.<br>
- [node(v18 LTS)](https://nodejs.org/en/download)<br>
- [git](https://git-scm.com/downloads)<br>


## Contractをデプロイします

[ContractのREADME](/contract/README.md)を参照してContractをデプロイします

## 環境変数を設定します

.env.localファイルを作成し以下の環境変数を設定します
```bash
NEXT_PUBLIC_GOOGLE_MAP_APIKEY={Google Map APIキー}
NEXT_PUBLIC_OPENAI_API_KEY={Azure OpenAI APIキー}
NEXT_PUBLIC_OPENAI_API_VERSION={Azure OpenAI APIバージョン}（例：2023-08-01-preview）
NEXT_PUBLIC_OPENAI_RESOURCE={Azure OpenAI リソース名}
NEXT_PUBLIC_OPENAI_DEPLOYMENT={Azure OpenAI モデルデプロイ名}
NEXT_PUBLIC_SPEECH_SDK_KEY={Azure AI Speech SDKキー}
NEXT_PUBLIC_SPEECHSDK_REGION={Azure AI Speech SDKリージョン}
NEXT_PUBLIC_TEXT_ANALYSIS_KEY={Azure AI TextAnalysisキー}
NEXT_PUBLIC_TEXT_ANALYSIS_ENDPOINT={Azure AI TextAnalysisエンドポイント}
NEXT_PUBLIC_GELATO_RELAY_API_KEY={Gelato　Relay APIキー}
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID={Web3Auth Client ID}
```

### Google Map APIキーを準備します

ドライブマップを利用するにはGoogle MapのAPIキーが必要です。<br>
[Maps JavaScript API](https://developers.google.com/maps/documentation/javascript?hl=ja)の手順に沿ってGoogle MapのAPIキーを準備します。<br>
※Maps JavaScript API のご利用にあたっては、請求先アカウントと Maps JavaScript API が有効なプロジェクトが必要です。
詳しくは、[Cloud コンソール](https://developers.google.com/maps/documentation/javascript/cloud-setup?hl=ja)での設定をご覧ください。

### Gelatoを設定します
https://beta.app.gelato.network/relay へ行き、API Keyを作成します。<br>
本プロダクトでは1Blanceによりガス代を支払いますのでデポジットしておいてください。

参考：https://github.com/gelatodigital/astar-zkatana-starter-kit

```
NEXT_PUBLIC_GELATO_RELAY_API_KEY={Gelato API Key}
```

### web3Authを設定します
https://web3auth.io/ へ行き、プロジェクトを作成します。<br>
作成後、プロジェクトの設定画面からClientIdをコピーし、envへ貼り付けます。
```
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID={web3Auth API Key}
```

### AzureのSubscriptionを準備します

[Azure の無料アカウントを使ってクラウドで構築](https://azure.microsoft.com/ja-jp/free/)から無料のAzureアカウントを作成して有効なSubscriptionを準備します。
Azureを開始するにはMicrosoftのアカウントが必要です。<br>
まだ作成していない場合は[アカウントの作成](https://signup.live.com/signup?)よりアカウントを作成します。

### Azure Open AIのリソースを準備します

[Azure OpenAI Service](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/how-to/create-resource?pivots=web-portal) のリソースを作成してデプロイする<br>
※2023/11/25現在 Azure OpenAI サービスは[登録](https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7en2Ais5pxKtso_Pz4b1_xUNTZBNzRKNlVQSFhZMU9aV09EVzYxWFdORCQlQCN0PWcu)が必要で、現在は承認された企業顧客およびパートナーのみが利用できます。<br>
※個人メールアドレス（Example: @gmail.com, @yahoo.com, @hotmail.com, etc.）での申請は拒否されるようです。詳しくは[コチラ](https://learn.microsoft.com/ja-jp/legal/cognitive-services/openai/limited-access?context=%2Fazure%2Fcognitive-services%2Fopenai%2Fcontext%2Fcontext)をご確認ください。

デプロイしたAzure Open AIリソースを開き{Azure OpenAI リソース名}を確認します

![Azure Open AIリソース](/doc/AzureOpenAI_Resource.png)

デプロイしたAzure OpenAIリソースの「キーとエンドポイント」を開き{Azure OpenAI APIキー}を.env.localファイルの所定のキー値とします<br>

![Azure OpenAIリソースの「キーとエンドポイント」](/doc/AzureOpenAI_Key.png)

次に「モデルのデプロイ」- 「展開の管理」より「
[Azure OpenAI Studio](https://oai.azure.com/portal/)
」を開きます</p>

### 続いて作成したAzure OpenAIリソースの展開の管理からモデルをデプロイします

![Azure Open AIリソースのモデルのデプロイ](/doc/AzureOpenAI_ModelDeployOpen.png)

Azure Open AI Studioが開きます。「デプロイ」-「＋新しいデプロイの作成」を開きます

![Azure AI |Azure Open AI Studio](/doc/AzureAIStudio.png)

「モデルのデプロイ」の「モデルを選択してください」のプルダウンよりモデルを選択します。<br>
※本アプリでは「gpt-35-turbo-16k」を選択します。モデルの詳細は
[Azure OpenAI Service モデル](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/concepts/models)
で確認できます。

![モデルを選択してください](/doc/AzureAIStudio_ModelSelect.png)

続いて「デプロイ名」を入力します。ここで入力する「デプロイ名」は環境変数の{Azure OpenAI モデルデプロイ名}として使用します。他の項目は初期値でOKです。

![Azure OpenAI モデルデプロイ名](/doc/AzureAIStudio_ModelDeploy.png)

※ここで設定したモデルのデプロイ名は「Azure Open AIのリソースの情報」として後で使用します<br>
準備した「Azure Open AIのリソースの情報」を.env.localファイルの所定のキー値とします

```bash
NEXT_PUBLIC_OPENAI_API_KEY={Azure OpenAI APIキー}
NEXT_PUBLIC_OPENAI_API_VERSION={Azure OpenAI APIバージョン}
NEXT_PUBLIC_OPENAI_RESOURCE={Azure OpenAI リソース名}
NEXT_PUBLIC_OPENAI_DEPLOYMENT={Azure OpenAI モデルデプロイ名}
```
[公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/reference)の「サポートされているバージョン」の日付部分（例：2023-08-01-preview）をバージョン情報として使います<br>

### Azure AI Speech Serviceのリソースを準備します

[Azure AI Speech Service](https://learn.microsoft.com/ja-jp/azure/ai-services/speech-service/speech-studio-overview)のリソースをデプロイします。<br>
- [Azure AI Speech Studio](https://speech.microsoft.com/portal?)

デプロイしたAzure AI Speech Serviceの「キーとエンドポイント」を開き{Azure AI Speech SDKキー}と{Azure AI Speech SDKリージョン}を.env.localファイルの所定のキー値とします<br>

![Azure AI Speech Serviceの「キーとエンドポイント」](/doc/AzureSpeech_Key.png)

```bash
NEXT_PUBLIC_SPEECH_SDK_KEY={Azure AI Speech SDKキー}
NEXT_PUBLIC_SPEECHSDK_REGION={Azure AI Speech SDKリージョン}
```

### Azure AI Language Serviceのリソースを準備します

[Azure AI Language Service](https://learn.microsoft.com/ja-jp/azure/ai-services/language-service/language-studiobr)のリソースをデプロイします<br>

- [Azure AI Language Studio](https://language.cognitive.azure.com/home)

デプロイしたAzure AI Language Serviceの「キーとエンドポイント」を開き{Azure AI TextAnalysisキー}と{Azure AI TextAnalysisエンドポイント}を.env.localファイルの所定のキー値とします<br>

![Azure AI Language Serviceの「キーとエンドポイント」](/doc/AzureLanguage_Key.png)

```bash
NEXT_PUBLIC_TEXT_ANALYSIS_KEY={Azure AI TextAnalysisキー}
NEXT_PUBLIC_TEXT_ANALYSIS_ENDPOINT={Azure AI TextAnalysisエンドポイント}
```

## Quickstart

Githubより[本アプリのgitリポジトリ](https://github.com/mossan-ultra/DrivingGorilla)をcloneします
```bash
git clone git@github.com:mossan-ultra/DrivingGorilla.git
```

カレントディレクトを./frontに変更してアプリを開始します
```bash
cd ./front
npx run build
npx next dev
```
起動するとTerminalに以下のように出力されます<br>
![Terminal](/doc/Terminal.png)

コンソールのURL([http://localhost:3000](http://localhost:3000))をクリックするかブラウザのアドレス欄に以下を貼り付けて実行します
```
http://localhost:3000
```

# 画面

## Sign in
サインイン画面です。サインインを行うとWeb3Authの認証画面が表示され、認証することで画面遷移します。

相棒ゴリラを持っていない場合→初回画面

相棒ゴリラを持っている場合→Home画面

<img width="375" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/81e1b0dd-ac15-407e-8622-5b895ed4bc8a">

## 初回画面
相棒ゴリラを持っていない時に表示される画面です。

相棒ゴリラを生成することができます。

<img width="377" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/4cce1bb7-5b2f-4ef1-a2b2-676ac763d085">

## Home
Homeでは相棒ゴリラとトークすることができます。

マイクアイコンをタップ後話しかけることで音声で返信してくれます。

| 相棒 | チャットログ |
| :------: | :-------: |
| <img width="376" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/1835726c-aa44-42f8-87d3-b89eb455c1b4">| <img width="377" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/a1e097c1-ecd1-430d-b392-6fb0f1a42d84">

## Status
ステータス表示は相棒ゴリラのステータスと装備NFTの総和が表示されます。

また、ステータスランキングを確認することができます。

<img width="374" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/d6b514c6-1637-441e-9798-fcdc6699b6cd">

## Equipment
獲得した装備を確認する画面です。

<img width="374" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/11116ff3-dd4f-40a4-99ec-f47c343ee0f9">

## Drive
現在位置がマップ上にプロットされます。

マイクアイコンをタップ後話しかけることで音声で返信してくれます。

右下のチェックインボタンを押すとチェックインすることができ、特定ポイントであれば装備NFTがミントされます。

| Drive画面 | 装備NFTミント画面 |
| :------: | :-------: |
| <img width="375" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/a80e0077-0bab-41d9-ba1a-fbb4b2cb4fa3">| <img width="375" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/d0749787-d6d5-4dea-a3a9-abb5c6a5fb25">

## Collection
おきゴリの作成、表示、ゴリラバトルを行う画面です。

おきゴリは相棒ゴリラのトークンを分け与えることで作成できます。

作成時に期間設定が可能で、期間を満了すると預けたトークン＋αを持って帰ってきます。

ただし、一定確率で脱走することがあり、脱走した場合預けたトークンは無くなります。

| Collection画面 | おきゴリバトル | おきゴリ作成　|
| :------: | :-------: | :-------: |
| <img width="374" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/0ffad9a4-ecc8-430e-9fc7-5822ecb18702">　| <img width="376" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/5dd472c5-6128-4580-99e4-d997ed6d2a6c"> | <img width="375" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/bf54748e-f089-402f-8622-5c69141d2a0e">

## 運転データの登録
アプリを起動すると一日一回運転データを登録する画面が表示されます。

この画面では運転データを登録することで前日の運転成績に応じたトークン（経験値）が払い出されます。

また、おきゴリの期間が満了していた場合、おきゴリ結果を確認することができます。

| 運転データ登録 | 経験値獲得 |脱走ゴリラ |帰ってきたゴリラ |
| :------: | :-------: |:-------: |:-------: |
| <img width="376" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/ddde29f8-fa08-45bf-9f84-b4b4e7cb404c">| <img width="377" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/53e14283-e858-4713-8217-d9b0ec691b11">|<img width="375" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/e82473a5-7ec0-496c-bfa0-9eda215d87f2">|<img width="376" alt="image" src="https://github.com/mossan-ultra/DrivingGorilla/assets/95908731/b25fee16-927b-4c7d-a45c-1e4ed720c0f5">


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
