import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRecoilState } from 'recoil'
import { layerpopupState } from '../../state/layerpopupState'
import styles from './../../assets/styles/CreateLecture.module.scss'
import ProfessorCreateSlide from '../../components/professor/ProfessorCreateSlide'
import {
  processSlidesRatiosResponse,
  defaultSlideSetting,
} from '../../components/common/ElementsRatio'
import Tooltip from '../common/Tooltip'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import Plus from '@/assets/svg/plus.svg?react'
import File from '@/assets/svg/file.svg?react'
import Generate from '@/assets/svg/generate.svg?react'
import Remove from '@/assets/svg/eraser.svg?react'
import Burger from '@/assets/svg/burger.svg?react'
import Complete from '@/assets/svg/compl.svg?react'
import { useParams } from 'react-router-dom'

interface ProfessorCreateAsideProps {
  contents: any
  setContents: (contents: any) => void
  items: any
  setItems: (items: any) => void
  currentSlideIndex: number
  setCurrentSlideIndex: (currentSlideIndex: number) => void
  selectedMetaHuman: any[]
  selectedBackground: any[]
  lectureView: boolean
  handleLectureSave: () => void
}

interface ProfessorChapterRef {
  chapterRef: any
  stageRef: any
}

const ProfessorCreateAside = forwardRef<
  ProfessorChapterRef,
  ProfessorCreateAsideProps
>(
  (
    {
      contents,
      setContents,
      items,
      setItems,
      currentSlideIndex,
      setCurrentSlideIndex,
      selectedMetaHuman,
      selectedBackground,
      lectureView,
      handleLectureSave,
    },
    ref
  ) => {
    const { subId } = useParams()
    const chapterRef = useRef<any>(null)
    const stageRef = useRef<any>(null)
    const [layer, setLayer] = useRecoilState(layerpopupState)
    const [draggingItemIndex, setDraggingItemIndex] = useState<number | null>(
      null
    )
    const [selectedItem, setSelectedItem] = useState<any[]>([])
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
    const [selectedSlide, setSelectedSlide] = useState<any>(null)
    const [currentDescription, setCurrentDescription] = useState<string>('')
    const [editingDescriptionId, setEditingDescriptionId] = useState<
      string | null
    >(null)

    useEffect(() => {
      setItems([])
      setSelectedItem([])
      setSelectedSlide(null)
      setSelectedItemId(null)
      setDraggingItemIndex(null)
    }, [subId])

    useImperativeHandle(ref, () => ({
      chapterRef: {
        handleItemClick,
      },
      stageRef: stageRef.current,
    }))

    useEffect(() => {
      const sortedItems = contents.chapters?.sort(
        (a: any, b: any) => a.chapOrder - b.chapOrder
      )
      const processData = processSlidesRatiosResponse(sortedItems)
      setItems(processData)
    }, [contents])

    useEffect(() => {
      if (items?.length > 0 && selectedItemId === null) {
        handleItemClick(items[0])
      }

      if (selectedItemId) {
        const updatedSelectedItem = items?.find(
          (item: any) => item?.chapId === selectedItemId
        )
        setSelectedItem(updatedSelectedItem)
      }
    }, [items, selectedItemId])

    const handleItemClick = (item: any) => {
      if (selectedItemId !== item?.chapId) {
        setSelectedItemId(item?.chapId)
        setSelectedSlide(item?.slides)
        setSelectedItem(item)
        setCurrentSlideIndex(0)
      }
    }

    const handleDragStart = (index: number) => {
      setDraggingItemIndex(index)
    }

    const handleDragOver = (
      e: React.DragEvent<HTMLButtonElement>,
      index: number
    ) => {
      e.preventDefault()

      if (draggingItemIndex === null || draggingItemIndex === index) return

      const reorderedItems = [...items]
      reorderedItems.sort((a, b) => a.order - b.order)

      const [draggedItem] = reorderedItems.splice(draggingItemIndex, 1)
      reorderedItems.splice(index, 0, draggedItem)

      const updatedItems = reorderedItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }))

      setDraggingItemIndex(index)
      setItems(updatedItems)
    }

    const handleDragEnd = async () => {
      const transformedItems = items?.map((obj: any) => ({
        chapterUuid: obj.chapId,
        order: obj.order,
      }))

      try {
        await api.post(
          `${apiConfig.prof.lecture.chapterOrderUpdate}`,
          transformedItems
        )
        setDraggingItemIndex(null)
      } catch (error) {
        console.warn(error)
      }
    }

    const checkChapterLength = () => {
      if (items.length >= 8) {
        setLayer({
          isOpen: true,
          title: '강의 목차',
          message: '챕터는 최대 8개까지만 만들 수 있습니다.',
        })
        return false
      }
      return true
    }

    const handleAddChapter = () => {
      if (!checkChapterLength()) return
      const newChapterId = `${uuidv4()}`
      const newChapter = {
        chapId: newChapterId,
        chapNm: '',
        lctrId: subId,
        chapOrder: items.length + 1,
      }
      setItems((prevItems: any) => [...prevItems, newChapter])
      setTimeout(() => {
        setSelectedItemId(newChapterId)
        setSelectedSlide(null)
      }, 10)
    }

    const handleRemoveChapter = async (id: string) => {
      const updatedItems = items?.filter((item: any) => item.chapId !== id)
      setItems(updatedItems)
      setLayer({ ...layer, isOpen: false })
      try {
        await api.post(`${apiConfig.prof.lecture.chapterUpdate}/${id}`)
        setTimeout(() => {
          setSelectedItemId(updatedItems[0].chapId)
          setSelectedSlide(updatedItems[0].slides)
        }, 10)
      } catch (error) {
        console.warn(error)
      }
    }

    const handleEditDescription = (id: string, description: string) => {
      setEditingDescriptionId(id)
      setCurrentDescription(description)
    }

    const handleDescriptionSave = async (chapter: any) => {
      if (currentDescription.length === 0) {
        const updatedItems = items?.filter(
          (item: any) => item.chapId !== selectedItemId
        )
        setItems(updatedItems)
        setSelectedItemId(updatedItems[0].chapId)
        setSelectedSlide(updatedItems[0].slides)
        return
      }
      try {
        await api.post(`${apiConfig.prof.lecture.chapterUpdate}`, {
          chapId: chapter.chapId,
          chapNm: currentDescription,
          chapOrder: chapter.chapOrder,
          lctrId: subId,
        })
      } catch (error) {
        console.warn(error)
      }
      setItems((prevItems: any) =>
        prevItems.map((item: any) =>
          item.chapId === chapter.chapId
            ? { ...item, chapNm: currentDescription }
            : item
        )
      )
      setEditingDescriptionId(null)
      setCurrentDescription('')
    }

    const handleDescriptionChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setCurrentDescription(e.target.value)
    }

    const handleSlideUpdate = (updatedSlides: any[]) => {
      setSelectedSlide(updatedSlides)
      setItems((prevItems: any) =>
        prevItems.map((item: any) =>
          item.chapId === selectedItemId
            ? { ...item, slides: updatedSlides }
            : item
        )
      )
    }

    const handleLectureScript = async (item: any) => {
      console.log('item', item)
      return
      try {
        const response = await api.post(
          `${apiConfig.prof.lecture.createScript}`,
          {
            id: item.chapId,
            indexNm: item.chapNm,
            lctrId: item.lctrId,
            lctrSbj: item.lctrSbj,
          }
        )

        const updatedItem = response.data
        const processData = processSlidesRatiosResponse([updatedItem])

        const additionalElements = await defaultSlideSetting(
          selectedBackground[0]
        )

        const updatedResponse = processData.map((item: any) => {
          const updatedSlides = item.slides.map((slide: any) => ({
            ...slide,
            elements: [...additionalElements, ...slide.elements],
          }))

          return { ...item, slides: updatedSlides }
        })

        setSelectedSlide(updatedResponse[0]?.slides || [])
        setSelectedItemId(item.chapId)
        setItems((prev: any) =>
          prev.map((existingItem: any) =>
            existingItem.chapId === item.chapId
              ? { ...existingItem, slides: updatedResponse[0].slides }
              : existingItem
          )
        )
      } catch (error) {
        console.warn('목차 생성 스크립트를 하지 못하였습니다.')
      }
    }

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      item: any
    ) => {
      if (e.key === 'Enter') {
        handleDescriptionSave(item)
      }
    }

    return (
      <>
        <div>
          <div>
            <h3>강의 챕터</h3>
            <div>
              <button
                onClick={handleAddChapter}
                disabled={lectureView}
              >
                <Plus />
                <Tooltip message={'Chapter 추가하기'} />
              </button>
            </div>
          </div>
          <ul ref={chapterRef}>
            {items?.map((item: any, index: number) => (
              <li
                key={item.chapId}
                onClick={() => handleItemClick(item)}
                className={`${
                  selectedItemId === item.chapId ? styles.on : ''
                } ${draggingItemIndex === index ? styles.dragging : ''}`}
              >
                <div>
                  <div>
                    <span>Chapter {index + 1}</span>
                    {item.slides?.length > 0 && (
                      <span>
                        <File />
                        {item.slides.length}
                      </span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => handleLectureScript(item)}
                      disabled={lectureView}
                    >
                      <Generate />
                    </button>
                    <button
                      // onClick={() => handleRemoveChapter(item.chapId)}
                      onClick={() =>
                        setLayer({
                          isOpen: true,
                          title: '경고',
                          message: '해당 목차를 삭제 하시겠습니까?',
                          double: {
                            left: {
                              text: '취소',
                              function: () => {
                                setLayer({ ...layer, isOpen: false })
                              },
                            },
                            right: {
                              text: '삭제',
                              function: () => handleRemoveChapter(item.chapId),
                            },
                          },
                        })
                      }
                      disabled={lectureView}
                    >
                      <Remove />
                    </button>
                    <button
                      className={styles.burger}
                      draggable={!lectureView}
                      onDragStart={
                        lectureView ? undefined : () => handleDragStart(index)
                      }
                      onDragOver={
                        lectureView
                          ? undefined
                          : (event) => handleDragOver(event, index)
                      }
                      onDragEnd={lectureView ? undefined : handleDragEnd}
                      disabled={lectureView}
                    >
                      <Burger />
                    </button>
                  </div>
                </div>
                {editingDescriptionId === item.chapId || item.chapNm === '' ? (
                  <input
                    type='text'
                    value={currentDescription}
                    onChange={handleDescriptionChange}
                    onBlur={() => handleDescriptionSave(item)}
                    onKeyDown={(event) => handleKeyDown(event, item)}
                    placeholder={'목차 타이틀을 입력해주세요.'}
                    autoFocus
                    className={styles.editableInput}
                  />
                ) : (
                  <p
                    onDoubleClick={() =>
                      !lectureView &&
                      handleEditDescription(item.chapId, item.chapNm)
                    }
                  >
                    {item.chapNm}
                  </p>
                )}
                <span>
                  {item.videoEncodingStatus === 'NONE' ? (
                    ''
                  ) : item.videoEncodingStatus === 'COMPLETE' ? (
                    <Complete />
                  ) : (
                    <i></i>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <ProfessorCreateSlide
          ref={stageRef}
          setContents={setContents}
          items={items}
          selectedItem={selectedItem}
          selectedItemId={selectedItemId || ''}
          currentSlideIndex={currentSlideIndex}
          setCurrentSlideIndex={setCurrentSlideIndex}
          selectedSlide={selectedSlide}
          setSelectedSlide={setSelectedSlide}
          handleSlideUpdate={handleSlideUpdate}
          selectedMetaHuman={selectedMetaHuman}
          selectedBackground={selectedBackground}
          lectureView={lectureView}
          handleLectureSave={handleLectureSave}
        />
      </>
    )
  }
)

export default ProfessorCreateAside
