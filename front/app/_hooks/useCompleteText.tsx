import { useMemo } from 'react'
import axios from 'axios';
import { OpenAI_Completion_URL, OpenAI_API_Key } from '../_const/chatconstants'

export const useCompleteText = ({ apiKey }: { apiKey: string }) => {

  return useMemo(() => {

    if (!apiKey) {
      return undefined
    }

    const completeText = async (prompt: string): Promise<string> => {
      try {
        const { data } = await axios(
          {
            method: 'POST',
            url: OpenAI_Completion_URL,
            headers: {
              'Content-Type': 'application/json',
              'api-key': OpenAI_API_Key as string
            },
            data: {
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ]
            }
          }
        )
        const choice = 0
        const text = data.choices[choice].message.content || ''

        console.log('text=' + text)

        return prompt + text

      } catch (e) {

        console.error(e)
        return prompt

      }
    }

    return completeText
  }, [apiKey])
}
