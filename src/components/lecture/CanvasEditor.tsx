import React, { useRef, useState, useEffect, forwardRef } from 'react'
import Konva from 'konva'
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Transformer,
} from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import styles from './../../assets/styles/CreateLecture.module.scss'
import Copy from '@/assets/svg/copy.svg?react'
import Delete from '@/assets/svg/delete.svg?react'
import Layers from '@/assets/svg/layers.svg?react'
import AddText from '@/assets/svg/text.svg?react'
// import AddPhoto from '@/assets/svg/photo.svg?react'
// import Palette from '@/assets/svg/palette.svg?react'
import Undo from '@/assets/svg/undo.svg?react'
import Redo from '@/assets/svg/redo.svg?react'
import Bold from '@/assets/svg/bold.svg?react'
import Italic from '@/assets/svg/italic.svg?react'
import Underline from '@/assets/svg/underline.svg?react'
import AlignLeft from '@/assets/svg/alignLeft.svg?react'
import AlignCenter from '@/assets/svg/alignCenter.svg?react'
import AlignRight from '@/assets/svg/alignRight.svg?react'

interface CanvasElementProps {
  id: string
  type: any
  props: any
}

interface CanvasEditorProps {
  elements: CanvasElementProps[] | null
  localElements: CanvasElementProps[]
  setLocalElements: (localElements: CanvasElementProps[]) => void
  onElementsChange: (updatedElements: CanvasElementProps[]) => void
  selectedId: string
  setSelectedId: (selectedId: string | null) => void
  history: CanvasElementProps[][] | null
  setHistory: (updatedHistory: CanvasElementProps[][]) => void
  currentStep: number
  setCurrentStep: (updatedStep: number) => void
  isEditor: boolean
}

const CanvasEditor = forwardRef<Konva.Stage, CanvasEditorProps>(
  (
    {
      elements,
      localElements,
      setLocalElements,
      onElementsChange,
      selectedId,
      setSelectedId,
      history,
      setHistory,
      currentStep,
      setCurrentStep,
      isEditor,
    },
    ref
  ) => {
    const transformerRef = useRef<Konva.Transformer | null>(null)
    const shapeRefs = useRef<Record<string, Konva.Node | null>>({})
    const shapeRef = useRef<{ [key: string]: Konva.Node }>({})
    // const stageRef = useRef<Konva.Stage>(null)
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [inputValue, setInputValue] = useState<string>('')
    const [fontFamily, setFontFamily] = useState<string>('Arial')
    const [fontSize, setFontSize] = useState<number>(24)
    const [fontColor, setFontColor] = useState<string>('#000000')
    const [fontStyle, setFontStyle] = useState<string>('normal')
    const [textAlign, setTextAlign] = useState<string>('left')
    const [textDeco, setTextDeco] = useState<string>('none')
    const [textLineHeight, setTextLineHeight] = useState<number>(1.2)
    const [textSelectTool, setTextSelectTool] = useState<boolean>(false)
    const [toolPosition, setToolPosition] = useState<{
      x: number
      y: number
    } | null>(null)

    const canvasScreen = {
      width: 456,
      height: 278,
    }

    const initScreen = {
      width: 926,
      height: 520,
    }

    const fontFamilyArr = [
      'Arial',
      'Times New Roman',
      'Courier New',
      'Verdana',
      'Georgia',
    ]

    const fontSizeArr = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 28,
      30, 32, 36, 38, 40, 44, 48, 54, 60, 66, 72, 80,
    ]

    const lineHeightArr = [
      '1.0',
      '1.2',
      '1.4',
      '1.6',
      '1.8',
      '2.0',
      '2.5',
      '3.0',
    ]

    useEffect(() => {
      if (Array.isArray(elements) && elements.length > -1) {
        setLocalElements(elements)
        setToolPosition(null)
        console.log(localElements)
      }
    }, [elements])

    useEffect(() => {
      if (selectedId && transformerRef.current) {
        const node = shapeRefs.current[selectedId]
        if (node) {
          transformerRef.current.nodes([node])
          transformerRef.current.getLayer()?.batchDraw()
        }
      } else {
        transformerRef.current?.nodes([])
        setTextSelectTool(false)
      }
      updateToolPosition()
    }, [selectedId])

    const updateToolPosition = () => {
      if (selectedId) {
        const node = shapeRefs.current[selectedId]
        if (node) {
          const box = node.getClientRect()
          setToolPosition({ x: box.x + box.width / 2, y: box.y - 30 })
        }
      } else {
        setToolPosition(null)
      }
    }

    const getClosestFontSize = (
      scaledFontSize: number,
      fontSizeArr: number[]
    ) => {
      return fontSizeArr.reduce((prev, curr) =>
        Math.abs(curr - scaledFontSize) < Math.abs(prev - scaledFontSize)
          ? curr
          : prev
      )
    }

    useEffect(() => {
      setSelectedId(null)
      setEditingId(null)
      setTextSelectTool(false)
    }, [isEditor])

    const handleSelect = (id: string) => {
      const selectedElement = localElements.find((element) => element.id === id)
      if (selectedElement?.props.draggable === false) {
        setSelectedId(null)
        setEditingId(null)
        setTextSelectTool(false)
        return
      }
      if (selectedElement) {
        setSelectedId(id)
        setEditingId(null)
        setTextSelectTool(true)
        if (selectedElement.type === 'text') {
          const scaledFontSize = Math.round(
            (selectedElement.props.fontSize / canvasScreen.width) *
              initScreen.width
          )
          const closestFontSize = getClosestFontSize(
            scaledFontSize,
            fontSizeArr
          )
          setFontFamily(selectedElement.props.fontFamily)
          setFontSize(closestFontSize)
          setFontColor(selectedElement.props.fill)
          setFontStyle(selectedElement.props.fontStyle)
          setTextDeco(selectedElement.props.textDecoration)
          setTextAlign(selectedElement.props.align)
          setTextLineHeight(selectedElement.props.lineHeight)
        }
      }
    }

    const handleElementChange = (updatedElements: CanvasElementProps[]) => {
      if (Array.isArray(updatedElements)) {
        setLocalElements(updatedElements)
        onElementsChange(updatedElements)
        setTimeout(() => {
          updateToolPosition()
        }, 10)
      }
    }

    const saveHistory = (updatedElements: CanvasElementProps[]) => {
      if (history) {
        const newHistory = history.slice(0, currentStep + 1)
        const updatedHistory = [...newHistory, updatedElements]
        setHistory(updatedHistory)
        setCurrentStep(updatedHistory.length - 1)
      }
    }

    const undo = () => {
      if (currentStep > -1 && history) {
        const previousStep = currentStep - 1
        setCurrentStep(previousStep)
        const previousElements = history[previousStep]
        setLocalElements(previousElements)
        onElementsChange(previousElements)
      }
    }

    const redo = () => {
      if (history) {
        if (currentStep < history.length - 1) {
          const nextStep = currentStep + 1
          setCurrentStep(nextStep)
          const nextElements = history[nextStep]
          setLocalElements(nextElements)
          onElementsChange(nextElements)
        }
      }
    }

    const handleDragStart = (id: string) => {
      handleSelect(id)
    }

    const handleDragMove = (id: string, newProps: any) => {
      const updatedElements = localElements.map((el) =>
        el.id === id ? { ...el, props: { ...el.props, ...newProps } } : el
      )
      setLocalElements(updatedElements)
      handleElementChange(updatedElements)
    }

    const handleDragEnd = (id: string, newProps: any) => {
      const updatedElements = localElements.map((el) =>
        el.id === id ? { ...el, props: { ...el.props, ...newProps } } : el
      )
      setLocalElements(updatedElements)
      saveHistory(updatedElements)
      onElementsChange(updatedElements)
    }

    const handleTextInputChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const newText = e.target.value
      setInputValue(newText)
      if (editingId) {
        const node = shapeRefs.current[editingId] as Konva.Text | null
        if (node) {
          node.text(newText)

          const textWidth = node.getTextWidth() + 2
          const textHeight = node.getTextHeight() + 2
          if (inputRef.current) {
            inputRef.current.style.width = `${textWidth + 2}px`
            inputRef.current.style.height = `${textHeight + 2}px`
          }

          node.getLayer()?.batchDraw()

          const updatedElements = localElements.map((el) =>
            el.id === editingId
              ? {
                  ...el,
                  props: {
                    ...el.props,
                    text: newText,
                    width: e.target.scrollWidth + 2,
                    height: e.target.scrollHeight + 2,
                  },
                }
              : el
          )

          setLocalElements(updatedElements)
          handleElementChange(updatedElements)

          const updatedElement = updatedElements.find(
            (el) => el.id === editingId
          )
          if (updatedElement) {
            handleTextDoubleClick(editingId, updatedElement.props)
          }
        }
      }
    }

    const handleTextDoubleClick = (id: string, textProps: any) => {
      const node = shapeRefs.current[id] as Konva.Text | null
      if (!node) return

      setEditingId(id)
      setInputValue(textProps.text)

      node.text(textProps.text)
      node.fill('transparent')
      node.width(textProps.width)
      node.height(textProps.height)

      if (inputRef.current) {
        inputRef.current.style.display = 'block'
        inputRef.current.style.left = `${textProps.x}px`
        inputRef.current.style.top = `${textProps.y}px`
        inputRef.current.style.width = `${textProps.width}px`
        inputRef.current.style.height = `${textProps.height}px`
        inputRef.current.style.transform = `rotate(${textProps.rotation}deg)`
        inputRef.current.style.transformOrigin = '0 0'
        inputRef.current.style.fontSize = `${textProps.fontSize}px`
        inputRef.current.style.color = `${textProps.fontColor}`
        inputRef.current.style.fontFamily = `${textProps.fontFamily}`
        inputRef.current.style.fontWeight = `${textProps.fontStyle}`
        inputRef.current.style.fontStyle = `${textProps.fontStyle}`
        inputRef.current.style.textAlign = `${textProps.align}`
        inputRef.current.style.textDecoration = `${textProps.textDecoration}`
        inputRef.current.style.lineHeight = `${textProps.lineHeight}`
        inputRef.current.style.whiteSpace = 'nowrap'
        inputRef.current.value = textProps.text
        inputRef.current.focus()

        inputRef.current.style.width = `${inputRef.current?.scrollWidth + 2}px`
        inputRef.current.style.height = `${
          inputRef.current?.scrollHeight + 2
        }px`
      }
    }

    const handleTextInputBlur = (e: any) => {
      if (editingId) {
        const node = shapeRefs.current[editingId] as Konva.Text | null
        if (node) {
          node.text(inputValue)
          node.fill(fontColor)
          node.getLayer()?.batchDraw()

          const updatedElements = localElements.map((el) =>
            el.id === editingId
              ? {
                  ...el,
                  props: {
                    ...el.props,
                    text: inputValue,
                    width: e.target.scrollWidth + 2,
                    height: e.target.scrollHeight + 2,
                  },
                }
              : el
          )
          saveHistory(updatedElements)
        }
      }

      setEditingId(null)
      if (inputRef.current) {
        inputRef.current.style.display = 'none'
      }
    }

    const addText = () => {
      const id = `${uuidv4()}`
      const initialText = '새 텍스트'

      const tempNode = new Konva.Text({
        text: initialText,
        fontSize: fontSize,
        fill: fontColor,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        textDecoration: textDeco,
        align: textAlign,
        lineHeight: textLineHeight,
      })

      const adjustedWidth = tempNode.width() + 4
      const adjustedHeight = tempNode.height() + 4

      const newElement = {
        id,
        type: 'text',
        props: {
          x: 26,
          y: 26,
          text: initialText,
          fontSize: Math.round(
            (fontSize / initScreen.width) * canvasScreen.width
          ),
          lineHeight: textLineHeight,
          width: Math.round(
            (adjustedWidth / initScreen.width) * canvasScreen.width
          ),
          height: Math.round(
            (adjustedHeight / initScreen.width) * canvasScreen.width
          ),
          fill: fontColor,
          fontFamily: fontFamily,
          fontStyle: fontStyle,
          textDecoration: textDeco,
          align: textAlign,
          draggable: true,
        },
      }
      const updatedElements = [
        ...localElements,
        newElement as CanvasElementProps,
      ]
      setLocalElements(updatedElements)
      handleElementChange(updatedElements)
      saveHistory(updatedElements)
    }

    // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const file = e.target.files?.[0]
    //   if (!file) return

    //   const reader = new FileReader()
    //   reader.onload = () => {
    //     const image = new window.Image()
    //     image.src = reader.result as string
    //     image.onload = () => {
    //       const id = `${uuidv4()}`
    //       const scaledWidth = 150
    //       const scaledHeight = (image.height / image.width) * scaledWidth
    //       const newElement = {
    //         id,
    //         type: 'image',
    //         props: {
    //           x: 26,
    //           y: 26,
    //           width: scaledWidth,
    //           height: scaledHeight,
    //           image,
    //           draggable: true,
    //         },
    //       }
    //       const updatedElements = [
    //         ...localElements,
    //         newElement as CanvasElementProps,
    //       ]
    //       setLocalElements(updatedElements)
    //       handleElementChange(updatedElements)
    //       saveHistory(updatedElements)
    //     }
    //   }
    //   reader.readAsDataURL(file)
    //   e.target.value = ''
    // }

    const handleFontFamilyChange = (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const newFontFamliy = e.target.value
      setFontFamily(newFontFamliy)

      if (selectedId) {
        const updatedElements = localElements.map((el) => {
          if (el.id === selectedId && el.type === 'text') {
            const tempNode = new Konva.Text({
              text: el.props.text,
              fontSize: fontSize,
              fill: fontColor,
              fontFamily: newFontFamliy,
              fontStyle: fontStyle,
              textDecoration: textDeco,
              align: textAlign,
              lineHeight: textLineHeight,
            })

            return {
              ...el,
              props: {
                ...el.props,
                fontFamily: newFontFamliy,
                width: tempNode.width() + 4,
                height: tempNode.height() + 4,
              },
            }
          }
          return el
        })

        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }
    }

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const baseFontSize = parseInt(e.target.value, 10)
      const newFontSize = Math.round(
        (parseInt(e.target.value, 10) / initScreen.width) * canvasScreen.width
      )
      setFontSize(baseFontSize)

      if (selectedId) {
        const updatedElements = localElements.map((el) => {
          if (el.id === selectedId && el.type === 'text') {
            const tempNode = new Konva.Text({
              text: el.props.text,
              fontSize: newFontSize,
              fill: fontColor,
              fontFamily: fontFamily,
              fontStyle: fontStyle,
              textDecoration: textDeco,
              align: textAlign,
              lineHeight: textLineHeight,
            })

            return {
              ...el,
              props: {
                ...el.props,
                fontSize: newFontSize,
                width: tempNode.width() + 4,
                height: tempNode.height() + 4,
              },
            }
          }
          return el
        })

        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }
    }

    const handleLineHeightChange = (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const newLineHeight = parseFloat(e.target.value)
      setTextLineHeight(newLineHeight)

      if (selectedId) {
        const updatedElements = localElements.map((el) => {
          if (el.id === selectedId && el.type === 'text') {
            const tempNode = new Konva.Text({
              text: el.props.text,
              fontSize: fontSize,
              fill: fontColor,
              fontFamily: fontFamily,
              fontStyle: fontStyle,
              textDecoration: textDeco,
              align: textAlign,
              lineHeight: newLineHeight,
            })

            return {
              ...el,
              props: {
                ...el.props,
                lineHeight: newLineHeight,
                width: tempNode.width() + 4,
                height: tempNode.height() + 4,
              },
            }
          }
          return el
        })

        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }
    }

    const handleFontColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value
      setFontColor(newColor)

      if (selectedId) {
        const updatedElements = localElements.map((el) =>
          el.id === selectedId
            ? {
                ...el,
                props: {
                  ...el.props,
                  fill: newColor,
                },
              }
            : el
        )
        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        // saveHistory(updatedElements)
      }
    }

    const toggleFontStylePart = (style: string, part: string) => {
      const safeStyle = style || 'normal'
      const parts = safeStyle.split(' ').filter(Boolean)
      if (parts.includes(part)) {
        return parts.filter((p) => p !== part).join(' ')
      }
      return [...parts, part].join(' ')
    }

    const handleFontStyleChange = (type: string) => {
      const newFontStyle = toggleFontStylePart(fontStyle, type)
      setFontStyle(newFontStyle)

      if (selectedId) {
        const updatedElements = localElements.map((el) =>
          el.id === selectedId && el.type === 'text'
            ? {
                ...el,
                props: {
                  ...el.props,
                  fontStyle: newFontStyle,
                },
              }
            : el
        )
        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }
    }

    const handleTextDecoChange = () => {
      const newTextDecoration = textDeco === 'underline' ? 'none' : 'underline'
      setTextDeco(newTextDecoration)
      if (selectedId) {
        const updatedElements = localElements.map((el) =>
          el.id === selectedId && el.type === 'text'
            ? {
                ...el,
                props: {
                  ...el.props,
                  textDecoration: newTextDecoration,
                },
              }
            : el
        )
        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }
    }

    const handleTextAlignChange = (type: string) => {
      setTextAlign(type)
      if (selectedId) {
        const updatedElements = localElements.map((el) =>
          el.id === selectedId && el.type === 'text'
            ? {
                ...el,
                props: {
                  ...el.props,
                  align: type,
                },
              }
            : el
        )
        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }
    }

    const copyElement = () => {
      if (selectedId) {
        const element = localElements.find((el) => el.id === selectedId)
        if (element) {
          const newElement = {
            ...element,
            id: `${element.type}-${Date.now()}`,
            props: {
              ...element.props,
              x: element.props.x + 10,
              y: element.props.y + 10,
            },
          }
          const updatedElements = [...localElements, newElement]
          setLocalElements(updatedElements)
          onElementsChange(updatedElements)
          saveHistory(updatedElements)
        }
      }
    }

    const deleteElement = () => {
      if (selectedId) {
        const updatedElements = localElements.filter(
          (el) => el.id !== selectedId
        )
        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
        setSelectedId(null)
      }
    }

    const handleTransformEnd = (id: string, node: Konva.Node) => {
      let updatedElements: CanvasElementProps[] = []

      if (node instanceof Konva.Text) {
        const newWidth = node.width() * node.scaleX()
        node.scaleX(1)
        node.scaleY(1)

        updatedElements = localElements.map((el) =>
          el.id === id
            ? {
                ...el,
                props: {
                  ...el.props,
                  x: node.x(),
                  y: node.y(),
                  rotation: node.rotation(),
                  width: newWidth,
                  height: el.props.height,
                },
              }
            : el
        )
      } else {
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        const width = node.width() * scaleX
        const height = node.height() * scaleY

        node.scaleX(1)
        node.scaleY(1)

        updatedElements = localElements.map((el) =>
          el.id === id
            ? {
                ...el,
                props: {
                  ...el.props,
                  x: node.x(),
                  y: node.y(),
                  rotation: node.rotation(),
                  width,
                  height,
                },
              }
            : el
        )
      }

      setLocalElements(updatedElements)
      handleElementChange(updatedElements)
      saveHistory(updatedElements)
    }

    const bringToFront = () => {
      if (!selectedId) return

      const index = localElements.findIndex((el) => el.id === selectedId)
      if (index !== -1) {
        const updatedElements = [...localElements]
        const [movedElement] = updatedElements.splice(index, 1)
        updatedElements.push(movedElement)

        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }

      const node = shapeRef.current[selectedId]
      if (node) {
        node.moveToTop()
        node.getLayer()?.batchDraw()
      }
    }

    const sendToBack = () => {
      if (!selectedId) return

      const index = localElements.findIndex((el) => el.id === selectedId)
      if (index !== -1) {
        const updatedElements = [...localElements]
        const [movedElement] = updatedElements.splice(index, 1)
        updatedElements.unshift(movedElement)

        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }

      const node = shapeRef.current[selectedId]
      if (node) {
        node.moveToBottom()
        node.getLayer()?.batchDraw()
      }
    }

    const bringForward = () => {
      if (!selectedId) return

      const index = localElements.findIndex((el) => el.id === selectedId)
      if (index < localElements.length - 1) {
        const updatedElements = [...localElements]
        const [movedElement] = updatedElements.splice(index, 1)
        updatedElements.splice(index + 1, 0, movedElement)

        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }

      const node = shapeRef.current[selectedId]
      if (node) {
        node.moveUp()
        node.getLayer()?.batchDraw()
      }
    }

    const sendBackward = () => {
      if (!selectedId) return

      const index = localElements.findIndex((el) => el.id === selectedId)
      if (index > 0) {
        const updatedElements = [...localElements]
        const [movedElement] = updatedElements.splice(index, 1)
        updatedElements.splice(index - 1, 0, movedElement)

        setLocalElements(updatedElements)
        handleElementChange(updatedElements)
        saveHistory(updatedElements)
      }

      const node = shapeRef.current[selectedId]
      if (node) {
        node.moveDown()
        node.getLayer()?.batchDraw()
      }
    }

    return (
      <>
        {isEditor && (
          <div className={styles.action}>
            {textSelectTool ? (
              <div>
                <select
                  onChange={handleFontFamilyChange}
                  value={fontFamily}
                >
                  {fontFamilyArr.map((item, i) => (
                    <option
                      key={`ff-${i}`}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  onChange={handleFontSizeChange}
                  value={fontSize}
                >
                  {fontSizeArr.map((item, i) => (
                    <option
                      key={`fs-${i}`}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  onChange={handleLineHeightChange}
                  value={textLineHeight}
                >
                  {lineHeightArr.map((item, i) => (
                    <option
                      key={`lh-${i}`}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
                <button>
                  <label htmlFor='textColor'>Aa</label>
                  <input
                    type='color'
                    id='textColor'
                    value={fontColor}
                    onChange={handleFontColorChange}
                  />
                </button>
                {/* <button>
                  <Palette />
                </button> */}
                <button
                  className={`${
                    fontStyle?.includes('bold') ? '' : styles.disabled
                  }`}
                  onClick={() => handleFontStyleChange('bold')}
                >
                  <Bold />
                </button>
                <button
                  className={`${
                    fontStyle?.includes('italic') ? '' : styles.disabled
                  }`}
                  onClick={() => handleFontStyleChange('italic')}
                >
                  <Italic />
                </button>
                <button
                  className={`${
                    textDeco === 'underline' ? '' : styles.disabled
                  }`}
                  onClick={handleTextDecoChange}
                >
                  <Underline />
                </button>
                <button
                  className={`${textAlign === 'left' ? '' : styles.disabled}`}
                  onClick={() => handleTextAlignChange('left')}
                >
                  <AlignLeft />
                </button>
                <button
                  className={`${textAlign === 'center' ? '' : styles.disabled}`}
                  onClick={() => handleTextAlignChange('center')}
                >
                  <AlignCenter />
                </button>
                <button
                  className={`${textAlign === 'right' ? '' : styles.disabled}`}
                  onClick={() => handleTextAlignChange('right')}
                >
                  <AlignRight />
                </button>
              </div>
            ) : (
              <div>
                <div>
                  <button
                    onClick={undo}
                    disabled={currentStep <= 0}
                  >
                    <Undo />
                  </button>
                  <button
                    onClick={redo}
                    disabled={
                      history ? currentStep >= history.length - 1 : true
                    }
                  >
                    <Redo />
                  </button>
                </div>
                <div>
                  <button onClick={addText}>
                    <AddText />
                  </button>
                  {/* <button className={styles.photo}>
                    <AddPhoto />
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      style={{ display: 'inline-block', marginLeft: '10px' }}
                    />
                  </button> */}
                </div>
              </div>
            )}
          </div>
        )}
        <div className={`${styles.canvas} ${!isEditor ? styles.disabled : ''}`}>
          <Stage
            width={456}
            height={278}
            ref={ref}
            onClick={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null)
                setEditingId(null)
              }
            }}
          >
            <Layer>
              {localElements?.map((el: any) => {
                const isSelected = selectedId === el.id
                const commonHandlers = {
                  ref: (node: any) => {
                    shapeRefs.current[el.id] = node
                  },
                  onClick: () => handleSelect(el.id),
                  onDragStart: () => handleDragStart(el.id),
                  onDragMove: (e: any) =>
                    handleDragMove(el.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    }),
                  onDragEnd: (e: any) =>
                    handleDragEnd(
                      el.id,
                      handleDragMove(el.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      })
                    ),
                  onTransformEnd: (e: any) =>
                    handleTransformEnd(el.id, e.target as Konva.Node),
                }

                const renderShape = () => {
                  switch (el.type) {
                    case 'image':
                      return (
                        <ImageWithSrc
                          {...el.props}
                          {...commonHandlers}
                        />
                      )
                    case 'text':
                      return (
                        <Text
                          {...el.props}
                          {...commonHandlers}
                          onDblClick={() =>
                            handleTextDoubleClick(el.id, el.props)
                          }
                        />
                      )
                    default:
                      return null
                  }
                }

                return (
                  <React.Fragment key={el.id}>
                    {renderShape()}
                    {isSelected && (
                      <Transformer
                        key={`${el.id}-transformer`}
                        ref={transformerRef}
                        rotationSnaps={[0, 45, 90, 180, 270]}
                        enabledAnchors={
                          el.type === 'text'
                            ? ['middle-left', 'middle-right']
                            : [
                                'top-left',
                                'top-right',
                                'bottom-left',
                                'bottom-right',
                              ]
                        }
                        anchorStrokeWidth={1}
                        rotateAnchorOffset={20}
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </Layer>
          </Stage>
          {toolPosition && (
            <div
              className={styles.navTool}
              style={{
                left: toolPosition.x,
                top: toolPosition.y,
              }}
            >
              <div>
                <Layers />
                <div>
                  <ul>
                    <li>
                      <button onClick={bringToFront}>맨 앞으로</button>
                    </li>
                    <li>
                      <button onClick={sendToBack}>맨 뒤로</button>
                    </li>
                    <li>
                      <button onClick={bringForward}>앞으로</button>
                    </li>
                    <li>
                      <button onClick={sendBackward}>뒤로</button>
                    </li>
                  </ul>
                  <span></span>
                </div>
              </div>
              <button onClick={copyElement}>
                <Copy />
              </button>
              <button onClick={deleteElement}>
                <Delete />
              </button>
            </div>
          )}
          <textarea
            ref={inputRef}
            className={styles.textInput}
            value={inputValue}
            onChange={handleTextInputChange}
            onBlur={handleTextInputBlur}
          />
        </div>
      </>
    )
  }
)

const ImageWithSrc = React.forwardRef(({ src, ...props }: any, ref) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => {
      setImage(img)
    }
    img.onerror = (err) => {
      console.error('Image load error:', err)
    }
  }, [src])

  return (
    <KonvaImage
      ref={ref}
      image={image}
      {...props}
    />
  )
})

export default CanvasEditor
