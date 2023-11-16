import { FC } from 'react'
import { formatTime, chatlogs } from '../../_utils/chatbotutils'

type Props = {
    chatlog: string
  chattime: Date
}

export const ChatSelfMessages: FC<Props> = ({ chatlog, chattime }) => {
  return (
    <div className="static flex justify-end gap-2">
      <div>
        <div className="mt-2 gap-2">
          <div className="max-w-md bg-indigo-700/50 text-sm">
            {chatlogs(chatlog)}
          </div>
          <div className="text-xs">{formatTime(chattime)}</div>
        </div>
      </div>
    </div>
  )
}
