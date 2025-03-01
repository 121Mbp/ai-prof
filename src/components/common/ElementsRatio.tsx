import { v4 as uuidv4 } from 'uuid'

// 926 * 520
const CANVAS_WIDTH = 456
const CANVAS_HEIGHT = 278

const scaleElementPropsResponse = (props: any) => {
  const scaledX = 0.08639309 * CANVAS_WIDTH
  const scaledY =
    props.slidType === 'Title'
      ? 0.15384615 * CANVAS_HEIGHT
      : props.slidType === 'Content'
      ? 0.23076923 * CANVAS_HEIGHT
      : 0
  const scaledWidth =
    props.width !== undefined ? props.width * CANVAS_WIDTH : undefined
  const scaledHeight =
    props.height !== undefined ? props.height * CANVAS_HEIGHT : undefined
  const scaledFontSize = props.fontSize
    ? Math.round(props.fontSize * CANVAS_WIDTH)
    : props.slidType === 'Title'
    ? 0.02807775 * CANVAS_WIDTH
    : props.slidType === 'Content'
    ? 0.02591793 * CANVAS_WIDTH
    : undefined
  const scaledFontStyle = props.fontStyle
    ? props.fontStyle
    : props.slidType === 'Title'
    ? 'bold'
    : props.slidType === 'Content' && 'normal'
  return {
    ...props,
    x: scaledX,
    y: scaledY,
    width: scaledWidth,
    height: scaledHeight,
    fontSize: scaledFontSize,
    fontStyle: scaledFontStyle,
  }
}

export const processSlidesRatiosResponse = (data: any) => {
  return data?.map((lecture: any) => ({
    ...lecture,
    slides: lecture?.slides.map((slide: any) => ({
      ...slide,
      elements: slide?.elements.map((element: any) => ({
        ...element,
        props: scaleElementPropsResponse(element.props),
      })),
    })),
  }))
}

const scaleElementPropsRequest = (props: any) => {
  const scaledX = props.x ? props.x / CANVAS_WIDTH : 0
  const scaledY = props.y ? props.y / CANVAS_HEIGHT : 0
  const scaledWidth =
    props.width !== undefined ? props.width / CANVAS_WIDTH : undefined
  const scaledHeight =
    props.height !== undefined ? props.height / CANVAS_HEIGHT : undefined
  const scaledFontSize = props.fontSize
    ? Math.round(props.fontSize / CANVAS_WIDTH)
    : undefined

  return {
    ...props,
    x: scaledX,
    y: scaledY,
    width: scaledWidth,
    height: scaledHeight,
    fontSize: scaledFontSize,
  }
}

// export const processSlidesRatiosRequest = (data: any) => {
//   return data.map((element: any) => ({
//     ...element,
//     props: scaleElementPropsRequest(element.props),
//   }))
// }

export const processSlidesRatiosRequest = (data: any) => {
  return data?.map((lecture: any) => ({
    ...lecture,
    slides: lecture?.slides.map((slide: any) => ({
      ...slide,
      elements: slide?.elements.map((element: any) => ({
        ...element,
        props: scaleElementPropsRequest(element.props),
      })),
    })),
  }))
}

export const defaultSlideSetting = async (background: any) => {
  const elements = []

  if (background?.lctrBgPath) {
    elements.push({
      id: `${uuidv4()}`,
      type: 'image',
      props: {
        x: 0,
        y: 0,
        height: 278,
        src: background.lctrBgPath,
        bgId: background.lctrBgId,
        draggable: false,
      },
    })
  }

  return elements
}
