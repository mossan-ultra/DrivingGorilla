export const OpenAI_Resource = process.env.NEXT_PUBLIC_OPENAI_RESOURCE;
export const OpenAI_Deployment = process.env.NEXT_PUBLIC_OPENAI_DEPLOYMENT;
export const OpenAI_API_version = process.env.NEXT_PUBLIC_OPENAI_API_VERSION;
export const OpenAI_API_Key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
export const OpenAI_Completion_URL = `https://${OpenAI_Resource}.openai.azure.com/openai/deployments/${OpenAI_Deployment}/chat/completions?api-version=${OpenAI_API_version}`;
export const SpeechSDK_Key = process.env.NEXT_PUBLIC_SPEECH_SDK_KEY;
export const SpeechSDK_Region = process.env.NEXT_PUBLIC_SPEECHSDK_REGION;
export const TextAnalysis_EndPoint =
  process.env.NEXT_PUBLIC_TEXT_ANALYSIS_ENDPOINT;
export const TextAnalysis_Key = process.env.NEXT_PUBLIC_TEXT_ANALYSIS_KEY;

export const Chatbot_ImagePath = "/gif/Chatbot_NeutralImagen.gif";
export const Chatbot_PositiveImagePath = "/gif/Chatbot_PositiveImage.gif";
export const Chatbot_NegativeImagePath = "/gif/Chatbot_NegativeImage.gif";
export const Chatbot_StartMessage =
  "チャットボットを開始します。\n マイクアイコンをクリックして話しかけるか、試しに何かを入力してENTERキーを押して下さい";
export const SpeechSDK_Language = "ja-JP";
export const SpeechSDK_VoiceName = "ja-JP-AoiNeural";
export const SpeechSdk_RecognizerErrorMsg =
  "音声がキャンセルされたか、認識できませんでした。 マイクが正しく機能していることを確認してください。";

export type SemRet = {
  json: string;
  caption: string;
  negative: number;
  neutral: number;
  positive: number;
};

export type ChatLog =
  | {
      image?: never;
      chatname?: never;
      chatlog: string;
      chattime: Date;
    }
  | {
      image: string;
      chatname: string;
      chatlog: string;
      chattime: Date;
    };
