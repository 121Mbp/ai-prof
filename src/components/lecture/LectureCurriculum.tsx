import { useEffect, useRef } from 'react'
import styles from '@/assets/styles/Lecture.module.scss'
import { useRecoilState } from 'recoil'
import { layerpopupState } from '../../state/layerpopupState'
import { FormatTime } from './../../components/common/FormatTime'
import Time from '@/assets/svg/time.svg?react'
import Folder from '@/assets/svg/folder.svg?react'
import Checked from '@/assets/svg/checked.svg?react'
import Triangle from '@/assets/svg/triangle.svg?react'

interface LectureCurriculumProps {
  title: string
  contents: any[]
  activeIndex: number
  setActiveIndex: (index: number) => void
  setContentsData: (contents: any[]) => void
  lectureData: any
}

const LectureCurriculum: React.FC<LectureCurriculumProps> = ({
  title,
  contents,
  activeIndex,
  setActiveIndex,
  setContentsData,
  lectureData,
}) => {
  const progressRef = useRef<HTMLDivElement>(null)
  const [, setLayer] = useRecoilState(layerpopupState)

  const totaTime = contents.reduce((sum, chapter) => sum + chapter.endTime, 0)

  useEffect(() => {
    if (progressRef.current) {
      const complCount = contents.filter(
        (item) => item.isCmpl === 'true'
      ).length
      progressRef.current.style.setProperty(
        '--progress',
        `${((complCount / contents.length) * 100).toFixed(2)}%`
      )
    }
  }, [contents])

  const handleActiveIndex = (index: number, item: any) => {
    const completeIndex = contents.findIndex(
      (content) => content.isCmpl === 'false' || content.isCmpl === null
    )
    if (index > completeIndex && completeIndex !== -1) {
      setLayer({
        isOpen: true,
        title: '동영상 강의',
        message: '이전 챕터를 완료 후 이동이 가능합니다.',
      })
      return
    }
    setActiveIndex(index)
    setContentsData(item)
  }

  return (
    <div className={styles.curriculum}>
      <dl>
        <dt>
          <h4>{title}</h4>
          <div>
            <div ref={progressRef}></div>
            <span>{FormatTime(totaTime)}</span>
            {lectureData?.length > 0 && (
              <>
                <Folder />
                <span>강의자료</span>
              </>
            )}
          </div>
        </dt>
        {contents?.map((item, index) => (
          <dd
            key={index}
            className={`${item.isCmpl === 'true' ? styles.complete : ''} ${
              activeIndex === index ? styles.active : ''
            }`}
            onClick={() => handleActiveIndex(index, item)}
          >
            <div>
              <span>Chapter {index + 1}</span>
              <span>{item.chapNm}</span>
            </div>
            <div>
              <Time />
              <span>{FormatTime(item.endTime)}</span>
            </div>
            {activeIndex === index ? <Triangle /> : <Checked />}
          </dd>
        ))}
      </dl>
    </div>
  )
}

export default LectureCurriculum
