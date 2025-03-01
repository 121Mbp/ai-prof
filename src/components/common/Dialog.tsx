import { useEffect, useRef } from 'react'
import styles from './../../assets/styles/Common.module.scss'
import Close from '@/assets/svg/close.svg?react'

interface DialogProps {
  layout?: string
  title: string
  dialog: boolean
  dialogContent: React.ReactNode
  setDialog: (dialog: boolean) => void
  disableSubmit?: boolean
  buttonText: string
  isCloseState: boolean
  handleSaveNext?: () => void
}

const Dialog: React.FC<DialogProps> = ({
  layout,
  title,
  dialog,
  dialogContent,
  setDialog,
  disableSubmit,
  buttonText,
  isCloseState,
  handleSaveNext,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  const handleDialogClose = () => {
    setDialog(!dialog)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      handleDialogClose()
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
      className={`${styles.dialog} ${layout === 'wide' ? styles.wide : ''} ${
        !isCloseState ? styles.disabled : ''
      }`}
    >
      <div ref={dialogRef}>
        <div>
          <button>
            <Close onClick={handleDialogClose} />
          </button>
        </div>
        <div>
          <h3>{title}</h3>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            {dialogContent}
            {!isCloseState ? (
              ''
            ) : (
              <button
                disabled={disableSubmit}
                onClick={handleSaveNext}
              >
                {buttonText}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Dialog
