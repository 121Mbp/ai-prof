import { useEffect, useState, useRef } from 'react'
import styles from './../../assets/styles/Lecture.module.scss'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import Send from '@/assets/svg/send.svg?react'
// import Voice from '@/assets/svg/voice.svg?react'

interface LectureChatProps {
  userId: string
  sbjId?: string
  lctrId?: string
  subject?: string
  contentsData?: any
  transcript?: any
  setTranscript: (transcript: any) => void
}

interface Message {
  text: string
  sender: string
  timestamp: string
}

const LectureChat: React.FC<LectureChatProps> = ({
  userId,
  sbjId,
  lctrId,
  subject,
  transcript,
  contentsData,
}) => {
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [, setIsListening] = useState<boolean>(false)

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const fetchData = async () => {
    try {
      const response = await api.post(
        `${apiConfig.prof.metahuman.intactHistory}`,
        {
          userId: userId,
          lctrId: lctrId,
          sbjId: sbjId,
        }
      )
      const data = response.data
      console.log('message', data)
      const newMessages: Message[] = data
        .map((item: any) => [
          {
            text: item.question,
            sender: 'user',
            timestamp: formatTimestamp(item.crtDdtm),
          },
          {
            text: item.answer,
            sender: 'server',
            timestamp: formatTimestamp(item.spkdDtm),
          },
        ])
        .flat()
      setMessages(newMessages)
    } catch (error) {
      console.warn(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (transcript) {
      const newMessage: Message = transcript
      setMessages((prevMessages) => [...prevMessages, newMessage])
    }
  }, [transcript])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    resizeTextarea()
  }

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      const newMessage: Message = { text: message, sender: 'user', timestamp }
      setMessages((prevMessages) => [...prevMessages, newMessage])
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      try {
        const response = await api.post(
          `${apiConfig.prof.metahuman.interactive}`,
          {
            question: message,
            userId: userId,
            sessionId: sessionStorage.getItem('session_id') || '',
            lctrId: lctrId,
            sbjNm: [subject],
            chapNm: [contentsData?.chapNm],
            sbjId: sbjId,
          }
        )
        const data = response.data
        console.log(data)
        const serverMessage: Message = {
          text: data.answer,
          sender: 'server',
          timestamp,
        }
        setMessages((prevMessages) => [...prevMessages, serverMessage])
      } catch (error) {
        console.warn(error)
      }
      setIsListening(false)
    }
  }

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (messages.length > 4 && messagesRef.current) {
      messagesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className={styles.chat}>
      <form onSubmit={handleSend}>
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index}>
              <div
                className={msg.sender === 'user' ? styles.right : styles.left}
              >
                <p>{msg.text}</p>
                <span>{msg.timestamp}</span>
              </div>
            </div>
          ))}
          <div ref={messagesRef} />
        </div>
        <div>
          <textarea
            ref={textareaRef}
            placeholder='질문을 입력해 주세요'
            value={message}
            onChange={handleInputChange}
            rows={1}
          ></textarea>
          <button
            type='button'
            // className={isListening ? styles.active : ''}
          >
            {/* <Voice /> */}
          </button>
          <button
            type='submit'
            disabled={message.trim().length === 0}
          >
            <Send />
          </button>
        </div>
      </form>
    </div>
  )
}

export default LectureChat
