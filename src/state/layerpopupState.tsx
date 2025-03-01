import { atom } from 'recoil'

interface LayerPopupProps {
  isOpen: boolean
  title: string
  message: string
  isCloseState?: boolean
  single?: {
    text?: string
    function?: () => void
  }
  double?: {
    left?: {
      text?: string
      function?: () => void
    }
    right?: {
      text?: string
      function?: () => void
    }
  }
}

export const layerpopupState = atom<LayerPopupProps>({
  key: 'layerpopupState',
  default: {
    isOpen: false,
    title: '',
    message: '',
    isCloseState: false,
    single: undefined,
    double: undefined,
  },
})
