import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './../../assets/styles/Lecture.module.scss'
import Select from '../common/Select'

interface studentTitleProps {
  subId?: string
  department: string
  subject: string
  grade: string
  semester: string
  title: string
  lctrWeekList: any
  setIsDataFetched: (isDataFetched: any) => void
}

const LectureTitle: React.FC<studentTitleProps> = ({
  subId,
  department,
  subject,
  grade,
  semester,
  title,
  lctrWeekList,
  setIsDataFetched,
}) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const filterRef = useRef<HTMLHeadingElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={styles.title}>
      <span>{department}</span>
      <span>{subject}</span>
      <span>
        {grade}학년 {semester}
      </span>
      <h3 ref={filterRef}>
        {title}
        <Select
          lctrId={subId}
          // title={`1주차`}
          data={lctrWeekList}
          isOpen={openIndex === 0}
          setIsOpen={() => setOpenIndex(openIndex === 0 ? null : 0)}
          onSelect={(value: string) => {
            setIsDataFetched(false)
            if (location.pathname.includes('student')) {
              navigate(`/student/learning/${id}/${value}`, {
                replace: true,
              })
            } else if (location.pathname.includes('professor')) {
              navigate(`/professor/dashboard/learning/${id}/${value}`, {
                replace: true,
              })
            }
          }}
        />
      </h3>
    </div>
  )
}

export default LectureTitle
