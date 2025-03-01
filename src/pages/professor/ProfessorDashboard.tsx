import { useEffect, useState } from 'react'
import { Outlet, useLocation, useOutletContext } from 'react-router-dom'
import ProfessorTitle from '../../components/professor/ProfessorTitle'
import ProfessorList from '../../components/professor/ProfessorList'
import ProfessorFilter from '../../components/professor/ProfessorFilter'

const ProfessorDashboard: React.FC = () => {
  const location = useLocation()
  const data = useOutletContext<any>()
  const [filteredLecture, setFilteredLecture] = useState<any>(data.lecture)

  useEffect(() => {
    setFilteredLecture(data?.lecture)
  }, [data.lecture])

  return (
    <>
      {location.pathname !== '/professor/dashboard' ? (
        <Outlet context={data} />
      ) : (
        <>
          <>
            <ProfessorTitle
              welcome={
                <>
                  강의<span>를 확인해 주세요.</span>
                </>
              }
            />
            <ProfessorFilter
              originalLecture={data.lecture}
              filteredLecture={filteredLecture}
              setFilteredLecture={setFilteredLecture}
            />
          </>
          <ProfessorList
            title={'나의 강의'}
            type={'grid'}
            data={filteredLecture}
          />
        </>
      )}
    </>
  )
}

export default ProfessorDashboard
