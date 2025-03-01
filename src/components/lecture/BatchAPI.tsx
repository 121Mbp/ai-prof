import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { recordingState } from '../../state/recordingState'
import { spinnerState } from '../../state/spinnerState'
import { webSocketState } from '../../state/webSocketState'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'

interface BatchAPIProps {
  userId: string
  sbjId?: string
  lctrId?: string
  subject?: string
  transcript?: any
  setTranscript: (transcript: any) => void
  contentsData?: any
  isRecording?: string
  setIsRecording: (isRecording: string) => void
  isSpeaking: boolean
  setIsSpeaking: (isSpeaking: boolean) => void
}

const BatchAPI: React.FC<BatchAPIProps> = ({
  userId,
  sbjId,
  lctrId,
  subject,
  // transcript,
  setTranscript,
  contentsData,
  isRecording,
  setIsRecording,
  isSpeaking,
  setIsSpeaking,
}) => {
  const wsRef = useRef<WebSocket | null>(null)
  // const isSpeakingRef = useRef(isSpeaking)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const audioInputRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const bufferRef = useRef<Float32Array | null>(null)
  // const mediaStreamRef = useRef<MediaStream | null>(null)
  const tempBufferRef = useRef<Float32Array | null>(null)
  const [isMediaStream, setIsMediaStream] = useState<boolean>(false)
  const [mediaStream, setMediaStream] = useRecoilState(recordingState)
  const [, setIsLoading] = useRecoilState(spinnerState)
  const [, setWebSocket] = useRecoilState(webSocketState)
  // const [isSpeaking, setIsSpeaking] = useState<boolean>(true)

  useEffect(() => {
    if (contentsData) {
      const timer = setTimeout(() => {
        sessionStorage.removeItem('session_id')
        startRecording()
        setIsLoading(false)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [contentsData])

  useEffect(() => {
    console.log('isSpeaking 상태 변경:', isSpeaking)
  }, [isSpeaking, setIsSpeaking])

  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleInterativeTranscript = async (transcript: string) => {
    console.log(
      'handleInterativeTranscript',
      sessionStorage.getItem('session_id'),
      isRecording,
      isSpeaking,
      transcript
    )
    if (
      (isRecording === 'null' || isRecording === 'false') &&
      ['교수님', '질문'].every((word) => transcript.includes(word))
    ) {
      console.log(`[STT 전환 결과] ${transcript}`)
      setIsRecording('true')
      setIsSpeaking(false)
      return
    }

    if (
      isSpeaking &&
      sessionStorage.getItem('session_id') &&
      (isRecording === 'null' || isRecording === 'true')
    ) {
      setIsSpeaking(false)
      console.log(`[STT 발음 결과] ${transcript}`)
      setTranscript({ text: transcript, sender: 'user', timestamp })
      try {
        const response = await api.post(
          `${apiConfig.prof.metahuman.interactive}`,
          {
            question: transcript,
            userId: userId,
            sessionId: sessionStorage.getItem('session_id'),
            lctrId: lctrId,
            sbjNm: [subject],
            chapNm: [contentsData.chapNm],
            sbjId: sbjId,
          }
        )
        const data = response.data
        console.log(data)
        setTranscript({ text: data.answer, sender: 'server', timestamp })
        return
      } catch (error) {
        console.warn(error)
      }
    }
  }

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] 이미 연결됨')
      return
    }

    const ws = new WebSocket('ws://192.168.220.224:20078/client/ws')
    wsRef.current = ws
    setWebSocket(ws)

    ws.onopen = () => console.log('[WebSocket] 연결 성공')
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.final) {
          if (data.transcript.trim().length > 5) {
            handleInterativeTranscript(data.transcript)
          }
        }
      } catch {
        console.log(`[WebSocket 메시지] ${event.data}`)
      }
    }
    ws.onerror = () => console.log('[WebSocket Error] 오류 발생')
    ws.onclose = () => console.log('[WebSocket] 연결 종료')
  }

  const startRecording = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket()
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // mediaStreamRef.current = stream
    setMediaStream(stream)
    const audioContext = new AudioContext({ sampleRate: 8000 })
    audioContextRef.current = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    audioInputRef.current = source

    const highPassFilter = audioContext.createBiquadFilter()
    highPassFilter.type = 'highpass'
    highPassFilter.frequency.setValueAtTime(40, audioContext.currentTime) // 100Hz 이상만 통과

    //오디오 소스를 필터에 연결
    source.connect(highPassFilter)

    const processor = audioContext.createScriptProcessor(2048, 1, 1)
    audioProcessorRef.current = processor

    processor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer.getChannelData(0)

      if (bufferRef.current === null) {
        bufferRef.current = inputBuffer
      } else {
        const tempBuffer = new Float32Array(
          bufferRef.current.length + inputBuffer.length
        )
        tempBuffer.set(bufferRef.current)
        tempBuffer.set(inputBuffer, bufferRef.current.length)
        bufferRef.current = tempBuffer
      }

      tempBufferRef.current = bufferRef.current

      if (bufferRef.current && bufferRef.current.length > 0) {
        const wavData = encodeWAV(bufferRef.current, audioContext.sampleRate)

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(wavData)
        }

        bufferRef.current = null
      }
    }

    // 필터와 프로세서 연결
    highPassFilter.connect(processor)
    processor.connect(audioContext.destination)
    setIsMediaStream(true)
    console.log('[녹음 시작]')
  }

  const stopRecording = async () => {
    console.log('[녹음 중지]')
    try {
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect()
        audioProcessorRef.current.onaudioprocess = null
        audioProcessorRef.current = null
      }

      if (audioInputRef.current) {
        audioInputRef.current.disconnect()
        audioInputRef.current = null
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close()
        audioContextRef.current = null
      }

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop()
          mediaStream.removeTrack(track)
        })
        // mediaStreamRef.current = null
        setMediaStream(null)
      }

      // try {
      //   const dummyStream = await navigator.mediaDevices.getUserMedia({
      //     audio: true,
      //   })
      //   dummyStream.getTracks().forEach((track) => track.stop())
      // } catch (err) {
      //   console.warn('마이크 리셋 실패:', err)
      // }

      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send('EOS')
          wsRef.current.close()
        } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.onopen = () => {
            wsRef.current?.send('EOS')
            wsRef.current?.close()
          }
        }
        wsRef.current.onopen = null
        wsRef.current = null
        setWebSocket(null)
      }

      setIsMediaStream(false)
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const encodeWAV = (samples: Float32Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true) // PCM 포맷
    view.setUint16(22, 1, true) // 모노 채널
    view.setUint32(24, sampleRate, true) // 샘플레이트
    view.setUint32(28, sampleRate * 2, true) // 바이트 레이트 (샘플레이트 * 2)
    view.setUint16(32, 2, true) // 블록 정렬 (2바이트/샘플)
    view.setUint16(34, 16, true) // 샘플 비트수
    writeString(36, 'data')
    view.setUint32(40, samples.length * 2, true) // 데이터 크기

    let offset = 44
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }

    return buffer
  }

  useEffect(() => {
    const handlePageLeave = async () => {
      stopRecording()
    }

    window.addEventListener('popstate', handlePageLeave)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function () {
      handlePageLeave()
      return originalPushState.apply(history, arguments as any)
    }

    history.replaceState = function () {
      handlePageLeave()
      return originalReplaceState.apply(history, arguments as any)
    }
    return () => {
      window.removeEventListener('popstate', handlePageLeave)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])

  return (
    <button
      onClick={async () => {
        if (isMediaStream) {
          await stopRecording()
        } else {
          await startRecording()
        }
      }}
    >
      {isMediaStream ? '녹음 중지' : '녹음 시작'}
    </button>
  )
}

export default BatchAPI
