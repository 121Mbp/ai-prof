import { useOutletContext } from 'react-router-dom'
import StudentTitle from '../../components/student/StudentTitle'
import StudentList from '../../components/student/StudentList'

const StudentMain: React.FC = () => {
  const data = useOutletContext<any>()

  return (
    <>
      <StudentTitle
        welcome={
          <>
            {data.auth && data.auth?.nm}
            <span>님, 안녕하세요.</span>
          </>
        }
        department={data.auth?.deptNm}
        sabeon={data.auth?.id}
      />
      <StudentList
        title={'수강 중'}
        data={data.learning}
      />
      <StudentList
        title={'수강 예정'}
        data={data.upcoming}
      />
    </>
  )
}

export default StudentMain
