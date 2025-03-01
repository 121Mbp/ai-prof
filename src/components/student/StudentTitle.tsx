import styles from './../../assets/styles/Student.module.scss'

interface studentTitleProps {
  welcome?: React.ReactNode
  department?: string
  sabeon?: string
}

const StudentTitle: React.FC<studentTitleProps> = ({
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

export default StudentTitle
