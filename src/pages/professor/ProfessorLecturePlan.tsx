import { useEffect, useRef, useState } from 'react'
import {
  Outlet,
  useOutletContext,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useRecoilValue, useRecoilState } from 'recoil'
import { authState } from '../../state/authState'
import { layerpopupState } from '../../state/layerpopupState'
import { departmentState } from '../../state/departmentState'
import styles from './../../assets/styles/CreateLecture.module.scss'
import Dialog from '../../components/common/Dialog'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import File from '@/assets/svg/file.svg?react'
import Remove from '@/assets/svg/eraser.svg?react'

import { sn, sw, pt } from '../../utils/subjects'

const ProfessorLecturPlan: React.FC = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const mounted = useRef(true)
  const data = useOutletContext<any>()
  const auth: any = useRecoilValue(authState)
  const controllerRef = useRef<AbortController | null>(null)
  const departmentList: any = useRecoilValue(departmentState)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const planListRef = useRef<HTMLUListElement>(null)
  const [subjectId, setSubjectId] = useState<string>('')
  const [statusText, setStatusText] = useState<string>('')
  const [courseList, setCourseList] = useState<any[]>([])
  const [, setLayer] = useRecoilState(layerpopupState)
  const [isGenerate, setIsGenerate] = useState<boolean>(false)
  const [weekPlans, setWeekPlans] = useState<any[]>([])
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const [isDirectDialog, setIsDirectDialog] = useState<boolean>(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [directInput, setDirectInput] = useState<string>('')
  const [tempInput, setTempInput] = useState<string>('')
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true)
  const [defaultData, setDefaultData] = useState({
    department: '',
    course: '',
    years: [] as number[],
    semester: '',
    education: '전공 필수',
    week: '',
    // langague: 'kr',
  })

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const fetchData = async () => {
    try {
      const [{ data: subjectData }, { data: lectureData }] = await Promise.all([
        api.post(`${apiConfig.prof.subject.subjectInfo}`, { sbjId: id }),
        api.post(`${apiConfig.prof.lecture.lectureInfo}`, { sbjId: id }),
      ])

      if (auth.id && subjectData.prfsId !== auth.id) {
        navigate('/', { replace: true })
      }

      if (subjectData.sbjStatus === '1' || subjectData.sbjStatus === '2') {
        navigate(`/professor/dashboard/${id}/${lectureData.crclm[0].lctrId}`)
      }

      const lectureInfo = lectureData.crclm
      setWeekPlans(lectureInfo)
      setDefaultData({
        department: subjectData.deptCd,
        course: subjectData.sbjNm,
        years: subjectData.grade,
        semester: subjectData.smst,
        education: subjectData.sbjCrlm,
        week: subjectData.weekNum,
      })
      setDirectInput(subjectData.sbjDataText)
      const formattedData = subjectData.sbjData.map((item: any) => ({
        id: item.sbjDataId,
        name: item.sbjDataNm,
      }))

      setUploadedFiles(formattedData)
      validateForm()
      fetchGenerateState()
    } catch (error) {
      console.warn(error)
    }
  }

  useEffect(() => {
    if (auth && isEdit) {
      fetchData()
    } else {
      setWeekPlans([])
      setDefaultData({
        department: '',
        course: '',
        years: [] as number[],
        semester: '',
        education: '전공 필수',
        week: '',
      })
      setDirectInput('')
      validateForm()
    }
  }, [auth, isEdit, id])

  const fetchGenerateState = async () => {
    try {
      const response = await api.post(`${apiConfig.prof.lecture.lectureInfo}`, {
        sbjId: id,
      })
      const data = response.data
      if (!mounted.current) return
      const allComplete = data.crclm.every(
        (lecture: { llmStatus: string }) => lecture.llmStatus === 'complete'
      )
      console.log('generate', allComplete)
      if (allComplete) {
        setIsGenerate(false)
      } else {
        setIsGenerate(true)
        setStatusText('목차별 스크립트가')
        if (mounted.current) {
          setTimeout(fetchGenerateState, 10000)
        }
      }
    } catch (error) {
      console.warn(error)
    }
  }

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

  const validateForm = () => {
    const { department, course, years, semester, education, week } = defaultData
    if (
      department &&
      course &&
      years.length > 0 &&
      semester &&
      education &&
      week &&
      directInput.trim().length > 0
    ) {
      setDisableSubmit(false)
    } else {
      setDisableSubmit(true)
    }
  }

  useEffect(() => {
    validateForm()
  }, [defaultData, directInput])

  const handleChange = (key: string, value: any) => {
    if (key === 'department') {
      setDefaultData((prev) => ({
        ...prev,
        course: '',
      }))
      setCourseList([])
    }
    setDefaultData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleCheckboxChange = (year: number) => {
    // setDefaultData((prev) => {
    //   const years = prev.years.includes(year)
    //     ? prev.years.filter((y) => y !== year)
    //     : [...prev.years, year]
    setDefaultData((prev) => {
      const years = prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [year]
      return { ...prev, years }
    })
  }

  const handleWeekClick = (item: any) => {
    if (!item) return
    if (item.state === 1) {
      setLayer({
        isOpen: true,
        title: `강의 생성`,
        message: `${item.week} 주차 강의 생성중입니다. 생성 중에는 작업을 할 수 없습니다.`,
      })
      return
    }
    console.log('강의 페이지 이동: ', item)
    const sbj = id ? id : subjectId
    setSelectedWeekId(item.lctrId)
    navigate(`/professor/dashboard/${sbj}/${item.lctrId}`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...filesArray])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileRemove = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const handleGenerate = async () => {
    setIsGenerate(true)
    setStatusText('주차별 강의 계획이')
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    controllerRef.current = new AbortController()

    const formData = new FormData()

    formData.append('userId', data.auth.id)
    formData.append('deptCd', defaultData.department)
    formData.append('sbjNm', defaultData.course)
    defaultData.years.forEach((year) => {
      formData.append('grade', year.toString())
    })
    formData.append('smst', defaultData.semester)
    formData.append('sbjCrlm', defaultData.education)
    formData.append('weekNum', defaultData.week)
    formData.append('sbjDataText', directInput)
    formData.append('sbjStartDtm', '2025-02-26T15:30:00+09:00')
    formData.append('sbjCmplDtm', '2025-08-31T15:30:00+09:00')
    uploadedFiles.forEach((file) => formData.append('sbjDataFiles', file))

    try {
      const response = await api.post(
        `${apiConfig.prof.subject.curriculum}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      const result = response.data
      console.log('result', result)
      data.fetchLectures()
      setSubjectId(result.sbjId)
      Array(result).forEach((subject: any) => {
        Object.entries(subject.crclm).forEach(([week, weekPlan]) => {
          if (typeof weekPlan === 'object') {
            setWeekPlans((prev) => [
              ...prev,
              { ...weekPlan, week: Number(week) },
            ])
            handleLectureChapter(weekPlan, subject.sbjId)
          }
        })
      })
    } catch (error) {
      console.warn(error)
    }
  }

  const handleLectureChapter = async (item: any, sbjId: string) => {
    setStatusText('강의별 목차와 스크립트가')
    try {
      const response = await api.post(`${apiConfig.prof.lecture.create}`, {
        lctrId: item.lctrId,
        title: item.title,
        lctrSbj: item.topic,
        lrngGoal: '',
        prfsId: data.auth.id,
        sbjId: sbjId,
        sbjNm: defaultData.course,
        week: item.week,
      })
      const result = response.data
      console.log('result chapter::::::', result)
      //   await Promise.all(
      //     result.map((script: any) => handleLectureScript(script))
      //   )
    } catch (error) {
      console.warn('Failed to fetch lecture chapter:', error)
    } finally {
      setIsGenerate(false)
    }
  }

  const handleOpenDialog = () => {
    setTempInput(directInput)
    setIsDirectDialog(!isDirectDialog)
  }

  const handleDirectInputSave = () => {
    setDirectInput(tempInput)
    setIsDirectDialog(!isDirectDialog)
  }

  const handleDimmed = () => {
    setLayer({
      isOpen: true,
      title: '알림',
      message: '강의 생성 중에는 수정할 수 없습니다.',
    })
  }

  //   useBlockNavigation()

  return (
    <>
      {location.pathname !== '/professor/create' &&
      location.pathname !== `/professor/dashboard/${id}` ? (
        <Outlet context={data} />
      ) : (
        <div className={styles.plan}>
          <div>
            <h3>
              강의 계획<span>을 시작하세요!</span>
            </h3>
          </div>
          <div>
            <div>
              {isGenerate && (
                <div
                  className={styles.dimmed}
                  onClick={handleDimmed}
                ></div>
              )}
              <h4>강의 정보</h4>
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
                        name='years'
                        id={`grade-${year}`}
                        // checked={defaultData.years.includes(year)}
                        checked={defaultData.years[0] === year}
                        onChange={() => handleCheckboxChange(year)}
                      />
                      <label htmlFor={`grade-${year}`}>
                        {year === 1
                          ? '1학년'
                          : year === 2
                          ? '2학년'
                          : year === 3
                          ? '3학년'
                          : year === 4 && '4학년'}
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
                <span>강의 자료</span>
                <div>
                  <button onClick={handleOpenDialog}>직접 입력</button>
                  <button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      name='files[]'
                      accept='.ppt, .pptx, .pdf'
                      multiple
                      onChange={handleFileUpload}
                    />
                    업로드
                  </button>
                </div>
                <ul>
                  {uploadedFiles.map((file, index) => (
                    <li key={index}>
                      <span>{file.name}</span>
                      <button>
                        <Remove onClick={() => handleFileRemove(file.name)} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* <div>
                    <span>강의 언어</span>
                    <ul>
                      {['kr', 'en'].map((type) => (
                        <li key={type}>
                          <input
                            type='checkbox'
                            name='langague'
                            id={type}
                            checked={defalutData.langague === type}
                            onChange={() => handleChange('langague', type)}
                          />
                          <label htmlFor={type}>
                            {type === 'kr' ? '한국어' : type === 'en' && '영어'}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div> */}
              <button
                disabled={disableSubmit}
                onClick={handleGenerate}
              >
                생성하기
              </button>
            </div>
            <div>
              <div>
                <h4>주차별 강의명</h4>
                {isGenerate ? (
                  <div className={styles.logening}>
                    <span></span>
                    <p>
                      {statusText} 생성 중입니다. <br />
                      잠시만 기다려주세요!
                      <br />
                      작성 중인 내용은 강의관리에서 확인하실 수 있습니다.
                    </p>
                  </div>
                ) : (
                  <ul ref={planListRef}>
                    {weekPlans?.map((item, index) => (
                      <li
                        key={`week-${index}`}
                        onClick={() => handleWeekClick(item)}
                        className={`${
                          selectedWeekId === item.id ? styles.on : ''
                        }`}
                      >
                        <div>
                          <span>{index + 1} 주차</span>
                          <span>
                            {item.chapSize > -1 && (
                              <>
                                <File /> {item.chapSize}
                              </>
                            )}
                          </span>
                        </div>
                        <p>{item.title}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {isDirectDialog && (
            <Dialog
              title='강의 자료를 직접 입력해주세요!'
              dialogContent={
                <>
                  <div>
                    <textarea
                      onChange={(e) => setTempInput(e.target.value)}
                      value={tempInput}
                    ></textarea>
                  </div>
                </>
              }
              layout={'wide'}
              dialog={isDirectDialog}
              setDialog={setIsDirectDialog}
              buttonText={'저장하기'}
              isCloseState={true}
              handleSaveNext={handleDirectInputSave}
            />
          )}
        </div>
      )}
    </>
  )
}

export default ProfessorLecturPlan
