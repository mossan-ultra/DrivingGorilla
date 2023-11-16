import { ReactNode } from 'react'
import { Chatbot_ImagePath,ChatLog} from '../_const/chatconstants'

export const formatTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

export const chatlogs = (message: string): ReactNode => {
  return message.split('\n').reduce(
    (prev, curr) => (
      <>
        {prev}
        {!!prev && <br />}
        {curr}
      </>
    ),
    '' as ReactNode
  )
}

export const addBotLog = (botname:string,chatlog: string): ChatLog => {
  return {
    chatname: botname,
    image: Chatbot_ImagePath,
    chatlog,
    chattime: new Date(),
  }
}

export const addSelfLog = (chatlog: string): ChatLog => {
  return {
    chatlog,
    chattime: new Date(),
  }
}
