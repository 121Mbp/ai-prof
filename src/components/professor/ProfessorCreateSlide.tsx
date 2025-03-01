import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useRecoilState, useRecoilValue } from 'recoil'
import { authState } from '../../state/authState'
import { spinnerState } from '../../state/spinnerState'
import { layerpopupState } from '../../state/layerpopupState'
import styles from './../../assets/styles/CreateLecture.module.scss'
import CanvasEditor from '../../components/lecture/CanvasEditor'
import ProfessorCreatePreviewLayer from '../../components/professor/ProfessorCreatePreviewLayer'
import Tooltip from '../common/Tooltip'
// import api from '../../utils/apiService'
// import apiConfig from '../../utils/apiConfig.json'
import Add from '@/assets/svg/adds.svg?react'
import Edit from '@/assets/svg/edit.svg?react'
import Copies from '@/assets/svg/duplication.svg?react'
import Comment from '@/assets/svg/comment.svg?react'
import Emoji from '@/assets/svg/image.svg?react'
import Remove from '@/assets/svg/dismiss.svg?react'

interface Element {
  id: string
  type: string
  props: any
}

interface Slide {
  id: string | null
  elements: Element[] | null
  notes: string | null
  slide: string | null
}

interface ProfessorCreateSlideProps {
  setContents: (contents: any) => void
  items: any
  selectedItem: any
  selectedItemId: string
  currentSlideIndex: number
  setCurrentSlideIndex: (currentSlideIndex: number) => void
  selectedSlide: Slide[]
  setSelectedSlide: (slide: Slide[]) => void
  handleSlideUpdate: (updatedSlides: Slide[]) => void
  selectedMetaHuman: any[]
  selectedBackground: any[]
  lectureView: boolean
  handleLectureSave: () => void
}

interface CanvasElementProps {
  id: string
  type: any
  props: any
}

interface ProfessorSlideRef {
  stageRef: any
}

const ProfessorCreateSlide = forwardRef<
  ProfessorSlideRef,
  ProfessorCreateSlideProps
>(
  (
    {
      selectedItem,
      selectedItemId,
      currentSlideIndex,
      setCurrentSlideIndex,
      selectedSlide,
      setSelectedSlide,
      handleSlideUpdate,
      selectedMetaHuman,
      selectedBackground,
      lectureView,
      handleLectureSave,
    },
    ref
  ) => {
    const { id, subId } = useParams()
    const navigate = useNavigate()
    const stageRef = useRef<any>(null)
    const auth: any = useRecoilValue(authState)
    const [isEditor, setIsEditor] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [previewVideo] = useState<string | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [layer, setLayer] = useRecoilState(layerpopupState)
    const [, setLoading] = useRecoilState<boolean>(spinnerState)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [localElements, setLocalElements] = useState<CanvasElementProps[]>([])
    const [history, setHistory] = useState<CanvasElementProps[][]>([])
    const [currentStep, setCurrentStep] = useState<number>(-1)
    const currentSlide =
      selectedSlide && selectedSlide.length > 0
        ? selectedSlide[currentSlideIndex]
        : null

    useImperativeHandle(ref, () => ({
      stageRef: stageRef.current,
      toDataURL: () => {
        if (stageRef.current) {
          return stageRef.current.toDataURL({ pixelRatio: 2 })
        }
        return null
      },
    }))

    useEffect(() => {
      if (currentSlide && selectedItemId) {
        setCurrentSlideIndex(0)
        setHistory([])
        setCurrentStep(-1)
        setSelectedId(null)
        setIsEditor(false)
        if (selectedSlide[currentSlideIndex]?.elements) {
          const elements = selectedSlide[currentSlideIndex].elements
          if (elements && elements.length > 0) {
            setHistory([elements])
            setCurrentStep(0)
          }
        }
      }
    }, [selectedItemId])

    useEffect(() => {
      if (currentSlide !== null) {
        setHistory([])
        setCurrentStep(-1)
        setSelectedId(null)
        setIsEditor(false)
        if (selectedSlide[currentSlideIndex]?.elements) {
          const elements = selectedSlide[currentSlideIndex].elements
          if (elements && elements.length > 0) {
            setHistory([elements])
            setCurrentStep(0)
          }
        }
      }
    }, [currentSlideIndex])

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!currentSlide) return
      const updatedSlides = [...selectedSlide]
      updatedSlides[currentSlideIndex].notes = e.target.value
      setSelectedSlide(updatedSlides)
    }

    const handleAddSlide = async () => {
      if (selectedSlide.length >= 8) {
        setLayer({
          isOpen: true,
          title: '알림',
          message: '슬라이드는 최대 8개까지만 만들 수 있습니다.',
        })
        return false
      }
      const currentChapter = selectedSlide[0]?.slide?.split('-') ?? []
      const newSlide: Slide = {
        id: `${uuidv4()}`,
        elements: [],
        notes: '',
        slide: `${currentChapter[0]}-${selectedSlide.length + 1}`,
      }
      setSelectedSlide([...selectedSlide, newSlide])
      handleSlideUpdate([...selectedSlide, newSlide])
      setCurrentSlideIndex(selectedSlide.length)
      setTimeout(() => {
        setIsEditor(true)
      }, 400)
    }

    const handleRemoveSlide = (index: number) => {
      if (selectedSlide.length <= 1) return
      const updatedSlides = selectedSlide.filter((_, i) => i !== index)
      setSelectedSlide(updatedSlides)
      handleSlideUpdate(updatedSlides)
      setLayer((prev) => ({
        ...prev,
        isOpen: false,
      }))
      setTimeout(() => {
        setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))
      }, 80)
    }

    const handleCopySlide = () => {
      if (!currentSlide) return
      const newSlide: Slide = {
        ...currentSlide,
        id: `${uuidv4()}`,
      }
      const updatedSlides = [...selectedSlide, newSlide]
      setSelectedSlide(updatedSlides)
      handleSlideUpdate(updatedSlides)
      setCurrentSlideIndex(updatedSlides.length - 1)
    }

    const handleElementChange = (updatedElements: Element[]) => {
      if (!currentSlide) return
      const updatedSlides = [...selectedSlide]
      updatedSlides[currentSlideIndex].elements = updatedElements
      setSelectedSlide(updatedSlides)
    }

    const handleSave = () => {
      const updatedSlides = [...selectedSlide]
      updatedSlides[currentSlideIndex] = {
        ...updatedSlides[currentSlideIndex],
        elements: localElements,
      }

      handleLectureSave()
    }

    // const checkStatus = async (id: string) => {
    //   try {
    //     const response = await api.post(
    //       `${apiConfig.prof.metahuman.encodingStatus}`,
    //       {
    //         userId: auth.id,
    //         requestId: id,
    //       }
    //     )
    //     console.log('progress_percentage', response.data.progressPercentage)
    //     if (response.data.statusCode === '2000') {
    //       return true
    //     }
    //   } catch (error) {
    //     console.warn('Error checking status', error)
    //   }
    //   return false
    // }

    // const downloadUri = async (id: string) => {
    //   try {
    //     const response = await api.post(
    //       `${apiConfig.prof.metahuman.videoDownload}`,
    //       {
    //         userId: auth.id,
    //         requestId: id,
    //       }
    //     )
    //     console.log('response.video.download', response.data)
    //     const data = response.data.downloadUri

    //     setPreviewVideo(data)
    //   } catch (error) {
    //     console.warn(error)
    //   }
    // }

    const handlePreviewLayer = async () => {
      console.log('Selected Item', selectedItem)
      setLoading(true)
      const requestPayload = {
        userId: auth.id,
        chapters: [
          {
            chapter: selectedItem.chapOrder,
            pages: [
              {
                page: 1,
                // bgScreenUri: selectedBackground[0].lctrBgPath,
                bgScreenUri: '',
                messages: currentSlide?.notes,
              },
            ],
          },
        ],
      }
      console.log('requestPayload', requestPayload)
      // try {
      //   const response = await api.post(
      //     `${apiConfig.prof.metahuman.videoGenerate}`,
      //     requestPayload
      //   )
      //   console.log('generate video', response)
      //   const requestId = response.data.requestId

      //   const intervalId = setInterval(async () => {
      //     if (await checkStatus(requestId)) {
      //       clearInterval(intervalId)
      //       await downloadUri(requestId)
      //       if (stageRef.current) {
      //         const dataURL = stageRef.current.toDataURL({
      //           pixelRatio: 2,
      //         })
      //         setPreviewImage(dataURL)
      //       }
      //       setLoading(false)
      //       setIsOpen(!isOpen)
      //     }
      //   }, 2000)
      // } catch (error) {
      //   console.warn(error)
      //   setLoading(false)
      // }
      if (stageRef.current) {
        const dataURL = stageRef.current.toDataURL({
          pixelRatio: 2,
        })
        setPreviewImage(dataURL)
      }
      setLoading(false)
      setIsOpen(!isOpen)
    }

    const handleDuplication = () => {
      setLayer({
        isOpen: true,
        title: '확인',
        message: `강의가 복사되었어요!<br /><span>해당 강의는 강의관리에서 확인하실 수 있습니다.</span>`,
        single: {
          text: '바로 가기',
          function: () => {},
        },
      })
    }

    return (
      <div className={`${styles.slide}`}>
        <>
          <div>
            <div>강의 미리보기</div>
            <div>
              <button
                onClick={handleAddSlide}
                disabled={lectureView}
              >
                <Add />
                <Tooltip message={'슬라이드 추가'} />
              </button>
              <button
                onClick={() => setIsEditor(!isEditor)}
                disabled={lectureView}
              >
                <Edit />
                <Tooltip message={'슬라이드 수정'} />
              </button>
              <button
                onClick={handleCopySlide}
                disabled={lectureView}
              >
                <Copies />
                <Tooltip message={'슬라이드 복사'} />
              </button>
              <button
                // onClick={() => handleRemoveSlide(currentSlideIndex)}
                onClick={() =>
                  setLayer({
                    isOpen: true,
                    title: '경고',
                    message: '해당 슬라이드를 삭제 하시겠습니까?',
                    double: {
                      left: {
                        text: '취소',
                        function: () => {
                          setLayer({ ...layer, isOpen: false })
                        },
                      },
                      right: {
                        text: '삭제',
                        function: () => handleRemoveSlide(currentSlideIndex),
                      },
                    },
                  })
                }
                disabled={lectureView}
              >
                <Remove />
                <Tooltip message={'슬라이드 삭제'} />
              </button>
            </div>
          </div>
          <div>
            {selectedSlide && selectedSlide.length > 0 ? (
              <>
                <CanvasEditor
                  ref={stageRef || null}
                  elements={currentSlide?.elements || []}
                  localElements={localElements}
                  setLocalElements={setLocalElements}
                  onElementsChange={handleElementChange}
                  selectedId={selectedId || ''}
                  setSelectedId={setSelectedId}
                  history={history}
                  setHistory={setHistory}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  isEditor={isEditor}
                />
                <ul>
                  {selectedSlide
                    // ?.slice()
                    .sort((a: any, b: any) => {
                      const slideA = a.slide.split('-').map(Number)
                      const slideB = b.slide.split('-').map(Number)
                      if (slideA[0] !== slideB[0]) return slideA[0] - slideB[0]
                      return slideA[1] - slideB[1]
                    })
                    .map((slide, index) => (
                      <li
                        key={slide.id}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={
                          index === currentSlideIndex ? styles.active : ''
                        }
                      >
                        {slide.elements?.some((el) => el.type === 'text') ? (
                          <Comment />
                        ) : (
                          <Emoji />
                        )}
                      </li>
                    ))}
                </ul>
                <div>강의 스크립트</div>
                <textarea
                  value={currentSlide?.notes || ''}
                  onChange={handleNotesChange}
                  disabled={lectureView}
                ></textarea>
                <div>
                  {lectureView ? (
                    <>
                      <button
                        onClick={() =>
                          navigate(
                            `/professor/dashboard/learning/${id}/${subId}`
                          )
                        }
                      >
                        강의 보러가기
                      </button>
                      <button onClick={handleDuplication}>복사하기</button>
                    </>
                  ) : (
                    <>
                      <button onClick={handlePreviewLayer}>미리보기</button>
                      <button onClick={handleSave}>저장하기</button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={styles.void}></div>
                <ul>
                  <li>
                    <Comment />
                  </li>
                </ul>
                <div>강의 스크립트</div>
                <textarea
                  readOnly
                  value={''}
                ></textarea>
                <div>
                  {lectureView ? (
                    <>
                      <button disabled>강의 보러가기</button>
                      <button disabled>복사하기</button>
                    </>
                  ) : (
                    <>
                      <button disabled>미리보기</button>
                      <button disabled>저장하기</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </>
        {isOpen && (
          <ProfessorCreatePreviewLayer
            setIsOpen={setIsOpen}
            previewImage={previewImage || ''}
            previewVideo={previewVideo || ''}
            selectedBackground={selectedBackground}
            selectedMetaHuman={selectedMetaHuman}
          />
        )}
      </div>
    )
  }
)

export default ProfessorCreateSlide
