export const convertToRatioWidth = (value: number, canvasWidth: number) => {
  return value / canvasWidth
}

export const convertToRatioHeight = (value: number, canvasHeight: number) => {
  return value / canvasHeight
}

export const convertFromRatioWidth = (ratio: number, canvasWidth: number) => {
  return ratio * canvasWidth
}

export const convertFromRatioHeight = (ratio: number, canvasHeight: number) => {
  return ratio * canvasHeight
}
