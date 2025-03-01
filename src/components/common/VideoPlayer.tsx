import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './../../assets/styles/Common.module.scss'
import { FormatTime } from './../../components/common/FormatTime'
import LectureInteractive from '../lecture/LectureInteractive'
import Play from '@/assets/svg/play.svg?react'
import Pause from '@/assets/svg/pause.svg?react'
import Undo from '@/assets/svg/undo10.svg?react'
import Muted from '@/assets/svg/muted.svg?react'
import SoundLow from '@/assets/svg/soundLow.svg?react'
import SoundHigh from '@/assets/svg/soundHigh.svg?react'
import Settings from '@/assets/svg/settings.svg?react'
import Globe from '@/assets/svg/globe.svg?react'
import Expand from '@/assets/svg/expand.svg?react'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'

interface VideoPlayerProps {
  subId?: string
  auth?: string
  contents?: any[]
  contentsData: any
  setContentsData?: (contentData: any[]) => void
  activeIndex?: number
  setActiveIndex?: (activeIndex: number) => void
  currentProgress: number
  setCurrentProgress: (currentProgress: number) => void
  completeProgress: number
  setCompleteProgress: (completeProgress: number) => void
  saveProgress: number
  setSaveProgress: (saveProgress: number) => void
  preview?: boolean
  isRecording?: string
  setIsRecording?: (isRecording: string) => void
  isSpeaking?: boolean
  setIsSpeaking?: (isSpeaking: boolean) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  subId,
  auth,
  contents,
  contentsData,
  setContentsData,
  activeIndex,
  setActiveIndex,
  currentProgress,
  setCurrentProgress,
  completeProgress,
  setCompleteProgress,
  saveProgress,
  setSaveProgress,
  preview,
  isRecording,
  setIsRecording,
  isSpeaking,
  setIsSpeaking,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [videoSrc, setVideoSrc] = useState(contentsData?.videoPath || '')
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<string>('00:00')
  const [durationTime, setDurationTime] = useState<string>('00:00')
  const [, setBufferProgress] = useState<number>(0)
  const [isPip, setIsPip] = useState<boolean>(false)
  const savedVolume = localStorage.getItem('volume')
  const [volume, setVolume] = useState<number>(
    savedVolume ? parseFloat(savedVolume) : 1
  )

  useEffect(() => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.load()
      if (videoRef.current) {
        videoRef.current.volume = volume
      }
    }
  }, [contents])

  useEffect(() => {
    if (videoRef.current && contentsData?.videoPath) {
      setVideoSrc(contentsData.videoPath)
      videoRef.current.load()
    }
  }, [contentsData?.videoPath])

  useEffect(() => {
    if (!videoRef.current) return
    if (isRecording === 'true' && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(!isPlaying)
    }
    if (isRecording === 'false' && videoRef.current) {
      videoRef.current?.play()
      setIsPlaying(!isPlaying)
    }
    // if (!question && videoRef.current) {
    //   videoRef.current.play()
    // }
  }, [isRecording, videoRef])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current?.pause()
    } else {
      videoRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleUndo = () => {
    if (!videoRef.current) return
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      )
    }
  }

  const updateTime = useCallback(() => {
    if (!videoRef.current) return
    const video = videoRef.current

    const currentTime = video.currentTime
    const duration = video.duration
    const buffer = video.buffered
    const progress = (currentTime / duration) * 100

    setCurrentTime(FormatTime(currentTime))
    setDurationTime(FormatTime(duration))
    setCurrentProgress(progress)

    if (currentProgress > completeProgress) {
      setCompleteProgress(currentProgress)
    }

    if (buffer.length > 0) {
      const bufferEnd = buffer.end(buffer.length - 1)
      setBufferProgress((bufferEnd / duration) * 100)
    }
    animationRef.current = requestAnimationFrame(updateTime)
  }, [
    setCurrentProgress,
    currentProgress,
    completeProgress,
    setCompleteProgress,
  ])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const video = videoRef.current

    const seekTime = (Number(e.target.value) / 100) * video.duration
    const progress = (seekTime / video.duration) * 100
    // video.currentTime = seekTime
    if (progress >= completeProgress) {
      console.log('이전 챕터를 완료 후 이동이 가능합니다.')
      return
    }

    video.currentTime = seekTime
    setCurrentProgress(progress)
  }

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return
    const video = videoRef.current

    if (saveProgress > 0) {
      const timeline = (saveProgress / 100) * video.duration
      video.currentTime = timeline
      setCurrentProgress(saveProgress)
    }
    updateTime()
  }, [saveProgress, setCurrentProgress, updateTime])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!videoRef.current) return
      const video = videoRef.current

      const progress = (video.currentTime / video.duration) * 100
      setSaveProgress(progress)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [setSaveProgress])

  const handleVideoEnd = useCallback(async () => {
    if (preview) {
      setIsPlaying(false)
    } else {
      if (contentsData.isCmpl === 'false') {
        try {
          await api.post(`${apiConfig.prof.learning.learningComplete}`, {
            lctrId: subId,
            userId: auth,
            chapId: contentsData.chapId,
            isCmpl: 'true',
          })
        } catch (error) {
          console.warn(error)
        }
      }
      setIsPlaying(false)
      setTimeout(() => {
        if (activeIndex !== undefined) {
          setActiveIndex?.(activeIndex + 1)
          setContentsData?.(contents?.[activeIndex + 1])
        }
      }, 1000)
    }
  }, [activeIndex, setActiveIndex, setContentsData, contentsData])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePause = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)

    if (video) {
      // video.addEventListener('timeupdate', updateTime)
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('play', handlePlay)
      video.addEventListener('pause', handlePause)
      video.addEventListener('ended', handleVideoEnd)
      animationRef.current = requestAnimationFrame(updateTime)
    }

    return () => {
      if (video) {
        // video.removeEventListener('timeupdate', updateTime)
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('pause', handlePause)
        video.removeEventListener('ended', handleVideoEnd)
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [updateTime, handleLoadedMetadata, handleVideoEnd])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      localStorage.setItem('volume', newVolume.toString())
    }
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleFullscreenChange = () => {
    const isFullscreenActive =
      document.fullscreenElement === containerRef.current
    setIsFullscreen(isFullscreenActive)
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
    },
    [togglePlay]
  )

  const handlePip = async () => {
    if (!videoRef.current) return

    try {
      if (isPip) {
        document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
      setIsPip(!isPip)
    } catch (error) {
      console.error('PIP error:', error)
    }
  }

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div
      className={styles.video}
      ref={containerRef}
    >
      {!preview && (
        <LectureInteractive
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          isSpeaking={isSpeaking}
          setIsSpeaking={setIsSpeaking}
        />
      )}
      <video
        ref={videoRef}
        preload='true'
        // muted={true}
        // autoPlay={true}
      >
        <source
          src={videoSrc}
          type='video/mp4'
        />
      </video>
      <div className={styles.control}>
        <div>
          <button onClick={togglePlay}>
            {isPlaying ? <Pause /> : <Play />}
          </button>
          <button onClick={handleUndo}>
            <Undo />
          </button>
          <button className={styles.sound}>
            {volume <= 0 ? (
              <Muted />
            ) : volume > 0 && volume <= 0.5 ? (
              <SoundLow />
            ) : (
              volume > 0.5 && volume <= 1 && <SoundHigh />
            )}
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={volume}
              onChange={handleVolumeChange}
              aria-label='Volume'
            />
          </button>
        </div>
        <div>
          <span>{currentTime}</span>
          <div>
            <input
              type='range'
              step='any'
              value={isNaN(currentProgress) ? 0 : currentProgress}
              onChange={handleSeek}
            />
            <div>
              <span
                style={{
                  width: `${completeProgress}%`,
                }}
              ></span>
              <i
                style={{
                  width: `${currentProgress}%`,
                }}
              ></i>
            </div>
          </div>
          <span>{durationTime}</span>
        </div>
        <div>
          <button onClick={handlePip}>
            <Settings />
          </button>
          <button>
            <Globe />
          </button>
          <button onClick={handleFullscreen}>
            <Expand />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
