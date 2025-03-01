import { useRecoilValue } from 'recoil'
import { spinnerState } from './../../state/spinnerState'
import styles from './../../assets/styles/Common.module.scss'

const Spinner: React.FC = () => {
  const isLoading = useRecoilValue(spinnerState)

  if (!isLoading) return null

  return (
    <div className={`${styles.spinner}`}>
      <div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default Spinner
