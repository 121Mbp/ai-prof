import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import styles from './../../assets/styles/Professor.module.scss'
import { Navigation } from 'swiper/modules'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import Tooltip from '../../components/common/Tooltip'
import Arrow from '@/assets/svg/arrow.svg?react'
import Add from '@/assets/svg/add.svg?react'
import Send from '@/assets/svg/send.svg?react'
import Afile from '@/assets/svg/afile.svg?react'
import Insert from '@/assets/svg/insert.svg?react'
import Url from '@/assets/svg/url.svg?react'
import Bookmark from '@/assets/svg/bookmark.svg?react'
import Pencil from '@/assets/svg/pencil.svg?react'
import Document from '@/assets/svg/doc.svg?react'
import Picture from '@/assets/svg/pic.svg?react'
import Detail from '@/assets/svg/detail.svg?react'
import Chat from '@/assets/svg/chat.svg?react'
import History from '@/assets/svg/history.svg?react'

interface Message {
  text: string
  sender: string
  timestamp: string
  recommend?: string[]
}

const chat = [
  {
    text: '2025 디지털 마케팅 경쟁의 주요 키워드는?',
    sender: 'user',
    timestamp: '02:45 PM',
  },
  {
    text: '2025년의 디지털 마케팅 경쟁에서 주목해야 할 주요 키워드는 우선, 초개인화는 디지털 마케팅 분야에서 굉장히 중요한 흐름으로, 소비자 개개인의 취향과 행동을 철저히 분석하여 맞춤형 콘텐츠를 제공하는 전략을 지칭합니다. 이는 소비자가 나에게 꼭 맞는 제품이나 서비스를 느끼 도록 하여 브랜드 충성도를 높일 수 있는 방법입니다. 다양한 데이터 분석 도구를 활용하여 소비자의 구매 이력, 웹사이트 방문 내역, 소셜 미디어 활동 등을 기반으로 한 개인 맞춤형 광고가 이뤄질 것입니다. 이와 관련하여 카페 24와 같은 기업들은 이커머스 분야에서 초개인화 시스템 개발을 주제로 한 다양한 컨퍼런스를 개최하고 있습니다.',
    recommend: [
      '2025년 디지털 마케팅의 주요 트렌드는 무엇인가요?',
      '소셜 미디어가 마케팅에 미치는 영향은 어떤가요?',
      'AI와 데이터 분석이 어떻게 활용되나요?',
      '2025년 디지털 마케팅의 주요 트렌드는 무엇인가요?',
      '2025년 디지털 마케팅의 주요 트렌드는 무엇인가요?',
      '2025년 디지털 마케팅의 주요 트렌드는 무엇인가요?',
    ],
    sender: 'server',
    timestamp: '02:48 PM',
  },
]

const ProfessorLearning: React.FC = () => {
  const data = useOutletContext<any>()
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const navigationNextRef = useRef<HTMLButtonElement>(null)
  const navigationPrevRef = useRef<HTMLButtonElement>(null)
  const dataNavigationPrevRef = useRef<HTMLButtonElement>(null)
  const dataNavigationNextRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [dataList, setDataList] = useState<any[]>(data.learning)
  const [uploadList, setUploadList] = useState<any[]>([])
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadBox, setUploadBox] = useState<boolean>(false)
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null)

  useEffect(() => {
    setMessages(chat)
  }, [])

  useEffect(() => {
    setDataList(data?.learning)
  }, [data.learning])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const filesArray: any[] = await Promise.all(
      Array.from(files).map((file) => {
        return new Promise<any>((resolve) => {
          const reader = new FileReader()

          if (file.type.includes('text')) {
            reader.onload = () => {
              const arrayBuffer = reader.result as ArrayBuffer
              const decoder = new TextDecoder('UTF-8')
              const text = decoder.decode(arrayBuffer)

              resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                url: null,
                text,
                file,
              })
            }
            reader.readAsArrayBuffer(file)
          } else {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              url: file.type.includes('image')
                ? URL.createObjectURL(file)
                : null,
              text: null,
              file,
            })
          }
        })
      })
    )
    setUploadList((prev) => [...prev, ...filesArray])
    e.target.value = ''
  }

  const handleDetailToggle = (index: number) => {
    setDropdownIndex((prev) => (prev === index ? null : index))
  }

  const handleDelete = (index: number) => {
    setUploadList((prev) => prev.filter((_, i) => i !== index))
    setDropdownIndex(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    resizeTextarea()
  }

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleUploadBox = () => {
    setUploadBox((prev) => !prev)
  }

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, uploadBox])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setDropdownIndex(null)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={styles.learning}>
      <h3>
        <strong>나만의 강의</strong>를 위해 AI를 활용해 보세요!
      </h3>
      <div>
        <div className={styles.chat}>
          <div>
            <h3>무엇을 도와드릴까요?</h3>
            <div>
              <button>
                <Chat />
                <Tooltip message={'새 대화 시작'} />
              </button>
              <button>
                <History />
                <Tooltip message={'히스토리'} />
              </button>
            </div>
          </div>
          <div>
            <form onSubmit={handleSend}>
              <div className={styles.messages}>
                {messages.map((msg, index) => (
                  <div key={index}>
                    <div>
                      <div
                        className={
                          msg.sender === 'user' ? styles.right : styles.left
                        }
                      >
                        <p>{msg.text}</p>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                    {msg.recommend && msg.recommend.length > 0 && (
                      <>
                        {msg.recommend.map((rec, ridx) => (
                          <div key={`${index}-${ridx}`}>
                            <p>{rec}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesRef} />
              </div>
              <div>
                <div className={styles.typing}>
                  <button
                    onClick={handleUploadBox}
                    className={`${uploadBox ? styles.active : ''}`}
                  >
                    <Add />
                  </button>
                  <div>
                    <textarea
                      ref={textareaRef}
                      placeholder='무엇이 궁금하신가요?'
                      value={message}
                      onChange={handleInputChange}
                      rows={1}
                    ></textarea>
                    <button
                      type='submit'
                      disabled={message.trim().length === 0}
                    >
                      <Send />
                    </button>
                  </div>
                </div>
                <div className={`${uploadBox ? styles.active : ''}`}>
                  <button>
                    <Afile />
                    <span>파일</span>
                  </button>
                  <button>
                    <Insert />
                    <span>직접 입력</span>
                  </button>
                  <button>
                    <Url />
                    <span>URL</span>
                  </button>
                  <button>
                    <Bookmark />
                    <span>MY</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div>
          <div>
            <div>
              <h3>나의 자료</h3>
              <div>
                <span>
                  추가하기
                  <input
                    type='file'
                    multiple
                    onChange={handleFileUpload}
                  />
                </span>
                <button
                  ref={dataNavigationPrevRef}
                  disabled
                >
                  <Arrow />
                </button>
                <button
                  ref={dataNavigationNextRef}
                  disabled
                >
                  <Arrow />
                </button>
              </div>
            </div>
            <div className={`${uploadList?.length > 0 ? '' : styles.empty}`}>
              {uploadList?.length > 0 ? (
                <Swiper
                  loop={false}
                  spaceBetween={0}
                  slidesPerView={1}
                  modules={[Navigation]}
                  onInit={(swiper) => {
                    if (swiper.params.navigation) {
                      const button = swiper.params.navigation as any
                      button.prevEl = dataNavigationPrevRef.current
                      button.nextEl = dataNavigationNextRef.current
                      swiper.navigation.init()
                      swiper.navigation.update()
                    }
                  }}
                >
                  {uploadList?.map((_item: any, i) => {
                    if (i % 4 === 0) {
                      return (
                        <SwiperSlide key={`data-${i}`}>
                          {uploadList.slice(i, i + 4).map((subItem, subIdx) => (
                            <div
                              key={`subItem-${i + subIdx}`}
                              className={styles.item}
                            >
                              <div>
                                {subItem.type.includes('image') ? (
                                  <Picture />
                                ) : subItem.type.includes('application') ? (
                                  <Document />
                                ) : subItem.type.includes('text') ? (
                                  <Pencil />
                                ) : (
                                  <Url />
                                )}
                                <div
                                  onClick={() => handleDetailToggle(i + subIdx)}
                                >
                                  <Detail />
                                  <div
                                    ref={dropdownRef}
                                    className={`${
                                      dropdownIndex === i + subIdx
                                        ? styles.active
                                        : ''
                                    }`}
                                  >
                                    <ul>
                                      <li>수정</li>
                                      <li
                                        onClick={() => handleDelete(i + subIdx)}
                                      >
                                        삭제
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              {subItem.type.includes('image') ? (
                                <span
                                  style={{
                                    backgroundImage: `url(${subItem.url})`,
                                  }}
                                ></span>
                              ) : subItem.type.includes('text') ? (
                                <p>{subItem?.text}</p>
                              ) : (
                                <p>{subItem?.name}</p>
                              )}
                            </div>
                          ))}
                        </SwiperSlide>
                      )
                    }
                  })}
                </Swiper>
              ) : (
                <div className={styles.empty}>자료를 추가해주세요.</div>
              )}
            </div>
          </div>
          <div>
            <div>
              <h3>강의 학습</h3>
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
            <div className={`${dataList?.length > 0 ? '' : styles.empty}`}>
              {dataList?.length > 0 ? (
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
                  {dataList?.map((_item: any, i) => {
                    if (i % 8 === 0) {
                      return (
                        <SwiperSlide key={`data-${i}`}>
                          {dataList.slice(i, i + 8).map((subItem, subIdx) => (
                            <div
                              key={`subItem-${i + subIdx}`}
                              className={styles.item}
                            >
                              <p>{subItem.lctrTrainNm}</p>
                            </div>
                          ))}
                        </SwiperSlide>
                      )
                    }
                  })}
                </Swiper>
              ) : (
                <div className={styles.empty}>학습된 강의가 없습니다.</div>
              )}
            </div>
          </div>
          <button disabled={uploadList.length > 0 ? false : true}>
            LLM 심화 학습
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfessorLearning
