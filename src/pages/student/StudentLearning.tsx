import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StudentTitle from '../../components/student/StudentTitle'
import StudentList from '../../components/student/StudentList'
import StudentFilter from '../../components/student/StudentFilter'

const StudentLearning: React.FC = () => {
  const data = useOutletContext<any>()
  const [filteredLecture, setFilteredLecture] = useState<any>(data.learning)

  useEffect(() => {
    setFilteredLecture(data?.learning)
  }, [data.learning])

  return (
    <>
      <StudentTitle
        welcome={
          <>
            {data.auth.nm}
            <span>님, 오늘도 응원합니다!</span>
          </>
        }
      />
      <StudentFilter
        originalLecture={data.learning}
        filteredLecture={filteredLecture}
        setFilteredLecture={setFilteredLecture}
      />
      <StudentList
        title={'수강 중'}
        type={'grid'}
        data={filteredLecture}
      />
    </>
  )
}

export default StudentLearning
