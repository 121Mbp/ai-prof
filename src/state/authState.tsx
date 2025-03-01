import { atom } from 'recoil'

interface Auth {
  id?: number
  username?: string
  profileImage?: string
  role?: string
  department?: string
  semester?: string
}

interface AuthProps {
  user: Auth | null
}

export const authState = atom<AuthProps>({
  key: 'authState',
  default: {
    user: null,
  },
})
