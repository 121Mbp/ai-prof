import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import StudentListItem from '../../components/student/StudentListItem'
import styles from './../../assets/styles/Student.module.scss'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import Arrow from '@/assets/svg/arrow.svg?react'

interface StudentListProps {
  type?: string
  title?: string
  data?: string[]
}

const StudentList: React.FC<StudentListProps> = ({
  type,
  title,
  data = [],
}) => {
  const location = useLocation() || ''
  const navigationNextRef = useRef<HTMLButtonElement>(null)
  const navigationPrevRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={`${styles.list} ${type === 'grid' ? styles.g : ''}`}>
      <div>
        <h4>{location.pathname === '/student' && `${title}`}</h4>
        <div>
          {data?.length > 0 ? (
            <>
              {location.pathname === '/student' && (
                <Link
                  to={`${
                    title === '수강 중'
                      ? `${location.pathname}/learning`
                      : title === '수강 예정'
                      ? `${location.pathname}/upcoming`
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
      <div className={`${data?.length > 0 ? '' : styles.empty}`}>
        {data?.length > 0 ? (
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
            {data.map((item: any, i) => {
              if (type === 'grid') {
                if (i % 10 === 0) {
                  return (
                    <SwiperSlide key={`slide-${i}`}>
                      {data.slice(i, i + 10).map((subItem, subIdx) => (
                        <StudentListItem
                          key={`subItem-${i + subIdx}`}
                          data={subItem}
                        />
                      ))}
                    </SwiperSlide>
                  )
                }
                return null
              } else {
                return (
                  <SwiperSlide key={i}>
                    <StudentListItem
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
            {title === '완강' ? (
              <p>{title}된 강의가 없습니다.</p>
            ) : (
              <p>{title}인 강의가 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentList
