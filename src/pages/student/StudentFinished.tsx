import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StudentTitle from '../../components/student/StudentTitle'
import StudentList from '../../components/student/StudentList'
import StudentFilter from '../../components/student/StudentFilter'

const StudentFinished: React.FC = () => {
  const data = useOutletContext<any>()
  const [filteredLecture, setFilteredLecture] = useState<any>(data.finished)

  useEffect(() => {
    setFilteredLecture(data?.finished)
  }, [data.finished])

  return (
    <>
      <>
        <StudentTitle
          welcome={
            <>
              완강<span>을 축하드립니다!</span>
            </>
          }
        />
        <StudentFilter
          originalLecture={data.finished}
          filteredLecture={filteredLecture}
          setFilteredLecture={setFilteredLecture}
        />
      </>
      <StudentList
        title={'완강'}
        type={'grid'}
        data={filteredLecture}
      />
    </>
  )
}

export default StudentFinished
