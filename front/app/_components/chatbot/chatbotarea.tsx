import { FC } from 'react'
import { ChatSelfMessages } from './chatselfmessages'
import { ChatbotMessages } from './chatbotmessages'
import { ChatLog } from '../../_const/chatconstants'

type Props = {
  logs: ChatLog[]
}

export const ChatBotArea: FC<Props> = ({ logs }) => {
  return (
    <div className="flex flex-col-reverse gap-2">
      {logs.map((log, i) => {
        if (log.chatname) {
          return <ChatbotMessages key={i} {...log} />
        } else {
          return <ChatSelfMessages key={i} {...log} />
        }
      })}
    </div>
  )
}
