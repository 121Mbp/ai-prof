import { useEffect, useRef, useState } from 'react'
import styles from './../../assets/styles/CreateLecture.module.scss'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import Arrow from '@/assets/svg/arrow.svg?react'
import Remove from '@/assets/svg/close.svg?react'

interface ProfessorCreateLoadLayerProps {
  setIsOpen: (isOpen: boolean) => void
  title: string
  dataList: any
  selectedLearningItem: any[]
  setSelectedLearningItem: (item: any[]) => void
  selectedMetaHuman: any[]
  setSelectedMetaHuman: (item: any[]) => void
  selectedBackground: any[]
  setSelectedBackground: (item: any[]) => void
  setDialog?: (dialog: boolean) => void
}

const ProfessorCreateLoadLayer: React.FC<ProfessorCreateLoadLayerProps> = ({
  setIsOpen,
  title,
  dataList,
  selectedLearningItem,
  setSelectedLearningItem,
  selectedMetaHuman,
  setSelectedMetaHuman,
  selectedBackground,
  setSelectedBackground,
  setDialog,
}) => {
  const layerRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLButtonElement>(null)
  const navigationPrevRef = useRef<HTMLButtonElement>(null)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  const gridIndex = title === '강의 학습' ? 9 : 6

  useEffect(() => {
    if (title === '강의 학습') {
      setSelectedIndices(selectedLearningItem.map((item) => item.lctrTrainId))
    }
    if (title === '메타 휴먼') {
      setSelectedIndices(selectedMetaHuman.map((item) => item.mthnId))
    }
    if (title === '강의 배경') {
      setSelectedIndices(selectedBackground.map((item) => item.lctrBgId))
    }
  }, [])

  const handleItemClick = (index: number) => {
    if (title === '강의 학습') {
      setSelectedIndices((prev) =>
        prev.includes(index)
          ? prev.filter((id) => id !== index)
          : [...prev, index]
      )
    } else {
      setSelectedIndices([index])
    }
  }

  const handleLoadClick = () => {
    const selectedItems =
      title === '강의 학습'
        ? dataList.filter((item: any) =>
            selectedIndices.includes(item.lctrTrainId)
          )
        : title === '메타 휴먼'
        ? dataList.filter((item: any) => selectedIndices.includes(item.mthnId))
        : title === '강의 배경'
        ? dataList.filter((item: any) =>
            selectedIndices.includes(item.lctrBgId)
          )
        : []

    if (selectedItems.length > 0) {
      if (title === '강의 학습') {
        setSelectedLearningItem(selectedItems)
        setDialog?.(true)
      } else if (title === '메타 휴먼') {
        setSelectedMetaHuman(selectedItems)
      } else if (title === '강의 배경') {
        setSelectedBackground(selectedItems)
      }
      setIsOpen(false)
    }
  }

  const handleLayerClose = () => {
    if (title === '강의 학습') {
      setDialog?.(true)
    }
    setIsOpen(false)
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (layerRef.current && !layerRef.current.contains(e.target as Node)) {
      handleLayerClose()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className={`${styles.layer} ${
        title === '메타 휴먼'
          ? styles.metahuman
          : title === '강의 배경'
          ? styles.background
          : ''
      }`}
    >
      <div ref={layerRef}>
        <div>
          <button onClick={handleLayerClose}>
            <Remove />
          </button>
        </div>
        <div>
          <div>
            <h4>
              {title === '강의 학습'
                ? '강의 심화 자료'
                : title === '메타휴먼'
                ? 'AI프로페서'
                : title}
            </h4>
            <div>
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
          <div>
            <Swiper
              loop={false}
              spaceBetween={0}
              slidesPerView={1}
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
              {dataList?.map((_item: any, i: number) => {
                if (i % gridIndex === 0) {
                  return (
                    <SwiperSlide key={`swiper-${i}`}>
                      {dataList
                        .slice(i, i + gridIndex)
                        .map((subItem: any, subIdx: number) => (
                          <div
                            key={`item-${subIdx}`}
                            className={
                              selectedIndices.includes(
                                title === '강의 학습'
                                  ? subItem.lctrTrainId
                                  : title === '메타 휴먼'
                                  ? subItem.mthnId
                                  : title === '강의 배경' && subItem.lctrBgId
                              )
                                ? styles.on
                                : ''
                            }
                            onClick={() =>
                              handleItemClick(
                                title === '강의 학습'
                                  ? subItem.lctrTrainId
                                  : title === '메타 휴먼'
                                  ? subItem.mthnId
                                  : title === '강의 배경' && subItem.lctrBgId
                              )
                            }
                          >
                            {title === '강의 학습' ? (
                              subItem.lctrTrainNm
                            ) : title === '메타 휴먼' ? (
                              <>
                                <div
                                  style={{
                                    backgroundImage: `url(${subItem.thumbPath})`,
                                  }}
                                >
                                  {subItem.defaultYn === 'Y' && (
                                    <span>대표</span>
                                  )}
                                </div>
                                <p>{subItem.mthnNm}</p>
                              </>
                            ) : title === '강의 배경' ? (
                              <div
                                style={{
                                  backgroundImage: `url(${subItem.lctrBgPath})`,
                                }}
                              >
                                {subItem.defaultYn === 'Y' && <span>대표</span>}
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        ))}
                    </SwiperSlide>
                  )
                }
              })}
            </Swiper>
          </div>
          <button
            onClick={handleLoadClick}
            disabled={selectedIndices.length === 0}
          >
            불러오기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfessorCreateLoadLayer
