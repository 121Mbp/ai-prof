import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { layerpopupState } from '../../state/layerpopupState'
import styles from '@/assets/styles/Common.module.scss'
import Warn from '@/assets/svg/warn.svg?react'
import Confirm from '@/assets/svg/confirm.svg?react'
import Close from '@/assets/svg/close.svg?react'

const LayerPopup: React.FC = () => {
  const navigate = useNavigate()
  const popupRef = useRef<HTMLDivElement>(null)
  const [layer, setLayer] = useRecoilState(layerpopupState)

  const handleClose = () => {
    if (layer.isCloseState) {
      navigate('/', { replace: true })
    }
    setLayer({ ...layer, isCloseState: false, isOpen: false })
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      handleClose()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className={`${styles.layer} ${layer.isOpen ? styles.active : ''} ${
        layer.single !== undefined ? styles.single : ''
      } ${layer.double !== undefined ? styles.double : ''}`}
    >
      <div ref={popupRef}>
        <div>
          <button onClick={handleClose}>
            <Close />
          </button>
        </div>
        <div>
          <h4>
            {layer.title === '경고' ? (
              <div>
                <Warn />
              </div>
            ) : layer.title === '확인' ? (
              <Confirm />
            ) : (
              layer.title
            )}
          </h4>
        </div>
        <div>
          <p dangerouslySetInnerHTML={{ __html: layer.message }} />
        </div>
        {layer.single !== undefined ? (
          <div>
            <button onClick={layer.single.function}>{layer.single.text}</button>
          </div>
        ) : (
          ''
        )}
        {layer.double !== undefined ? (
          <div>
            <button onClick={layer.double.left?.function}>
              {layer.double.left?.text}
            </button>
            <button onClick={layer.double.right?.function}>
              {layer.double.right?.text}
            </button>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default LayerPopup
