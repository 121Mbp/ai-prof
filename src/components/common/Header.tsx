import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { searchState } from './../../state/searchState'
import styles from './../../assets/styles/Layout.module.scss'
import SearchBox from './../../components/common/SearchBox'
import Logo from '@/assets/svg/logo.svg?react'
import Bell from '@/assets/svg/bell.svg?react'
import Search from '@/assets/svg/search.svg?react'
import Info from '@/assets/svg/info.svg?react'
import Profile from '@/assets/svg/profile.svg?react'
import Drop from '@/assets/svg/drop.svg?react'
import Kor from '@/assets/svg/country/kr.svg?react'
import Eng from '@/assets/svg/country/en.svg?react'

interface authInfoProps {
  auth: any
  handleLogout: () => void
}

const Header: React.FC<authInfoProps> = ({ auth, handleLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [, setIsSearchOpen] = useRecoilState(searchState)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [isGlobeOpen, setIsGlobeOpen] = useState<boolean>(false)
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
  const [language, setLanguage] = useState<string>('kor')

  const userNotExistPaths = ['/', '/login']
  const isUserNotExist = userNotExistPaths.includes(location.pathname)
  const isStudent = location.pathname.includes('student')
  const isProfessor = location.pathname.includes('professor')

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInsideAlert = target.closest(`.${styles.alert}`)
      const isInsideGlobe = target.closest(`.${styles.globe}`)
      const isInsideProfile = target.closest(`.${styles.profile}`)
      if (!isInsideAlert && !isInsideGlobe && !isInsideProfile) {
        setIsAlertOpen(false)
        setIsGlobeOpen(false)
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // useBlockNavigation()
  const handleSearchBox = () => {
    setIsSearchOpen(true)
  }

  const toggleAlert = () => {
    if (auth.id) {
      setIsAlertOpen((prev) => {
        if (!prev) {
          setIsGlobeOpen(false)
          setIsProfileOpen(false)
        }
        return !prev
      })
    } else {
      navigate('/login', { replace: true })
    }
  }

  const handleLanguage = () => {
    setIsGlobeOpen((prev) => {
      if (!prev) {
        setIsAlertOpen(false)
        setIsProfileOpen(false)
      }
      return !prev
    })
  }

  const toggleProfile = () => {
    if (auth?.id) {
      setIsProfileOpen((prev) => {
        if (!prev) {
          setIsAlertOpen(false)
          setIsGlobeOpen(false)
        }
        return !prev
      })
    }
  }

  const selectLanguage = (lang: string) => {
    setLanguage(lang)
    setIsGlobeOpen(false)
  }

  return (
    <>
      <SearchBox />
      <header className={styles.header}>
        <div>
          <Link
            to={
              auth === null
                ? '/'
                : auth.role === 'student'
                ? '/student'
                : auth.role === 'professor'
                ? '/professor'
                : '/'
            }
          >
            <h1>
              <Logo />
            </h1>
          </Link>
          {!isUserNotExist &&
            (isStudent ? (
              <nav>
                <NavLink to='/student/upcoming'>수강예정</NavLink>
                <NavLink to='/student/learning'>수강중</NavLink>
                <NavLink to='/student/finished'>수강완료</NavLink>
              </nav>
            ) : isProfessor ? (
              <nav>
                <NavLink to='/professor/metahuman'>AI 프로페서</NavLink>
                {/* <NavLink to='/professor/learning'>강의 학습</NavLink> */}
                <NavLink to='/professor/create'>강의생성</NavLink>
                <NavLink to='/professor/dashboard'>강의관리</NavLink>
              </nav>
            ) : null)}
          <ul>
            <li
              className={`${styles.alert} ${
                isAlertOpen ? styles.active : ''
              } ${styles}`}
            >
              <button onClick={toggleAlert}>
                <Bell />
              </button>
              <div>
                <div>알림</div>
                {/* <div className={styles.empty}> */}
                <div>
                  <ul>
                    {/* <li>새로운 알림이 없습니다.</li> */}
                    {isStudent ? (
                      <>
                        <li>
                          <div>
                            <p>강의 예정</p>
                            <span>12월 03일</span>
                          </div>
                          <p>여성 간호학 과목이 등록 되습니다.</p>
                          <span>MASTER</span>
                        </li>
                        <li>
                          <div>
                            <p>강의 진행</p>
                            <span>12월 01일</span>
                          </div>
                          <p>여성간호학 과목 2주차 강의를 수강해 주세요.</p>
                          <span>MASTER</span>
                        </li>
                        <li>
                          <div>
                            <p>강의 완료</p>
                            <span>12월 01일</span>
                          </div>
                          <p>
                            여성간호학 과목 1주차 강의를 수강 완료 하였습니다.
                          </p>
                          <span>MASTER</span>
                        </li>
                      </>
                    ) : isProfessor ? (
                      <>
                        <li>
                          <div>
                            <p>강의 만들기</p>
                            <span>12월 03일</span>
                          </div>
                          <p>영상 생성이 완료 되었어요.</p>
                          <span>소셜 미디어 마케팅 전략</span>
                        </li>
                        <li>
                          <div>
                            <p>메타휴먼</p>
                            <span>12월 01일</span>
                          </div>
                          <p>
                            새로운 옵션이 추가되었어요.새로운 옵션이
                            추가되었어요.새로운 옵션이 추가되었어요.
                          </p>
                          <span>MASTER</span>
                        </li>
                        <li>
                          <div>
                            <p>강의 학습</p>
                            <span>12월 01일</span>
                          </div>
                          <p>새로운 학습이 추가되었어요.</p>
                          <span>MASTER</span>
                        </li>
                      </>
                    ) : (
                      <li>새로운 알림이 없습니다.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <Info />
                  알림은 30일 동안 보관됩니다.
                </div>
              </div>
            </li>
            <li>
              <button
                onClick={
                  auth?.id
                    ? handleSearchBox
                    : () => navigate('/login', { replace: true })
                }
              >
                <Search />
              </button>
            </li>
            <li
              onClick={handleLanguage}
              className={`${styles.globe} ${isGlobeOpen ? styles.active : ''}`}
            >
              <span>{language === 'kor' ? <Kor /> : <Eng />}</span>
              <div>
                <ul>
                  <li
                    onClick={() => selectLanguage('kor')}
                    className={`${language === 'kor' ? styles.on : ''}`}
                  >
                    한국어
                  </li>
                  <li
                    onClick={() => selectLanguage('eng')}
                    className={`${language === 'eng' ? styles.on : ''}`}
                  >
                    English
                  </li>
                </ul>
              </div>
            </li>
            {auth?.id ? (
              <>
                <li
                  className={`${styles.profile} ${
                    isProfileOpen ? styles.active : ''
                  }`}
                  onClick={toggleProfile}
                >
                  <button>
                    {auth.profileImage ? (
                      <div
                        style={{
                          backgroundImage: `url(${auth.profileImage})`,
                        }}
                      ></div>
                    ) : (
                      <div>
                        <Profile />
                      </div>
                    )}
                    <p>
                      <span>{auth.nm}</span>님
                    </p>
                    <Drop />
                  </button>
                  <div>
                    <ul>
                      <li
                        onClick={() => navigate('/mypage')}
                        className={`${
                          location.pathname === '/mypage' ? styles.on : ''
                        }`}
                      >
                        프로필
                      </li>
                      <li onClick={handleLogout}>로그아웃</li>
                    </ul>
                  </div>
                </li>
              </>
            ) : (
              !auth && (
                <li>
                  <Link to='/login'>로그인</Link>
                </li>
              )
            )}
          </ul>
        </div>
      </header>
    </>
  )
}

export default Header
