import { NavigateFunction, Location } from 'react-router-dom'
import apiConfig from '../../utils/apiConfig.json'
import api from '../../utils/apiService'

interface AuthenticateProps {
  auth: any
  setAuth: React.Dispatch<React.SetStateAction<any | null>>
  navigate: NavigateFunction
  location: Location
}

export const checkAuthenticate = async ({
  auth,
  setAuth,
  navigate,
  location,
}: AuthenticateProps) => {
  const token = localStorage.getItem('token')

  if (token) {
    try {
      if (!auth || auth.user === null) {
        const response = await api.get(`${apiConfig.prof.auth.me}`)
        const data = response.data
        setAuth(data)
      }
      if (auth?.role === 'professor' && location.pathname === '/') {
        navigate('/professor', { replace: true })
      } else if (auth.role === 'student' && location.pathname === '/') {
        navigate('/student', { replace: true })
      }
      if (auth?.role === 'student' && location.pathname.includes('professor')) {
        navigate('/student', { replace: true })
      }
      if (auth?.role === 'professor' && location.pathname.includes('student')) {
        navigate('/professor', { replace: true })
      }
    } catch (error) {
      console.warn('자동 로그인 실패')
      localStorage.removeItem('token')
      setAuth('')
      navigate('/login', { replace: true })
    }
  } else {
    setAuth('')
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
  }
}
