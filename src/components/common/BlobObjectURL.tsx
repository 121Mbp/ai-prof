import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'

export const updateThumbnailPaths = async (
  data?: any,
  type?: string
): Promise<any> => {
  const updatedData = await Promise.all(
    data?.map(async (item: any) => {
      try {
        if (item?.thumbPath && item.thumbPath?.startsWith('/workspace')) {
          const path = item?.thumbPath.split('/')
          const folder = path[path.length - 2]
          const filename = path[path.length - 1]
          const thumbResponse = await api.get(
            type === 'subject'
              ? `${apiConfig.prof.lecture.thumbnail}/${folder}/${filename}`
              : type === 'metahuman'
              ? `${apiConfig.prof.metahuman.thumbnail}/${folder}/${filename}`
              : '',
            {
              responseType: 'blob',
            }
          )
          const blobUrl = URL.createObjectURL(thumbResponse.data)
          if (thumbResponse.status === 200) {
            return { ...item, thumbPath: blobUrl }
          }
        }
        return item
      } catch (error) {
        console.warn(error)
        return item
      }
    })
  )
  return updatedData
}
