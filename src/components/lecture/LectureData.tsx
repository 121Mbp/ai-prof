import { Link } from 'react-router-dom'
import styles from './../../assets/styles/Lecture.module.scss'
import Clip from '@/assets/svg/clip.svg?react'

interface LectureDataProps {
  lectureData: any
}

const LectureData: React.FC<LectureDataProps> = ({ lectureData }) => {
  return (
    <ul className={styles.data}>
      {lectureData?.map((item: any, index: number) => (
        <li key={index}>
          <Link to={item.lctrDataPath}>
            <div>
              <Clip />
              <span>{item.lctrDataNm}</span>
            </div>
            <span>Download</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default LectureData
