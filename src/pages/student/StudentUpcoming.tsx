import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StudentTitle from '../../components/student/StudentTitle'
import StudentList from '../../components/student/StudentList'
import StudentFilter from '../../components/student/StudentFilter'

const StudentUpcoming: React.FC = () => {
  const data = useOutletContext<any>()
  const [filteredLecture, setFilteredLecture] = useState<any>(data.upcoming)

  useEffect(() => {
    setFilteredLecture(data?.upcoming)
  }, [data.upcoming])

  return (
    <>
      <StudentTitle
        welcome={
          <>
            수강 예정<span>인 강의를 만나보세요!</span>
          </>
        }
      />
      <StudentFilter
        originalLecture={data.upcoming}
        filteredLecture={filteredLecture}
        setFilteredLecture={setFilteredLecture}
      />
      <StudentList
        title={'수강 예정'}
        type={'grid'}
        data={filteredLecture}
      />
    </>
  )
}

export default StudentUpcoming
