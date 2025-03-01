import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { layerpopupState } from '../../state/layerpopupState'
import { spinnerState } from '../../state/spinnerState'
import styles from './../../assets/styles/Login.module.scss'
import Hide from '@/assets/svg/hide.svg?react'
import Show from '@/assets/svg/show.svg?react'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [inputType, setInputType] = useState<string>('password')
  const [errorUsername, setErrorUsername] = useState<string>('')
  const [errorPassword, setErrorPassword] = useState<string>('')
  const [layer, setLayer] = useRecoilState(layerpopupState)
  const [isLoading, setIsLoading] = useRecoilState(spinnerState)

  const isFormValid = username.length > 0 && password.length > 0

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false)
    }
    if (layer.isOpen) {
      setLayer({
        ...layer,
        isOpen: false,
      })
    }
  }, [layer.isOpen, isLoading])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    e.preventDefault()
    try {
      const response = await api.post(`${apiConfig.prof.auth.signin}`, {
        id: username,
        pw: password,
      })
      const data = await response.data
      localStorage.setItem('token', data.token)
      setErrorUsername('')
      setErrorPassword('')
      if (data.role === 'professor') {
        navigate(`/professor`)
      } else {
        navigate(`/student`)
      }
    } catch (error: any) {
      setIsLoading(false)
      if (error.response?.status === 500) {
        setErrorUsername('올바른 아이디를 입력해주세요.')
      } else {
        setLayer({
          isOpen: true,
          title: '오류',
          message: '로그인 중 오류가 발생했습니다.',
        })
      }
    }
  }

  return (
    <div className={styles.form}>
      <h2>
        AI 대학교를 <br />
        방문해 주셔서 감사합니다.
      </h2>
      <form onSubmit={handleLogin}>
        <div className={`${styles.row} ${errorUsername ? styles.error : ''}`}>
          <label htmlFor='id'>아이디</label>
          <input
            type='text'
            id='id'
            placeholder='아이디를 입력해 주세요'
            autoComplete='username'
            onChange={(e) => setUsername(e.target.value)}
          />
          <p>{errorUsername}</p>
        </div>
        <div className={`${styles.row} ${errorPassword ? styles.error : ''}`}>
          <label htmlFor='pw'>비밀번호</label>
          <input
            type={inputType}
            id='pw'
            placeholder='비밀번호를 입력해 주세요'
            autoComplete='current-password'
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            onClick={() =>
              setInputType((prev) =>
                prev === 'password' ? 'text' : 'password'
              )
            }
          >
            {inputType === 'password' ? <Hide /> : <Show />}
          </div>
          <p>{errorPassword}</p>
        </div>
        <div className={styles.keep}>
          <div>
            <input
              type='checkbox'
              id='save'
            />
            <label htmlFor='save'>로그인 유지</label>
          </div>
          <Link to='#'>계정 찾기</Link>
        </div>
        <button
          type='submit'
          className={styles.button_login}
          disabled={!isFormValid}
        >
          로그인
        </button>
      </form>
      <button className={styles.button_join}>회원가입</button>
    </div>
  )
}

export default Login
