import { FC, useState,useEffect } from 'react'
import { sentimentAnalysis} from '../../_utils/textanalysis'
import { formatTime, chatlogs } from '../../_utils/chatbotutils'
import { ChatbotImage } from './chatbotimage'
import { Chatbot_ImagePath,Chatbot_PositiveImagePath,Chatbot_NegativeImagePath } from '../../_const/chatconstants'

type Props = {
  image: string
  chatname: string
  chatlog: string
  chattime: Date
}

export const ChatbotMessages: FC<Props> = ({ image, chatname, chatlog, chattime}) => {

  const [chatbotmessage, setChatbotmessage] = useState(chatlog);
  const [semImagePath,setSemImagePath] = useState(image);
  const [semCaption,setSemCaption] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    (async () => {
      const semret = await sentimentAnalysis({chatlog});
      if(!!semret){
        setChatbotmessage(chatlog)
        setSemCaption(semret.caption)
        switch(semret.caption){
          case 'positive':
            setSemImagePath(Chatbot_PositiveImagePath);
            break;
          case 'negative':
            setSemImagePath(Chatbot_NegativeImagePath);
            break;
          default:
            setSemImagePath(Chatbot_ImagePath);
        }
      }
      setIsProcessing(false);
    })();
  }, [])

  return (
    <div className="static flex justify-start gap-2">
      <ChatbotImage image={semImagePath} caption={semCaption} chatname={chatname} />
      <div>
        <div className="text-sm font-bold">{chatname}</div>
        <div className="mt-2 gap-2">
          <div className="max-w-md bg-emerald-950/50 text-sm">
            {
              chatlogs(chatbotmessage)
            }
          </div>
          <div className="text-xs">{formatTime(chattime)}</div>
        </div>
      </div>
    </div>
  )

}
