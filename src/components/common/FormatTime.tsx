export const FormatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

export const FormatDate = (dateString: string | Date) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('en-CA').format(new Date(dateString))
}

export const FormattedDate = (dateString: string | Date) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}
