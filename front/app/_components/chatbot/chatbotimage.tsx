import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'

type Props = {
    image: string
    caption: string
    chatname: string 
  }
  
  export const ChatbotImage: FC<Props> = ({ image,caption,chatname}) => {

    if(caption=="positive"){
        return (
            <div className='flex flex-row'>
                <div className='ml-2 h-24 w-24'>
                    <img src={image} alt={chatname} className="rounded-lg" />
                    <FontAwesomeIcon icon={faHeart} bounce transform="shrink-2 --fa-bounce-height:14" size="sm" color='#ff9999'></FontAwesomeIcon>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-row'>
            <div className='ml-2 h-24 w-24'>
                <img src={image} alt={chatname} className="rounded-lg" />
            </div>
        </div>
    )
  }