import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import styles from '@/assets/styles/Lecture.module.scss'
import { useRecoilState, useRecoilValue } from 'recoil'
import { authState } from '../../state/authState'
import { layerpopupState } from '../../state/layerpopupState'
import { spinnerState } from '../../state/spinnerState'
import LectureTitle from '../../components/lecture/LectureTitle'
import LectureCurriculum from '../../components/lecture/LectureCurriculum'
// import LectureData from '../../components/lecture/LectureData'
import LectureChat from '../../components/lecture/LectureChat'
import VideoPlayer from '../../components/common/VideoPlayer'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import BatchAPI from '../../components/lecture/BatchAPI'

const LectureMain: React.FC = () => {
  const { id, subId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const auth: any = useRecoilValue(authState)
  const [lectureDetail, setLectureDetail] = useState<any>([])
  const [lectureData, setLectureData] = useState<any>([])
  const [lctrWeekList, setLctrWeekList] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [contentsData, setContentsData] = useState<any | null>(null)
  const [tempsData, setTempsData] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [currentProgress, setCurrentProgress] = useState<number>(0)
  const [completeProgress, setCompleteProgress] = useState<number>(0)
  const [saveProgress, setSaveProgress] = useState<number>(0)
  const [, setLayer] = useRecoilState(layerpopupState)
  const [, setIsLoding] = useRecoilState(spinnerState)
  const [isDataFetched, setIsDataFetched] = useState(false)
  const [voidNotPage, setVoidNotPage] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<string>('null')
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<any>(null)

  const videoDataCache: any = {}

  const fetchLecture = async () => {
    setIsLoding(true)
    try {
      const [
        { data: subjectInfo },
        { data: lectureData },
        { data: chapterData },
        { data: historyData },
      ] = await Promise.all([
        api.post(`${apiConfig.prof.subject.subjectInfo}`, { sbjId: id }),
        api.post(`${apiConfig.prof.lecture.lectureInfo}`, { sbjId: id }),
        api.post(`${apiConfig.prof.lecture.chapterInfo}`, { lctrId: subId }),
        api.post(`${apiConfig.prof.learning.learningHistoryInfo}`, {
          userId: auth.id,
          lctrId: subId,
        }),
      ])

      const updatedData = await Promise.all(
        chapterData?.chapInfo.map(async (item: any) => {
          if (!item?.videoPath?.startsWith('/workspace')) return item

          if (item.videoPath in videoDataCache) {
            return { ...item, videoPath: videoDataCache[item.videoPath] }
          }

          try {
            const pathParts = item.videoPath.split('/')
            const folder = pathParts.at(-2)
            const filename = pathParts.at(-1)

            const videoPath = `${import.meta.env.VITE_HOST_NAME}${
              apiConfig.prof.video.download
            }/${folder}/${filename}`

            videoDataCache[item.videoPath] = videoPath

            return { ...item, videoPath }
          } catch (error) {
            console.warn(error)
          }
          return item
        })
      )

      const crclmData = lectureData.crclm.find(
        (item: any) => item.lctrId == subId
      )

      const mergedLectureDetail = {
        ...subjectInfo,
        ...crclmData,
      }

      setLectureDetail(mergedLectureDetail)
      setLectureData(subjectInfo.lctrData)

      const crclmInfo = lectureData.crclm.map(
        (item: { lctrId: any; week: any }) => ({
          lctrCd: item.lctrId,
          lctrNm: `${item.week} 주차`,
        })
      )

      setLctrWeekList(crclmInfo)

      if (historyData.learningHistory.length === 0) {
        fecthDataAllChapters(updatedData)
      }

      const data = await mergeChapterData(
        updatedData,
        historyData.learningHistory
      )

      setContents(data)
      // setContents(updatedData)

      const initialActiveIndex = data.findIndex(
        (content: { isActive: string }) => content?.isActive === 'true'
      )
      const activeIndexToSet =
        initialActiveIndex !== -1 ? initialActiveIndex : 0

      setActiveIndex(activeIndexToSet)
      setContentsData(data[activeIndexToSet])

      setTimeout(() => {
        updateProgress(data[activeIndexToSet])
        setActiveTab(0)
      }, 10)
    } catch (error) {
      console.warn(error)
      navigate(auth.role === 'professor' ? `/professor` : `/student`)
    }
  }

  useEffect(() => {
    if (auth.id && !isDataFetched) {
      fetchLecture()
      setIsDataFetched(true)
    }
  }, [auth.id, subId])

  useEffect(() => {
    if (isRecording === 'true') {
      setActiveTab(2)
    }
  }, [isRecording])

  const mergeChapterData = (chapInfo: any, learningHistory: any) => {
    return chapInfo.map((chapter: any) => {
      const history = learningHistory.find(
        (item: any) => item.chapId === chapter.chapId
      )
      return {
        ...chapter,
        ...history,
      }
    })
  }

  const fecthDataAllChapters = async (chapInfo: any) => {
    console.log('해당 강의에 처음 접속하였습니다.')
    try {
      const promises = chapInfo.map((content: any) =>
        api.post(`${apiConfig.prof.learning.learningHistory}`, {
          lctrId: subId,
          userId: auth.id,
          chapId: content.chapId,
          cmplTime: 0,
          saveTime: 0,
        })
      )
      await Promise.all(promises)
    } catch (error) {
      console.warn(error)
    }
  }

  const updateProgress = (contentData: any) => {
    if (!contentData) return
    // setIsLoding(false)
    setVoidNotPage(true)
    const complete = (contentData.cmplTime / contentData.endTime) * 100 || 0
    const save = (contentData.saveTime / contentData.endTime) * 100 || 0
    setCompleteProgress(0)
    setSaveProgress(0)
    setCurrentProgress(0)
    setCompleteProgress(complete)
    setSaveProgress(save === 100 ? 0 : save)
  }

  const sendChapterHistory = async (
    cmplprogress: number,
    progress: number,
    contentData: any
  ) => {
    if (
      !contentData ||
      cmplprogress === null ||
      isNaN(cmplprogress) ||
      progress === null ||
      isNaN(progress)
    )
      return
    try {
      await api.post(`${apiConfig.prof.learning.learningHistory}`, {
        userId: auth.id,
        lctrId: subId,
        chapId: contentData.chapId,
        cmplTime: (cmplprogress / 100) * contentData.endTime,
        saveTime: (progress / 100) * contentData.endTime,
      })
    } catch (error) {
      console.warn('Failed to send complete progress:', error)
    }
  }

  const sendChapterIsActive = async (contentData: any) => {
    if (!contentData) return
    try {
      await api.post(`${apiConfig.prof.learning.learningActive}`, {
        userId: auth.id,
        lctrId: subId,
        chapId: contentData.chapId,
        isActive: 'true',
      })
    } catch (error) {
      console.warn('Failed to update chapter active state:', error)
    }
  }

  useEffect(() => {
    if (activeIndex !== null && tempsData) {
      sendChapterHistory(completeProgress, saveProgress, tempsData)
      setIsLoding(false)
      if (activeIndex === contents.length) {
        setTimeout(() => {
          setLayer({
            isOpen: true,
            title: '축하합니다.',
            message: '모든 챕터의 강의를 시청 완료 하였습니다.',
          })
        }, 800)
        return // 종료
      }
    }

    if (activeIndex !== null && contents[activeIndex]) {
      const nextContent = contents[activeIndex]
      sendChapterIsActive(nextContent)
      setIsLoding(true)

      setTimeout(() => {
        setTempsData(nextContent)
        setContentsData(nextContent)

        if (nextContent.chapId !== tempsData?.chapId) {
          fetchLecture()
        }

        setTimeout(() => {
          setIsLoding(false)
        }, 500)
      }, 1000)
    }
  }, [activeIndex, contentsData])

  useEffect(() => {
    const handlePageLeave = () => {
      sendChapterHistory(completeProgress, saveProgress, tempsData)
    }

    window.addEventListener('popstate', handlePageLeave)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function () {
      handlePageLeave()
      return originalPushState.apply(history, arguments as any)
    }

    history.replaceState = function () {
      handlePageLeave()
      return originalReplaceState.apply(history, arguments as any)
    }
    return () => {
      window.removeEventListener('popstate', handlePageLeave)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [completeProgress, tempsData, location])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      if (tempsData) {
        sendChapterHistory(completeProgress, saveProgress, tempsData)
      }
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [completeProgress, tempsData])

  const handleTabIndex = (index: number) => {
    setActiveTab(index)
  }

  return (
    <>
      {voidNotPage && (
        <div className={styles.lecture}>
          <div>
            <LectureTitle
              subId={subId}
              department={lectureDetail?.deptNm}
              subject={lectureDetail?.sbjNm}
              grade={lectureDetail?.grade}
              semester={lectureDetail?.smst}
              title={lectureDetail?.title}
              lctrWeekList={lctrWeekList}
              setIsDataFetched={setIsDataFetched}
            />
            <VideoPlayer
              subId={subId}
              auth={auth.id}
              contents={contents}
              contentsData={contentsData}
              setContentsData={setContentsData}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              currentProgress={currentProgress}
              setCurrentProgress={setCurrentProgress}
              completeProgress={completeProgress}
              setCompleteProgress={setCompleteProgress}
              saveProgress={saveProgress}
              setSaveProgress={setSaveProgress}
              preview={false}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              isSpeaking={isSpeaking}
              setIsSpeaking={setIsSpeaking}
            />
            <p>{lectureDetail?.lctrSbj}</p>
            <BatchAPI
              userId={auth.id}
              sbjId={id}
              lctrId={subId}
              subject={lectureDetail?.sbjNm}
              transcript={transcript}
              setTranscript={setTranscript}
              contentsData={contentsData}
              isRecording={isRecording ?? undefined}
              setIsRecording={setIsRecording}
              isSpeaking={isSpeaking}
              setIsSpeaking={setIsSpeaking}
            />
          </div>
          <div>
            <ul>
              <li className={activeTab === 0 ? styles.on : ''}>
                <button onClick={() => handleTabIndex(0)}>강의목차</button>
              </li>
              {/* <li className={activeTab === 1 ? styles.on : ''}>
              <button onClick={() => handleTabIndex(1)}>강의자료</button>
            </li> */}
              <li className={activeTab === 2 ? styles.on : ''}>
                <button onClick={() => handleTabIndex(2)}>학습활동</button>
              </li>
            </ul>
            <div>
              {activeTab === 0 && (
                <LectureCurriculum
                  title={lectureDetail?.title}
                  contents={contents}
                  activeIndex={activeIndex ?? 0}
                  setActiveIndex={setActiveIndex}
                  setContentsData={setContentsData}
                  lectureData={lectureData}
                />
              )}
              {/* {activeTab === 1 && <LectureData lectureData={lectureData} />} */}
              {activeTab === 2 && (
                <LectureChat
                  userId={auth.id}
                  sbjId={id}
                  lctrId={subId}
                  subject={lectureDetail?.sbjNm}
                  contentsData={contentsData}
                  transcript={transcript}
                  setTranscript={setTranscript}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LectureMain
