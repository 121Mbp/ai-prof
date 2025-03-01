import { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useRecoilValue, useRecoilState } from 'recoil'
import { authState } from '../../state/authState'
import { departmentState } from '../../state/departmentState'
import { spinnerState } from '../../state/spinnerState'
import { layerpopupState } from '../../state/layerpopupState'
import styles from './../../assets/styles/CreateLecture.module.scss'
import ProfessorCreateAside from '../../components/professor/ProfessorCreateAside'
import ProfessorCreateLoadLayer from '../../components/professor/ProfessorCreateLoadLayer'
import { updateThumbnailPaths } from '../../components/common/BlobObjectURL'
import { processSlidesRatiosRequest } from '../../components/common/ElementsRatio'
import Select from '../../components/common/Select'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import Dialog from '../../components/common/Dialog'
import Explore from '@/assets/svg/explore.svg?react'
import Encoding from '@/assets/svg/encoding.svg?react'
import Remove from '@/assets/svg/remove.svg?react'

import { sn, sw, pt } from '../../utils/subjects'

const ProfessorCreate: React.FC = () => {
  const { id, subId } = useParams()
  const navigate = useNavigate()
  const mounted = useRef(true)
  const data = useOutletContext<any>()
  const chapterRef = useRef<any>(null)
  const stageRef = useRef<any>(null)
  const auth: any = useRecoilValue(authState)
  const departmentList: any = useRecoilValue(departmentState)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [sbjData, setSbjData] = useState<any>(null)
  const [lctrWeekList, setLctrWeekList] = useState<any>(null)
  const [courseList, setCourseList] = useState<any[]>([])
  const [contents, setContents] = useState<any>({})
  const [lectureView, setLectureView] = useState<boolean>(false)
  const [title, setTitle] = useState<string>('')
  const [dataList, setDataList] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [dialog, setDialog] = useState<boolean>(false)
  const [, setLayer] = useRecoilState(layerpopupState)
  const [, setLoading] = useRecoilState<boolean>(spinnerState)
  const [items, setItems] = useState<any[]>([])
  const [encoding, setEncoding] = useState<boolean>(false)
  const [lectureTitle, setLectureTitle] = useState<string>('')
  const [lectureSubject, setLectureSubject] = useState<string>('')
  const [lectureTarget, setLectureTarget] = useState<string>('')
  const [selectedLearningItem, setSelectedLearningItem] = useState<any[]>([])
  const [selectedMetaHuman, setSelectedMetaHuman] = useState<any[]>([])
  const [selectedBackground, setSelectedBackground] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setUploadedImage] = useState<File | null>(null)
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null)
  // const [, setPresentation] = useState<any[]>([])
  const [lectureDateDialog, setLectureDateDialog] = useState<boolean>(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [defaultData, setDefaultData] = useState({
    department: '',
    course: '',
    years: [] as number[],
    semester: '',
    education: '',
    week: '',
    // langague: 'kr',
  })

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const fieldDataReset = () => {
    setLectureTitle('')
    setLectureSubject('')
    setLectureTarget('')
    setSelectedMetaHuman([])
    setSelectedBackground([])
    setUploadedImagePreview('')
    setContents({})
    setEncoding(false)
  }

  useEffect(() => {
    fieldDataReset()
  }, [subId])

  const fetchLecture = async () => {
    setLoading(true)
    try {
      const [
        { data: subjectData },
        { data: lectureData },
        { data: chapterData },
        { data: scriptData },
      ] = await Promise.all([
        api.post(`${apiConfig.prof.subject.subjectInfo}`, { sbjId: id }),
        api.post(`${apiConfig.prof.lecture.lectureInfo}`, { sbjId: id }),
        api.post(`${apiConfig.prof.lecture.chapterInfo}`, { lctrId: subId }),
        api.get(`${apiConfig.prof.lecture.scriptInfo}?lectureId=${subId}`),
      ])

      // console.log('subjectInfo', subjectData)
      // console.log('lectureData', lectureData)
      // console.log('chapterData', chapterData)
      // console.log('scriptData', scriptData)
      if (auth.id && subjectData.prfsId !== auth.id) {
        navigate('/', { replace: true })
      }

      const crclmData = lectureData.crclm.map(
        (item: { lctrId: any; week: any }) => ({
          lctrCd: item.lctrId,
          lctrNm: `${item.week} 주차`,
        })
      )

      setSbjData(subjectData)
      setLctrWeekList(crclmData)

      const thisLecture = lectureData?.crclm?.find(
        (item: any) => item.lctrId === Number(subId)
      )

      const updatedInfoData = await updateThumbnailPaths(
        [thisLecture],
        'subject'
      )

      const chapters = chapterData?.chapInfo ?? []
      const slides = scriptData

      const mergedChapters = chapters?.map((chapter: any) => {
        const filteredSlides = slides?.find(
          (slide: any) => slide?.chapterId === chapter?.chapId
        )
        return {
          ...chapter,
          slides: filteredSlides ? filteredSlides?.slides : [],
        }
      })

      const dataArray = {
        ...updatedInfoData[0],
        chapters: mergedChapters,
      }

      setContents(dataArray)
      // setDataContents(data.chapters)
      setLectureView(
        subjectData.sbjStatus === '1' || (subjectData.sbjStatus === '2' && true)
      )
      setLectureTitle(dataArray?.title || '')
      setLectureSubject(dataArray?.lctrSbj || '')
      setLectureTarget(dataArray?.lrngGoal || ' ')
      setSelectedMetaHuman([
        data?.metahuman.find((m: any) => m.mthnId === dataArray?.mthnId) || [],
      ])
      setSelectedBackground([
        data?.background.find(
          (b: any) => b.lctrBgId === Number(dataArray?.lctrBg)
        ) || [],
      ])
      setUploadedImagePreview(dataArray?.thumbPath || '')

      const deptSelect = departmentList?.find(
        (item: any) => item?.deptCd === sbjData?.deptCd
      )

      setDefaultData({
        department: deptSelect?.deptCd,
        course: subjectData?.sbjNm,
        years: subjectData?.grade,
        semester: subjectData?.smst,
        education: subjectData?.sbjCrlm,
        week: subjectData?.weekNum,
      })

      const processing = chapterData.chapInfo.every(
        (lecture: { videoEncodingStatus: string }) =>
          lecture.videoEncodingStatus === 'NONE' ||
          lecture.videoEncodingStatus === 'COMPLETE'
      )
      setLoading(false)

      if (!processing) {
        fetchGenerateState()
      }
    } catch (error) {
      console.warn('Failed to fetch lecture data:', error)
    }
  }

  const fetchGenerateState = async () => {
    try {
      const response = await api.post(`${apiConfig.prof.lecture.chapterInfo}`, {
        lctrId: subId,
      })
      const data = response.data
      if (!mounted.current) return
      const updatedItems = items.map((item) => {
        const updatedStatus = data.chapInfo.find(
          (chapter: any) => chapter.chapId === item.chapId
        )?.videoEncodingStatus
        if (updatedStatus && updatedStatus !== item.videoEncodingStatus) {
          return { ...item, videoEncodingStatus: updatedStatus }
        }
        return item
      })

      setItems(updatedItems)
      const allComplete = data.chapInfo.every(
        (lecture: { videoEncodingStatus: string }) =>
          lecture.videoEncodingStatus === 'COMPLETE'
      )
      console.log('generate', allComplete)
      if (allComplete) {
        setEncoding(false)
      } else {
        setEncoding(true)
        if (mounted.current) {
          setTimeout(fetchGenerateState, 10000)
        }
      }
    } catch (error) {
      console.warn(error)
    }
  }

  useEffect(() => {
    if (auth.user !== null) {
      fetchLecture()
    }
  }, [auth, subId, courseList])

  useEffect(() => {
    switch (defaultData.department) {
      case '1':
        setCourseList(sn.map((course) => course.sbjNm))
        break
      case '2':
        setCourseList(sw.map((course) => course.sbjNm))
        break
      case '3':
        setCourseList(pt.map((course) => course.sbjNm))
        break
      default:
        setCourseList([])
    }
  }, [defaultData.department])

  const handleMetahumanList = () => {
    setTitle('메타 휴먼')
    setDataList(data.metahuman)
    setIsOpen(true)
  }

  const handleBackgroundList = () => {
    setTitle('강의 배경')
    setDataList(data.background)
    setIsOpen(true)
  }

  const handleChange = (key: string, value: any) => {
    setDefaultData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleCheckboxChange = (year: number) => {
    setDefaultData((prev) => {
      const years = prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year]
      return { ...prev, years }
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedImage(file)
      setUploadedImagePreview(URL.createObjectURL(file))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const capturePresentation = async () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 })
      const blob = dataURLtoBlob(dataURL)
      return URL.createObjectURL(blob)
    }
  }

  const dataURLtoBlob = (dataURL: any) => {
    const byteString = atob(dataURL.split(',')[1])
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeString })
  }

  const sendFormData = async (
    captures: { captureData: string; slidId: string }[],
    chapId: string
  ) => {
    const formData = new FormData()

    formData.append('chapId', chapId)
    for (const { captureData, slidId } of captures) {
      const file = await fetch(captureData)
        .then((res) => res.blob())
        .then((blob) => new File([blob], `${slidId}.png`, { type: blob.type }))

      formData.append('pptFiles', file)
    }

    formData.forEach((value, key) => {
      console.log(`${key}:`, value)
    })

    try {
      const response = await api.post(`${apiConfig.prof.video.ppt}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const result = response.data
      console.log(`${chapId}의 슬라이드 업로드 성공 ${result}`)
    } catch (error) {
      console.warn(error)
    }
  }

  const handleEncoding = async () => {
    setEncoding(!encoding)
    console.log('encoding', items)
    for (let i = 0; i < items.length; i++) {
      if (chapterRef.current?.handleItemClick) {
        chapterRef.current.handleItemClick(items[i])
      }

      let captures: { captureData: string; slidId: string }[] = []

      for (let j = 0; j < items[i].slides.length; j++) {
        setCurrentSlideIndex(j)
        await new Promise((resolve) => setTimeout(resolve, 500))
        const slide = items[i].slides[j]
        const captureData = await capturePresentation()

        if (captureData) {
          captures.push({ captureData, slidId: slide.id })
        }
      }
      if (captures.length > 0) {
        await sendFormData(captures, items[i].chapId)
      }
    }

    setItems((prev) =>
      prev.map((chapter: any) => ({
        ...chapter,
        videoEncodingStatus: 'PROCESSING',
      }))
    )
    fetchGenerateState()
    handleLectureSave(false)
    try {
      await api.post(
        `${apiConfig.prof.video.encoding}?userId=${auth.id}&lctrId=${subId}`
      )
      console.log('video encoding', data)
    } catch (error) {
      console.warn(error)
    }
  }

  const handleLectureSave = async (flag: boolean = true) => {
    const processedData = processSlidesRatiosRequest(items)
    console.log('items', items)
    const updateContents = {
      ...contents,
      title: lectureTitle,
      lctrSbj: lectureSubject,
      lrngGoal: lectureTarget,
      mthnId: selectedMetaHuman[0]?.mthnId,
      lctrBg: selectedBackground[0]?.lctrBgId,
      chapters: processedData,
    }
    try {
      await api.post(
        `${apiConfig.prof.lecture.lectureUpdateSave}`,
        updateContents
      )
      if (flag) {
        setLayer({
          isOpen: true,
          title: '저장',
          message: '저장이 완료 되었습니다.',
        })
      }
    } catch (error) {
      console.warn(error)
    }
  }

  return (
    <>
      {isOpen && (
        <ProfessorCreateLoadLayer
          setIsOpen={setIsOpen}
          title={title}
          dataList={dataList}
          selectedLearningItem={selectedLearningItem}
          setSelectedLearningItem={setSelectedLearningItem}
          selectedMetaHuman={selectedMetaHuman}
          setSelectedMetaHuman={setSelectedMetaHuman}
          selectedBackground={selectedBackground}
          setSelectedBackground={setSelectedBackground}
          setDialog={setDialog}
        />
      )}
      <div className={styles.create}>
        <div>
          <h3>
            {sbjData?.grade?.map((item: any, i: number) => (
              <span key={i}>
                {item}학년 {sbjData.smst}
                <span></span>
              </span>
            ))}
            <div>
              <Select
                lctrId={subId}
                // title={`1주차`}
                data={lctrWeekList}
                isOpen={openIndex === 0}
                setIsOpen={() => setOpenIndex(openIndex === 0 ? null : 0)}
                // isDataEmpty={isDataEmpty}
                onSelect={(value: string) => {
                  navigate(`/professor/dashboard/${id}/${value}`)
                }}
              />
            </div>
          </h3>
          <div>
            <button onClick={() => setDialog(!dialog)}>
              <Explore />
              강의 계획 보기
            </button>
            {!lectureView && (
              <button onClick={handleEncoding}>
                {encoding ? (
                  <span>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <i key={index}></i>
                    ))}
                  </span>
                ) : (
                  <>
                    <Encoding />
                    강의 인코딩
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <div className={`${encoding ? styles.processing : ''}`}>
          <div>
            <div>
              <label htmlFor='title'>강의 명</label>
              <input
                id='title'
                type='text'
                placeholder='입력해 주세요'
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                disabled={lectureView}
              />
            </div>
            <div>
              <label htmlFor='subject'>강의 주제</label>
              <textarea
                id='subject'
                rows={5}
                placeholder='입력해 주세요'
                value={lectureSubject}
                onChange={(e) => setLectureSubject(e.target.value)}
                disabled={lectureView}
              />
            </div>
            <div>
              <label htmlFor='target'>학습 목표</label>
              <textarea
                id='target'
                rows={5}
                placeholder='입력해 주세요'
                value={lectureTarget}
                onChange={(e) => setLectureTarget(e.target.value)}
                disabled={lectureView}
              />
            </div>
            <div className={styles.line}></div>
            <div>
              <div>
                <span>AI 프로페서</span>
                <div>
                  <div>
                    {selectedMetaHuman?.length > 0 && (
                      <div
                        style={{
                          backgroundImage: `url(${selectedMetaHuman[0]?.thumbPath})`,
                        }}
                      ></div>
                    )}
                  </div>
                  <button
                    onClick={handleMetahumanList}
                    disabled={lectureView}
                  >
                    불러오기
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div>
                <span>강의 배경</span>
                <div>
                  <div>
                    {selectedBackground?.length > 0 && (
                      <div
                        style={{
                          backgroundImage: `url(${selectedBackground[0]?.lctrBgPath})`,
                        }}
                      ></div>
                    )}
                  </div>
                  <button
                    onClick={handleBackgroundList}
                    disabled={lectureView}
                  >
                    불러오기
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div>
                <span>강의 대표 이미지</span>
                <div>
                  <div>
                    <div
                      style={{
                        backgroundImage: `url(${uploadedImagePreview})`,
                      }}
                    ></div>
                  </div>
                  <button disabled={lectureView}>
                    <input
                      ref={fileInputRef}
                      type='file'
                      name='image'
                      accept='image/*'
                      onChange={handleImageUpload}
                    />
                    업로드
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ProfessorCreateAside
            ref={(ref) => {
              chapterRef.current = ref?.chapterRef
              stageRef.current = ref?.stageRef
            }}
            contents={contents}
            setContents={setContents}
            items={items}
            setItems={setItems}
            currentSlideIndex={currentSlideIndex}
            setCurrentSlideIndex={setCurrentSlideIndex}
            selectedMetaHuman={selectedMetaHuman}
            selectedBackground={selectedBackground}
            lectureView={lectureView}
            handleLectureSave={handleLectureSave}
          />
        </div>
        {dialog && (
          <Dialog
            title='강의 계획'
            dialogContent={
              <>
                <div>
                  <label htmlFor='department'>학과</label>
                  <select
                    required
                    id='department'
                    value={defaultData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                  >
                    <option
                      value=''
                      disabled
                      hidden
                    >
                      선택하기
                    </option>
                    {departmentList &&
                      departmentList?.map((item: any, i: number) => (
                        <option
                          key={i}
                          value={item.deptCd}
                        >
                          {item.deptNm}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor='course'>과목</label>
                  <select
                    required
                    id='course'
                    value={defaultData.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                  >
                    <option
                      value=''
                      disabled
                      hidden
                    >
                      선택하기
                    </option>
                    {courseList &&
                      courseList?.map((item, i) => (
                        <option
                          key={i}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <span>대상학년</span>
                  <ul>
                    {[1, 2, 3, 4].map((year) => (
                      <li key={year}>
                        <input
                          type='radio'
                          name='grade'
                          id={`grade-${year}`}
                          checked={defaultData.years?.includes(year)}
                          onChange={() => handleCheckboxChange(year)}
                        />
                        <label htmlFor={`grade-${year}`}>
                          {year === 1
                            ? '1학년'
                            : year === 2
                            ? '2학년'
                            : year === 3
                            ? '3학년'
                            : '4학년'}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span>학기</span>
                  <ul>
                    {['1학기', '2학기', '여름 계절학기', '겨울 계절학기'].map(
                      (smst) => (
                        <li key={smst}>
                          <input
                            type='radio'
                            name='semester'
                            id={smst}
                            checked={defaultData.semester === smst}
                            onChange={() => handleChange('semester', smst)}
                          />
                          <label htmlFor={smst}>{smst}</label>
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span>학과 교육 과정</span>
                  <ul>
                    {['전공 필수', '전공 선택', '지정 교양', '기초 교양'].map(
                      (type) => (
                        <li key={type}>
                          <input
                            type='radio'
                            name='education'
                            id={type}
                            checked={defaultData.education === type}
                            onChange={() => handleChange('education', type)}
                          />
                          <label htmlFor={type}>{type}</label>
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <label htmlFor='week'>강의 주차</label>
                  <select
                    required
                    id='week'
                    value={defaultData.week}
                    onChange={(e) => handleChange('week', e.target.value)}
                  >
                    <option
                      value=''
                      disabled
                      hidden
                    >
                      선택하기
                    </option>
                    {Array.from({ length: 16 }, (_, i) => (
                      <option
                        key={i + 1}
                        value={i + 1}
                      >
                        {i + 1}주차
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div>
                    <span>강의 자료</span>
                    <ul>
                      {sbjData.sbjData?.map((file: any, index: number) => (
                        <li key={index}>
                          <span>
                            {file.sbjDataNm ? file.sbjDataNm : file.name}
                          </span>
                          <button>
                            <Remove />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            }
            layout={'wide'}
            dialog={dialog}
            setDialog={setDialog}
            buttonText={'설정하기'}
            isCloseState={false}
          />
        )}
        {lectureDateDialog && (
          <Dialog
            title='강의생성을 완료해주세요!'
            dialogContent={
              <>
                <div>
                  <label htmlFor='lectureName'>강의명</label>
                  <input
                    type='text'
                    id='lectureName'
                    placeholder='저장명을 입력해 주세요'
                    value={lectureTitle}
                    onChange={(e) => setLectureTitle(e.target.value)}
                  />
                </div>
                <div>
                  <span>강의 기간</span>
                  <div className={styles.date}>
                    <div>
                      <span className={`${startDate ? styles.active : ''}`}>
                        {startDate ? startDate : '선택하기'}
                      </span>
                      <input
                        type='date'
                        id='lectureStart'
                        name='lecture'
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <span>~</span>
                    <div>
                      <span className={`${endDate ? styles.active : ''}`}>
                        {endDate ? endDate : '선택하기'}
                      </span>
                      <input
                        type='date'
                        id='lectureEnd'
                        name='lecture'
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            }
            dialog={lectureDateDialog}
            setDialog={setLectureDateDialog}
            buttonText={'생성하기'}
            disableSubmit={!lectureTitle.trim() || !startDate || !endDate}
            isCloseState={true}
            handleSaveNext={handleEncoding}
          />
        )}
      </div>
    </>
  )
}

export default ProfessorCreate
