import styles from './../../assets/styles/Professor.module.scss'

interface ProfessorTitleProps {
  welcome?: React.ReactNode
  department?: string
  sabeon?: string
}

const ProfessorTitle: React.FC<ProfessorTitleProps> = ({
  welcome,
  department,
  sabeon,
}) => {
  return (
    <div className={styles.title}>
      <h3>{welcome}</h3>
      {department && sabeon && (
        <p>
          <span>{department}</span>
          <span>{sabeon}</span>
        </p>
      )}
    </div>
  )
}

export default ProfessorTitle
