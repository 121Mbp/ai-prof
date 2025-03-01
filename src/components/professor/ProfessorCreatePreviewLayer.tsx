import { useEffect, useRef, useState } from 'react'
import VideoPlayer from '../../components/common/VideoPlayer'
import styles from './../../assets/styles/CreateLecture.module.scss'
import Remove from '@/assets/svg/close.svg?react'

interface ProfessorCreatePreviewLayerProps {
  setIsOpen: (isOpen: boolean) => void
  previewImage: string
  previewVideo: string
  selectedBackground: any
  selectedMetaHuman: any
}

const ProfessorCreatePreviewLayer: React.FC<
  ProfessorCreatePreviewLayerProps
> = ({
  setIsOpen,
  previewImage,
  // previewVideo,
  selectedBackground,
  selectedMetaHuman,
}) => {
  const layerRef = useRef<HTMLDivElement>(null)
  const [currentProgress, setCurrentProgress] = useState<number>(100)
  const [completeProgress, setCompleteProgress] = useState<number>(0)
  const [saveProgress, setSaveProgress] = useState<number>(0)

  const handleClickOutside = (event: MouseEvent) => {
    if (layerRef.current && !layerRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const contentsData = {
    videoPath: 'https://rotato.netlify.app/alpha-demo/movie-hevc.mov',
    // videoPath: previewVideo,
  }

  return (
    <div className={`${styles.preview}`}>
      <div ref={layerRef}>
        <div>
          <button onClick={() => setIsOpen(false)}>
            <Remove />
          </button>
        </div>
        <div>
          <div>
            <h3>강의 미리보기</h3>
          </div>
          <div
            style={{
              backgroundImage: `url(${previewImage}), url(${selectedBackground[0].lctrBgPath})`,
            }}
          >
            <div>
              <VideoPlayer
                preview={true}
                contentsData={contentsData}
                currentProgress={currentProgress}
                setCurrentProgress={setCurrentProgress}
                completeProgress={completeProgress}
                setCompleteProgress={setCompleteProgress}
                saveProgress={saveProgress}
                setSaveProgress={setSaveProgress}
              />
              <img
                src={`${selectedMetaHuman[0].thumbPath}`}
                alt=''
              />
            </div>
          </div>

          <button onClick={() => setIsOpen(false)}>확인</button>
        </div>
      </div>
    </div>
  )
}

export default ProfessorCreatePreviewLayer
