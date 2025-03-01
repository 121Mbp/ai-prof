import { useState } from 'react'
import { useOutletContext, Outlet, useNavigate } from 'react-router-dom'
import ProfessorList from '../../components/professor/ProfessorList'
import styles from './../../assets/styles/Professor.module.scss'

const ProfessorMetahuman: React.FC = () => {
  const data = useOutletContext<any>()
  const navigate = useNavigate()
  const [selectId, setSelectId] = useState<number | null>(null)

  return (
    <>
      {location.pathname !== '/professor/metahuman' ? (
        <Outlet context={data.metahuman} />
      ) : (
        <>
          <div className={styles.title}>
            <h3>
              AI 프로페서
              <span>를 생성해보세요.</span>
            </h3>
            <button
              disabled
              onClick={() => navigate('/professor/metahuman/generate')}
            >
              생성하기
            </button>
          </div>
          <ProfessorList
            title={'메타휴먼'}
            type={'grid'}
            data={data.metahuman}
            selectId={selectId ?? undefined}
            setSelectId={setSelectId}
            fetchMetahuman={data.fetchMetahuman}
          />
          <ProfessorList
            title={'강의 배경'}
            type={'grid'}
            data={data.background}
            selectId={selectId ?? undefined}
            setSelectId={setSelectId}
          />
        </>
      )}
    </>
  )
}

export default ProfessorMetahuman
