import { FC, useCallback, useState } from 'react'

type Props = {
  onSubmit: (text: string) => void
}

export const ChatInputText: FC<Props> = ({ onSubmit }) => {
  const [userInput, setUserInput] = useState('')
  const [isComposition, setIsComposition] = useState(false)

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (ev.code === 'Enter' && !isComposition && userInput.trim()) {
        if (!ev.shiftKey) {
          ev.preventDefault()
          onSubmit(userInput.trim())
          setUserInput('')
        }
      }
    },
    [isComposition, onSubmit, userInput]
  )

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      setUserInput(ev.target.value)
    },
    []
  )

  return (
    <textarea
      className="w-full rounded-lg outline-none bg-indigo-700/50"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => setIsComposition(true)}
      onCompositionEnd={() => setIsComposition(false)}
      value={userInput}
    />
  )
}
