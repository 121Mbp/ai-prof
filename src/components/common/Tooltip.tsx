import styles from './../../assets/styles/Common.module.scss'

interface TooltipProps {
  message: string
}

const Tooltip: React.FC<TooltipProps> = ({ message }) => {
  return (
    <i className={styles.tooltip}>
      <span>{message}</span>
    </i>
  )
}

export default Tooltip
