import { useEffect } from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'

const WebSpeechAPI: React.FC = () => {
  const { transcript, resetTranscript } = useSpeechRecognition()

  useEffect(() => {
    SpeechRecognition.startListening({ language: 'ko-KR', continuous: true })
    if (transcript.includes('질문')) {
      console.log('질문이 감지되었습니다!')
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  return <div>WebSpeechAPI</div>
}

export default WebSpeechAPI
