import { FC, useCallback, useState, useEffect } from 'react'
import { useCompleteText } from '../../_hooks/useCompleteText'
import { ChatInputText } from './chatinputtext'
import { ChatBotArea } from './chatbotarea'
import { addBotLog, addSelfLog } from '../../_utils/chatbotutils'
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import { ResultReason } from "microsoft-cognitiveservices-speech-sdk"
import { OpenAI_API_Key, SpeechSDK_Key, SpeechSDK_Region, SpeechSDK_Language, SpeechSDK_VoiceName, SpeechSdk_RecognizerErrorMsg, Chatbot_StartMessage, Chatbot_ImagePath, ChatLog } from '../../_const/chatconstants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone } from '@fortawesome/free-solid-svg-icons'
import { db } from '../../_models/db'
import { useLiveQuery } from "dexie-react-hooks"

type Props = {
  goriname: string
}
const ChatBot: FC<Props> = ({ goriname }) => {

  const apiKey = OpenAI_API_Key as string
  const completeText = useCompleteText({ apiKey })
  const [memory, setMemory] = useState('')
  const [logs, setLogs] = useState<ChatLog[]>([
    addBotLog(goriname, Chatbot_StartMessage),
  ])
  const [isLoading,setLoading] = useState(false)

  const lists = useLiveQuery(
    async () => {
      return db.chatLists
        .toArray()
    },
    );
  useEffect(() => {
    if(lists && !isLoading){
        lists.map((item, i) => {
          const log = item as ChatLog;
          setLogs((prev) => [...prev, log]);
          if(log.chatname){
            setMemory((prev) => `${prev}AI: ${log.chatlog}\n`) 
          }else{
            setMemory((prev) => `${prev}Human: ${log.chatlog}\n`)          
          }
          setLoading(true)
      })
    }
  }, [lists]);

  const chatTextSubmit = useCallback(
    async (text: string) => {
      const sayChatbot = (message: string): void => {
        setLogs((prev) => [...prev, addBotLog(goriname, message)])
        addBotDexie(goriname,message)

        const speechConfig = speechsdk.SpeechConfig.fromSubscription(SpeechSDK_Key as string, SpeechSDK_Region as string);
        speechConfig.speechRecognitionLanguage = SpeechSDK_Language;
        speechConfig.speechSynthesisVoiceName = SpeechSDK_VoiceName;
        const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig);
        synthesizer.speakTextAsync(
          message,
          function (result) {
            console.log(result);
            synthesizer.close();
          }, function (err) {
            console.error(err);
            synthesizer.close();
          }
        )
      }

      if (!completeText) {
        return
      } else {
        const chatbotprompt = `メロンが大好きな非常に好戦的で威圧的な物知りな天才ゴリラ,神社巡りが大好きでいつも神社に居る,Negativeな感情表現が多い,魔王を倒した事がある,伝説の鎧を着ている,甘くて美味しいマスクメロンを持っている,質問が大好き,名前は${goriname},要点だけを簡潔に短く答える,語尾にウホウホを付ける。`;
        const prompt = `${chatbotprompt}${memory.trim()}Human: ${text}AI: `
        completeText(prompt)
          .then((res) => {
            const chatbotResponseText = res.slice(prompt.length)
            sayChatbot(chatbotResponseText)
            setMemory((prev) => `${prev}AI: ${chatbotResponseText.trim()}\n`)
          })
          .catch(() => {
            console.error;
            setLogs((prev) => [
              ...prev,
              addBotLog(goriname, 'よくわからないエラー発生。'),
            ])
          })
        setLoading(true)
        setLogs((prev) => [...prev, addSelfLog(text)])
        addSelfDexie(text)
        setMemory((prev) => `${prev}Human: ${text}\n`)
      }
    }, [completeText, memory])

  async function microphoneText() {

    const speechConfig = speechsdk.SpeechConfig.fromSubscription(SpeechSDK_Key as string, SpeechSDK_Region as string);
    speechConfig.speechRecognitionLanguage = SpeechSDK_Language;
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      function (result) {
        if (result.reason === ResultReason.RecognizedSpeech) {
          console.log(result.text);
          chatTextSubmit(result.text);
        } else {
          console.error(SpeechSdk_RecognizerErrorMsg);
          addBotLog(goriname, SpeechSdk_RecognizerErrorMsg);
        }
        recognizer.close();
      },
      function (err) {
        console.error(err);
        recognizer.close();
      }
    );

  }

  async function addBotDexie(botname:string,chatlog: string){
      await db.chatLists.add({
        image: Chatbot_ImagePath,
        chatname: botname,
        chatlog,
        chattime:new Date(),
      })
      .then((res) => {
        console.log("addSelfDexie"+res.toString);
        })
    .catch(
      (e)=>{
        console.error(e);
        });
  }

  async function addSelfDexie(chatlog: string){
      await db.chatLists.add({
        image:undefined,
        chatname:undefined,
        chatlog,
        chattime:new Date(),
      })
      .then((res) => {
          console.log("addSelfDexie"+res.toString);
        })
      .catch(
        (e)=>{
          console.error(e);
        });
  }

  return (
    <div className="static">

      <div className="static flex h-12 w-full items-center justify-center bg-transparent">
        <button onClick={
          async (e) => {
            e.preventDefault();
            await microphoneText();
          }
        } name="faMicrophone" className="border-0">
          <FontAwesomeIcon icon={faMicrophone} fade size="3x" transform={"shrink-6"}></FontAwesomeIcon>
        </button>
        <ChatInputText onSubmit={chatTextSubmit} />
      </div>

      <div className="mt-6">
        <ChatBotArea logs={logs} />
      </div>

    </div>
  )

}

export default ChatBot