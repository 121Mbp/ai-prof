import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { authState } from '../../state/authState'
import ProfessorListItem from '../../components/professor/ProfessorListItem'
import MetahumanListItem from '../../components/professor/MetahumanListItem'
import styles from './../../assets/styles/Professor.module.scss'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import Arrow from '@/assets/svg/arrow.svg?react'

interface ProfessorListProps {
  type?: string
  title?: string
  data?: any
  selectId?: number
  setSelectId?: (id: number | null) => void
  fetchMetahuman?: () => void | undefined
}

const ProfessorList: React.FC<ProfessorListProps> = ({
  type,
  title,
  data,
  selectId,
  setSelectId,
  fetchMetahuman,
}) => {
  // const navigate = useNavigate()
  const auth: any = useRecoilValue(authState)
  const location = useLocation()
  const navigationNextRef = useRef<HTMLButtonElement>(null)
  const navigationPrevRef = useRef<HTMLButtonElement>(null)
  const [dataList, setDataList] = useState<any[]>([])
  const [isRepresentative, setIsRepresentative] = useState<boolean>(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (auth.id) {
      setDataList(data)
    }
  }, [data])

  const handleDefaultData = async () => {
    if (selectedId) {
      const currentId = dataList.find((item: any) => item.defaultYn === 'Y')
      const prefix = selectedId.split('-')[1]

      if (selectedId.includes('mth')) {
        if (currentId.mthnId.toString() !== prefix) {
          try {
            await api.post(`${apiConfig.prof.metahuman.default}`, {
              userId: auth.id,
              mthnId: prefix,
            })
            setDataList((prev) =>
              prev.map((item) =>
                item.mthnId.toString() === prefix
                  ? { ...item, defaultYn: 'Y' }
                  : { ...item, defaultYn: 'N' }
              )
            )
          } catch (error) {
            console.warn(error)
          }
        }
      } else if (selectedId.includes('bg')) {
        if (currentId.lctrBgId.toString() !== prefix) {
          try {
            await api.post(
              `${apiConfig.prof.background.updateBackground}?prfsId=${auth.id}&bgId=${prefix}`
            )
            setDataList((prev) =>
              prev.map((item) =>
                item.lctrBgId.toString() === prefix
                  ? { ...item, defaultYn: 'Y' }
                  : { ...item, defaultYn: 'N' }
              )
            )
          } catch (error) {
            console.warn(error)
          }
        }
      }
    }
    setIsRepresentative((prev) => !prev)
  }

  return (
    <div
      className={`${styles.list} ${
        title === '메타휴먼'
          ? styles.metahuman
          : title === '강의 학습'
          ? styles.board
          : title === '강의 배경'
          ? styles.bg
          : ''
      } ${type === 'grid' ? styles.g : ''}`}
    >
      <div>
        <h4>
          {location.pathname !== '/professor' && dataList.length === 0
            ? ''
            : `${title === '메타휴먼' ? 'AI 프로페서' : title}`}
        </h4>
        <div>
          {dataList?.length > 0 ? (
            <>
              {location.pathname === '/professor' && (
                <Link
                  to={`${
                    title === '나의 강의'
                      ? `${location.pathname}/dashboard`
                      : title === '메타휴먼'
                      ? `${location.pathname}/metahuman`
                      : ''
                  }`}
                >
                  전체보기
                </Link>
              )}
            </>
          ) : (
            <span>전체보기</span>
          )}
          {location.pathname === '/professor/metahuman' &&
            dataList?.length > 0 &&
            (isRepresentative ? (
              <p
                className={styles.active}
                onClick={handleDefaultData}
              >
                설정 완료
              </p>
            ) : (
              <p onClick={() => setIsRepresentative(!isRepresentative)}>
                기본 설정
              </p>
            ))}
          <button
            ref={navigationPrevRef}
            disabled
          >
            <Arrow />
          </button>
          <button
            ref={navigationNextRef}
            disabled
          >
            <Arrow />
          </button>
        </div>
      </div>
      <div className={`${dataList?.length > 0 ? '' : styles.empty}`}>
        {dataList?.length > 0 ? (
          <Swiper
            loop={false}
            spaceBetween={type === 'grid' ? 0 : 12}
            slidesPerView={type === 'grid' ? 1 : 'auto'}
            modules={[Navigation]}
            onInit={(swiper) => {
              if (swiper.params.navigation) {
                const button = swiper.params.navigation as any
                button.prevEl = navigationPrevRef.current
                button.nextEl = navigationNextRef.current
                swiper.navigation.init()
                swiper.navigation.update()
              }
            }}
          >
            {dataList.map((item: any, i: number) => {
              if (type === 'grid') {
                if (title === '메타휴먼' || title === '강의 배경') {
                  if (i % 5 === 0) {
                    return (
                      <SwiperSlide key={`slide-${i}`}>
                        {dataList
                          .slice(i, i + 5)
                          .map((subItem: any, subIdx: number) => (
                            <MetahumanListItem
                              key={`metahuman-${i + subIdx}`}
                              title={title}
                              data={subItem}
                              selectId={selectId}
                              setSelectId={setSelectId}
                              type={type}
                              fetchData={fetchMetahuman}
                              isRepresentative={isRepresentative}
                              setIsRepresentative={setIsRepresentative}
                              selectedId={selectedId}
                              setSelectedId={setSelectedId}
                            />
                          ))}
                      </SwiperSlide>
                    )
                  }
                } else if (title == '강의 학습') {
                  if (i % 8 === 0) {
                    return (
                      <SwiperSlide key={`slide-${i}`}>
                        {dataList
                          .slice(i, i + 8)
                          .map((subItem: any, subIdx: number) => (
                            <div
                              className={styles.item}
                              key={`learn-${i + subIdx}`}
                              // onClick={() => navigate('/professor/learning')}
                            >
                              {subItem?.lctrTrainNm}
                            </div>
                          ))}
                      </SwiperSlide>
                    )
                  }
                } else {
                  if (i % 10 === 0) {
                    return (
                      <SwiperSlide key={`slide-${i}`}>
                        {dataList
                          .slice(i, i + 10)
                          .map((subItem: any, subIdx: number) => (
                            <ProfessorListItem
                              key={`subItem-${i + subIdx}`}
                              data={subItem}
                            />
                          ))}
                      </SwiperSlide>
                    )
                  }
                }
                return null
              } else {
                return title === '메타휴먼' ? (
                  <SwiperSlide key={i}>
                    <MetahumanListItem
                      key={i}
                      data={item}
                    />
                  </SwiperSlide>
                ) : (
                  <SwiperSlide key={i}>
                    <ProfessorListItem
                      key={i}
                      data={item}
                    />
                  </SwiperSlide>
                )
              }
            })}
          </Swiper>
        ) : (
          <div className={`${styles.item} ${styles.empty}`}>
            {title === '나의 강의' ? (
              <p>강의가 없습니다.</p>
            ) : title === '메타휴먼' ? (
              <p>메타휴먼이 없습니다.</p>
            ) : title === '강의 학습' ? (
              <p>강의학습이 없습니다.</p>
            ) : (
              ''
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfessorList
