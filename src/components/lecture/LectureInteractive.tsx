import { useEffect, useRef } from 'react'
import styles from './../../assets/styles/Common.module.scss'

interface LectureInteractiveProps {
  isRecording?: string
  setIsRecording?: (isRecording: string) => void
  isSpeaking?: boolean
  setIsSpeaking?: (isSpeaking: boolean) => void
}

const LectureInteractive: React.FC<LectureInteractiveProps> = ({
  isRecording,
  setIsRecording,
  setIsSpeaking,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIsSpeaking?.(true)
  }, [setIsSpeaking])

  useEffect(() => {
    window.addEventListener('message', function (event) {
      console.log('Received data: ', event.data)
      sessionStorage.setItem('session_id', event.data.session_id)
    })
  }, [])

  useEffect(() => {
    const handleIframeLoad = () => {
      if (iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage('playVideo', '*')
        console.log('🔹 자동 재생 메시지 전송됨')
      }
    }

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad)
    }

    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [])

  // useEffect(() => {
  //   const handleClick = () => {
  //     if (iframeRef.current?.contentWindow) {
  //       iframeRef.current.contentWindow.postMessage('playVideo', '*')
  //       console.log('🔹 자동 재생 메시지 전송됨')
  //     }
  //   }

  //   const handleIframeLoad = () => {
  //     setTimeout(() => {
  //       handleClick()
  //     }, 8000)
  //   }

  //   if (iframeRef.current) {
  //     iframeRef.current.addEventListener('load', handleIframeLoad)
  //   }

  //   return () => {
  //     if (iframeRef.current) {
  //       iframeRef.current.removeEventListener('load', handleIframeLoad)
  //     }
  //   }
  // }, [])

  const handleInteractiveClose = () => {
    setIsRecording?.('false')
    setIsSpeaking?.(false)
  }

  return (
    <div
      className={`${styles.unity3d} ${
        isRecording === 'true' ? styles.active : ''
      }`}
    >
      <button onClick={handleInteractiveClose}>닫기</button>
      <iframe
        ref={iframeRef}
        src='https://121.133.224.212:5001/interactive'
        width='100%'
        height='100%'
        style={{ border: 'none' }}
        allow='autoplay; fullscreen'
      ></iframe>
    </div>
  )
}

export default LectureInteractive
