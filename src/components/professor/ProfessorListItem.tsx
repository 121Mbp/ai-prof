import { useNavigate } from 'react-router-dom'
import { FormatDate } from '../../components/common/FormatTime'
import styles from './../../assets/styles/Professor.module.scss'

interface ProfessorListItemProps {
  data: any
}

const ProfessorListItem: React.FC<ProfessorListItemProps> = ({ data }) => {
  const navigate = useNavigate()

  const handleItemView = (item: any | undefined) => {
    if (item.sbjStatus === '1' || item.sbjStatus === '2') {
      navigate(`/professor/dashboard/${item.sbjId}/${item.firstWeekLctrId}`, {
        replace: true,
      })
    } else {
      navigate(`/professor/dashboard/${item.sbjId}`, { replace: true })
    }
  }

  return (
    <div className={styles.item}>
      <div onClick={() => handleItemView(data)}>
        <div
          style={{
            backgroundImage: `url(${data.thumbPath})`,
          }}
        ></div>
        {data.lctrStatus === '-2' && (
          <div className={styles.progress}>
            <div></div>
            <p>generate</p>
          </div>
        )}
      </div>
      <div>
        <p>{data.sbjNm}</p>
        <p>
          <span>{data.deptNm}</span>
          <span>{data.sbjCrlm}</span>
        </p>
        <p>
          {data.sbjStatus === '-2' && (
            <span className={styles.grey}>생성 중</span>
          )}
          {data.sbjStatus === '-1' && (
            <span className={styles.green}>임시 저장</span>
          )}
          {data.sbjStatus === '0' && (
            <span className={styles.purple}>진행 예정</span>
          )}
          {data.sbjStatus === '1' && (
            <span className={styles.primary}>진행중</span>
          )}
          {data.sbjStatus === '2' && <span>진행 완료</span>}
          {FormatDate(data.sbjStartDtm)} ~ {FormatDate(data.sbjCmplDtm)}
        </p>
      </div>
    </div>
  )
}

export default ProfessorListItem
