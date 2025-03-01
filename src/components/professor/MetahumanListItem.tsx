import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { layerpopupState } from '../../state/layerpopupState'
import { spinnerState } from '../../state/spinnerState'
import { authState } from '../../state/authState'
import styles from './../../assets/styles/Professor.module.scss'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import Detail from '@/assets/svg/detail.svg?react'

interface MetahumanListItemProps {
  title?: string
  data: any
  selectId?: number | null
  setSelectId?: (id: number | null) => void
  type?: string
  fetchData?: () => void | undefined
  isRepresentative?: boolean
  setIsRepresentative?: (defalutData: boolean) => void
  selectedId?: string | null
  setSelectedId?: (id: string) => void
}

const MetahumanListItem: React.FC<MetahumanListItemProps> = ({
  title,
  data,
  selectId,
  setSelectId,
  type,
  fetchData,
  isRepresentative,
  setIsRepresentative,
  selectedId,
  setSelectedId,
}) => {
  const navigate = useNavigate()
  const auth: any = useRecoilValue(authState)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [, setIsLoading] = useRecoilState(spinnerState)
  const [layer, setLayer] = useRecoilState(layerpopupState)

  const radioId =
    title === '메타휴먼' ? `mth-${data.mthnId}` : `bg-${data.lctrBgId}`

  const isActive =
    selectId ===
    (title === '메타휴먼'
      ? data.mthnId
      : title === '강의 배경' && data.lctrBgId)

  useEffect(() => {
    if (data.defaultYn === 'Y' && setSelectedId) {
      setSelectedId(radioId)
    }

    if (isActive && setIsRepresentative) {
      setIsRepresentative(false)
    }
  }, [
    data.defaultYn,
    setSelectedId,
    radioId,
    isActive,
    isRepresentative,
    setIsRepresentative,
  ])

  const handleSelectItem = (id: number) => {
    setSelectId?.(id === selectId ? null : id)
  }

  const handleDuplication = async (item: any) => {
    setIsLoading(true)
    const metadata = {
      userId: auth.id,
      mthnId: item.mthnId,
    }

    try {
      const response = await api.post(
        `${apiConfig.prof.metahuman.copy}`,
        metadata
      )
      if (response.data.status_code === '1000') {
        setSelectId?.(null)
        fetchData?.()
        setTimeout(() => {
          setIsLoading(false)
        }, 400)
      }
    } catch (error: any) {
      setSelectId?.(null)
      setIsLoading(false)
      setLayer({
        isOpen: true,
        title: '오류',
        message: '메타휴먼 복사에 실패했습니다. 다시 시도해 주세요.',
      })
    }
  }

  const handleDelete = (id: string) => {
    setLayer({
      isOpen: true,
      title: '경고',
      message: 'AI프로페서를 삭제하시겠습니까?',
      double: {
        left: {
          text: '취소',
          function: () => {
            setLayer({ ...layer, isOpen: false })
          },
        },
        right: {
          text: '삭제',
          function: async () => {
            setIsLoading(true)
            try {
              await api.post(`${apiConfig.prof.metahuman.delete}`, {
                mthnId: id,
              })
              setLayer((prev) => ({
                ...prev,
                isOpen: false,
              }))

              fetchData?.()
              setSelectId?.(null)
              setTimeout(() => {
                setIsLoading(false)
              }, 400)
            } catch (error: any) {
              setSelectId?.(null)
              setIsLoading(false)
              setLayer({
                isOpen: true,
                title: '실패',
                message: '삭제에 실패하였습니다.',
              })
            }
          },
        },
      },
    })
    try {
    } catch (error: any) {}
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node)
    ) {
      setSelectId?.(null)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className={`${styles.item} ${isActive ? styles.active : ''}`}>
      <div>
        <div
          style={{
            backgroundImage:
              title === '강의 배경'
                ? `url(${data.lctrBgPath})`
                : `url(${data.thumbPath})`,
          }}
        >
          {title === '강의 배경' && data.defaultYn === 'Y' && <span>대표</span>}
        </div>
        <p>
          {title === '강의 배경' ? (
            <span>{data.lctrBgNm}</span>
          ) : (
            <span>
              {data.defaultYn === 'Y' && (
                <>
                  <span>대표</span>
                  <br />
                </>
              )}
              {data.mthnNm}
            </span>
          )}
        </p>
        {type === 'grid' && isRepresentative ? (
          <>
            <input
              type='radio'
              name={
                title === '메타휴먼'
                  ? 'metahuman'
                  : title === '강의 배경'
                  ? 'background'
                  : ''
              }
              id={radioId}
              checked={selectedId === radioId}
              onChange={() => setSelectedId?.(radioId)}
            />
            <label
              htmlFor={
                title === '메타휴먼'
                  ? `mth-${data.mthnId}`
                  : title === '강의 배경'
                  ? `bg-${data.lctrBgId}`
                  : ''
              }
            ></label>
          </>
        ) : (
          ''
        )}
        {title === '메타휴먼' && type === 'grid' && (
          <>
            <button
              ref={buttonRef}
              onClick={() =>
                handleSelectItem(
                  title === '메타휴먼'
                    ? data.mthnId
                    : title === '강의 배경' && data.lctrBgId
                )
              }
            >
              <Detail />
            </button>
            {isActive && (
              <div ref={dropdownRef}>
                <ul>
                  <li onClick={() => handleDuplication(data)}>복사</li>
                  <li
                    onClick={() =>
                      navigate(`/professor/metahuman/generate/${data.mthnId}`)
                    }
                  >
                    수정
                  </li>
                  <li
                    onClick={() =>
                      handleDelete(
                        title === '메타휴먼'
                          ? data.mthnId
                          : title === '강의 배경' && data.lctrBgId
                      )
                    }
                  >
                    삭제
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MetahumanListItem
