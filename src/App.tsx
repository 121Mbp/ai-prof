import { useEffect } from 'react'
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { authState } from './state/authState'
import { recordingState } from './state/recordingState'
import { webSocketState } from './state/webSocketState'
import '@/index.css'
import '@/App.css'
import styles from './assets/styles/Layout.module.scss'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Home from './pages/home/Home'
import SearchPage from './pages/search/SearchPage'
import Login from './pages/login/Login'
import Mypage from './pages/login/Mypage'
import { checkAuthenticate } from './components/common/Authenticate'
import StudentLayout from './pages/student/StudentLayout'
import StudentMain from './pages/student/StudentMain'
import StudentUpcoming from './pages/student/StudentUpcoming'
import StudentLearning from './pages/student/StudentLearning'
import StudentFinished from './pages/student/StudentFinished'
import ProfessorLayout from './pages/professor/ProfessorLayout'
import ProfessorMain from './pages/professor/ProfessorMain'
import ProfessorMetahuman from './pages/professor/ProfessorMetahuman'
import ProfessorMetahumanGenerate from './pages/professor/ProfessorMetahumanGenerate'
import ProfessorLearning from './pages/professor/ProfessorLearning'
import ProfessorLecturPlan from './pages/professor/ProfessorLecturePlan'
import ProfessorLectureCreate from './pages/professor/ProfessorLectureCreate'
import ProfessorDashboard from './pages/professor/ProfessorDashboard'
import LectureMain from './pages/lecture/LectureMain'
import Spinner from './components/common/Spinner'
import LayerPopup from './components/common/LayerPopup'

const App: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [auth, setAuth] = useRecoilState(authState)
  const [mediaStream, setMediaStream] = useRecoilState(recordingState)
  const [socket, setSocket] = useRecoilState(webSocketState)

  useEffect(() => {
    window.scrollTo(0, 0)
    checkAuthenticate({ auth, setAuth, navigate, location })
    document.body.style.background =
      location.pathname === '/professor/create' ||
      location.pathname.includes('/dashboard/') ||
      location.pathname.includes('/learning/')
        ? '#F7F7F8'
        : 'none'
  }, [location, location.pathname, navigate, auth, setAuth])

  const stopRecording = () => {
    if (mediaStream) {
      console.log('페이지 이동 마이크 off')
      mediaStream.getTracks().forEach((track) => {
        track.stop()
      })
      setMediaStream(null)
    }

    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] 연결 off')
        socket.send('EOS')
        socket.close()
      }
      setSocket(null)
    }
  }

  useEffect(() => {
    if (!location.pathname.includes('/learning/')) {
      stopRecording()
    }
  }, [location.pathname, stopRecording])

  const handleLogout = () => {
    setAuth({ user: null })
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <Header
        auth={auth}
        handleLogout={handleLogout}
      />
      <main className={styles.main}>
        <Routes>
          <Route
            path='*'
            element={<Navigate to='/' />}
          />
          <Route
            path='/'
            element={<Home />}
          />
          <Route
            path='/login'
            element={<Login />}
          />
          <Route
            path='/mypage'
            element={<Mypage />}
          />
          <Route
            path='/search'
            element={<SearchPage />}
          />
          <Route
            path='/student'
            element={<StudentLayout />}
          >
            <Route
              path=''
              element={<StudentMain />}
            />
            <Route
              path='upcoming'
              element={<StudentUpcoming />}
            />
            <Route
              path='learning'
              element={<StudentLearning />}
            />
            <Route
              path='finished'
              element={<StudentFinished />}
            />
            <Route
              path='learning/:id/:subId'
              element={<LectureMain />}
            />
          </Route>
          <Route
            path='/professor'
            element={<ProfessorLayout />}
          >
            <Route
              path=''
              element={<ProfessorMain />}
            />
            <Route
              path='metahuman'
              element={<ProfessorMetahuman />}
            >
              <Route
                path='generate'
                element={<ProfessorMetahumanGenerate />}
              />
              <Route
                path='generate/:id'
                element={<ProfessorMetahumanGenerate />}
              />
            </Route>
            <Route
              path='learning'
              element={<ProfessorLearning />}
            />
            <Route
              path='create'
              element={<ProfessorLecturPlan />}
            />
            <Route
              path='dashboard'
              element={<ProfessorDashboard />}
            >
              <Route
                path=':id'
                element={<ProfessorLecturPlan />}
              />
              <Route
                path=':id/:subId'
                element={<ProfessorLectureCreate />}
              />
              <Route
                path='learning/:id/:subId'
                element={<LectureMain />}
              />
            </Route>
          </Route>
        </Routes>
        <Spinner />
        <LayerPopup />
      </main>
      <Footer />
    </>
  )
}

export default App
