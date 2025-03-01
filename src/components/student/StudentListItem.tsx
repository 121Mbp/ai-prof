import { useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { layerpopupState } from './../../state/layerpopupState'
import styles from './../../assets/styles/Student.module.scss'
import { FormatDate, FormattedDate } from './../../components/common/FormatTime'

interface StudentListItemProps {
  data: any
}

const StudentListItem: React.FC<StudentListItemProps> = ({ data }) => {
  const navigate = useNavigate()
  const [, setIsLoading] = useRecoilState(layerpopupState)

  const handleItemView = (item: any | undefined) => {
    navigate(`/student/learning/${item.sbjId}/${item.firstWeekLctrId}`)
  }

  return (
    <div className={styles.item}>
      <div
        onClick={
          data.sbjStatus === '0'
            ? () =>
                setIsLoading({
                  isOpen: true,
                  title: '수강일에 만나요!',
                  message: `${FormattedDate(
                    data.sbjStartDtm
                  )}<span>부터 수강 가능합니다.</span>`,
                })
            : data.sbjStatus === '2'
            ? () =>
                setIsLoading({
                  isOpen: true,
                  title: '수강이 완료되었어요.',
                  message: `<span>해당 강의는 수강 가능한 기간이 만료되었어요.</span>`,
                })
            : () => handleItemView(data)
        }
      >
        <div
          style={{
            backgroundImage: `url(${data.thumbPath})`,
          }}
        ></div>
      </div>
      <div>
        <p>{data.sbjNm}</p>
        <p>
          <span>{data.deptNm}</span>
          <span>{data.sbjCrlm}</span>
        </p>
        <p>
          {data.sbjStatus === '0' && (
            <span className={styles.purple}>수강 예정</span>
          )}
          {data.sbjStatus === '1' && (
            <span className={styles.primary}>수강 중</span>
          )}
          {data.sbjStatus === '2' && (
            <span className={styles.finished}>수강 완료</span>
          )}
          {FormatDate(data.sbjStartDtm)} ~ {FormatDate(data.sbjCmplDtm)}
        </p>
      </div>
    </div>
  )
}

export default StudentListItem
