import styles from './../../assets/styles/Professor.module.scss'

const ProfessorLectureFinish: React.FC = () => {
  return (
    <div className={styles.finish}>
      <div>
        <p>영상 생성이 완료되었습니다</p>
        <button>바로가기</button>
      </div>
    </div>
  )
}

export default ProfessorLectureFinish
