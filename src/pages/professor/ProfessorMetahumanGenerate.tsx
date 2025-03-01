import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import { useRecoilValue, useRecoilState } from 'recoil'
import { authState } from '../../state/authState'
import { layerpopupState } from '../../state/layerpopupState'
import styles from './../../assets/styles/Professor.module.scss'
import Dialog from '../../components/common/Dialog'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'

const MetahumanGenerate: React.FC = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const data = useOutletContext<any>()
  const auth: any = useRecoilValue(authState)
  const [, setLayer] = useRecoilState(layerpopupState)
  const [dialog, setDialog] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [metahumanName, setMetahumanName] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: string }>(
    {}
  )

  useEffect(() => {
    if (isEdit) {
      const mthnInfo = data.find((item: any) => item.mthnId === Number(id))
      setSelectedItems({
        userId: auth.id,
        gender: mthnInfo.gender,
        hair: mthnInfo.hair,
        style: mthnInfo.style,
        glasses: mthnInfo.glasses,
      })
      setSessionId(mthnInfo.sessionId)
      setMetahumanName(mthnInfo.mthnNm)
      console.log(data)
    }
  }, [data])

  const steps = ['gender', 'hair', 'style', 'glasses']

  const handleStepClick = (index: number) => {
    if (
      index > 0 &&
      (!selectedItems.gender || Object.keys(selectedItems).length === 0)
    ) {
      setLayer({
        isOpen: true,
        title: '메타휴먼',
        message: '메타휴먼을 먼저 선택해주세요.',
      })
      return
    }
    setActiveStep(index)
  }

  const handleItemClick = async (
    key: keyof typeof selectedItems,
    value: string
  ) => {
    const updatedItems =
      key === 'gender'
        ? { userId: auth.id, [key]: value }
        : { ...selectedItems, [key]: value }

    setSelectedItems(updatedItems)

    try {
      const response = await api.post(
        `${apiConfig.prof.metahuman.character}`,
        updatedItems
      )

      if (response.data.statusCode === '1000') {
        setSessionId(isEdit ? sessionId : response.data.session_id)
      }
      if (activeStep < steps.length - 1) {
        setTimeout(() => {
          setActiveStep(activeStep + 1)
        }, 600)
      }
    } catch (error: any) {
      console.warn('Error in API call:', error)
    }
  }

  const handleDialog = () => {
    setDialog(true)
  }

  const handleSaveNext = async () => {
    let metadata = {}
    if (isEdit) {
      metadata = {
        ...selectedItems,
        mthnNm: metahumanName,
        mthnId: id,
        sessionId: sessionId,
      }
    } else {
      metadata = {
        ...selectedItems,
        mthnNm: metahumanName,
        sessionId: sessionId,
      }
    }

    try {
      const response = await api.post(
        `${
          isEdit
            ? apiConfig.prof.metahuman.update
            : apiConfig.prof.metahuman.create
        }`,
        metadata
      )

      if (response.data.statusCode === '1000') {
        setDialog(false)
        setMetahumanName('')
        navigate(`/professor/metahuman`, { replace: true })
      }
    } catch (error: any) {
      setLayer({
        isOpen: true,
        title: '오류',
        message: '메타휴먼 저장에 실패했습니다. 다시 시도해 주세요.',
      })
    }
  }

  useEffect(() => {
    const el = document.querySelector('main') as HTMLElement
    if (el) {
      el.style.overflow = 'visible'
    }
  }, [])

  return (
    <>
      <div className={styles.generate}>
        <div>
          <ol>
            {steps?.map((title, index) => (
              <li
                key={index}
                className={` ${
                  selectedItems[title as keyof typeof selectedItems]
                    ? styles.on
                    : ''
                }`}
              >
                <h4 onClick={() => handleStepClick(index)}>
                  <span>Step {index + 1}</span>
                  <p>
                    {title === 'gender'
                      ? '성별'
                      : title === 'hair'
                      ? '헤어'
                      : title === 'style'
                      ? '의상'
                      : title === 'glasses'
                      ? '안경'
                      : title === 'shoes'
                      ? '신발'
                      : ''}
                  </p>
                </h4>
              </li>
            ))}
          </ol>
          <button
            disabled={Object.keys(selectedItems).length - 1 !== steps.length}
            onClick={handleDialog}
          >
            저장 하기
          </button>
        </div>
        <div>
          <div className={styles.unity}>
            {steps.map((_item, i) => (
              <div
                key={i}
                style={
                  i === 0
                    ? {
                        backgroundImage: `url('/data/metahuman/${selectedItems.gender}/body_01.png')`,
                      }
                    : selectedItems[steps[i] as keyof typeof selectedItems]
                    ? {
                        backgroundImage: `url('/data/metahuman/${
                          selectedItems.gender
                        }/${
                          selectedItems[steps[i] as keyof typeof selectedItems]
                        }.png')`,
                      }
                    : undefined
                }
              ></div>
            ))}
          </div>
          <div>
            <ul>
              {activeStep === 0 &&
                ['female', 'male'].map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleItemClick('gender', item)}
                    className={
                      selectedItems.gender === item ? styles.selected : ''
                    }
                  >
                    <div
                      style={{
                        backgroundImage: `url(/data/metahuman/${item}/body_01.png)`,
                      }}
                    ></div>
                    <p>{item}</p>
                  </li>
                ))}
              {activeStep === 1 &&
                ['hair_01', 'hair_02', 'hair_03'].map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleItemClick('hair', item)}
                    className={
                      selectedItems.hair === item ? styles.selected : ''
                    }
                  >
                    <div
                      style={{
                        backgroundImage: `url(/data/metahuman/${selectedItems.gender}/${item}.png)`,
                      }}
                    ></div>
                    <p>{item}</p>
                  </li>
                ))}
              {activeStep === 2 &&
                ['cloth_01', 'cloth_02', 'cloth_03'].map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleItemClick('style', item)}
                    className={
                      selectedItems.style === item ? styles.selected : ''
                    }
                  >
                    <div
                      style={{
                        backgroundImage: `url(/data/metahuman/${selectedItems.gender}/${item}.png)`,
                      }}
                    ></div>
                    <p>{item}</p>
                  </li>
                ))}
              {activeStep === 3 &&
                ['glass_00', 'glass_01', 'glass_02'].map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleItemClick('glasses', item)}
                    className={
                      selectedItems.glasses === item ? styles.selected : ''
                    }
                  >
                    <div
                      style={{
                        backgroundImage: `url(/data/metahuman/${selectedItems.gender}/${item}.png)`,
                      }}
                    ></div>
                    <p>{item}</p>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
      {dialog && (
        <Dialog
          title='저장명을 확인해 주세요!'
          dialogContent={
            <div>
              <input
                type='text'
                id='metahumanName'
                placeholder='2글자 이상의 저장명을 입력해 주세요'
                value={metahumanName}
                onChange={(e) => setMetahumanName(e.target.value)}
              />
            </div>
          }
          dialog={dialog}
          setDialog={setDialog}
          isCloseState={true}
          buttonText={'생성하기'}
          disableSubmit={!(metahumanName.trim().length > 2)}
          handleSaveNext={handleSaveNext}
        />
      )}
    </>
  )
}

export default MetahumanGenerate
