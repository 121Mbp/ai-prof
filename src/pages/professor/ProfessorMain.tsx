import { useOutletContext } from 'react-router-dom'
import ProfessorTitle from '../../components/professor/ProfessorTitle'
import ProfessorList from '../../components/professor/ProfessorList'

const ProfessorMain: React.FC = () => {
  const data = useOutletContext<any>()

  return (
    <>
      <ProfessorTitle
        welcome={
          <>
            {data.auth?.nm}
            <span> 교수님, 안녕하세요.</span>
          </>
        }
        department={data.auth?.deptNm}
        sabeon={data.auth?.id}
      />
      <ProfessorList
        title={'나의 강의'}
        data={data.lecture}
      />
      <div style={{ display: 'flex' }}>
        <ProfessorList
          title={'메타휴먼'}
          data={data.metahuman}
        />
        {/* <ProfessorList
          title={'강의 학습'}
          type={'grid'}
          data={data.learning}
        /> */}
      </div>
    </>
  )
}

export default ProfessorMain
