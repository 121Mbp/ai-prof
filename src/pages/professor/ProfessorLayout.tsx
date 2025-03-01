import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { spinnerState } from '../../state/spinnerState'
import { authState } from '../../state/authState'
import { departmentState } from '../../state/departmentState'
import { updateThumbnailPaths } from '../../components/common/BlobObjectURL'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'

const ProfessorLayout: React.FC = () => {
  const auth: any = useRecoilValue(authState)
  const [lecture, setLecture] = useState<any[]>([])
  const [metahuman, setMetahuman] = useState<any[]>([])
  const [background, setBackground] = useState<any[]>([])
  const [, setIsLoading] = useRecoilState(spinnerState)
  const [, setDepartment] = useRecoilState(departmentState)

  const fetchLectures = useCallback(async () => {
    try {
      const response = await api.post(`${apiConfig.prof.lecture.profSbjList}`, {
        userId: auth.id,
        size: 2000,
        page: 0,
      })
      const sortedData = response.data.content.sort(
        (a: any, b: any) => b.sbjId - a.sbjId
      )
      setLecture(await updateThumbnailPaths(sortedData, 'subject'))
    } catch (error) {
      console.warn(error)
    }
  }, [auth.id])

  const fetchDepartment = useCallback(async () => {
    try {
      const response = await api.post(`${apiConfig.prof.department.allList}`)
      const sortedData = response.data.sort((a: any, b: any) =>
        a.deptNm.localeCompare(b.deptNm, 'ko', { sensitivity: 'base' })
      )
      setDepartment(sortedData)
    } catch (error) {
      console.warn(error)
    }
  }, [])

  const fetchMetahuman = useCallback(async () => {
    try {
      const response = await api.post(`${apiConfig.prof.metahuman.allList}`, {
        userId: auth.id,
      })
      setMetahuman(
        await updateThumbnailPaths(response.data.reverse(), 'metahuman')
      )
    } catch (error) {
      console.warn(error)
    }
  }, [auth.id])

  const fetchBackground = useCallback(async () => {
    try {
      const response = await api.get(`${apiConfig.prof.background.allList}`)
      const data = response.data.reverse()

      const defaultRes = await api.get(
        `${apiConfig.prof.background.defaultBackground}${auth.id}`
      )
      const defaultBgId = defaultRes.data.bgId

      const updatedData = await Promise.all(
        data.map(async (item: any) => {
          if (item.lctrBgPath?.startsWith('/workspace')) {
            const [folder, filename] = item.lctrBgPath.split('/').slice(-2)
            try {
              const imageRes = await api.get(
                `${apiConfig.prof.background.backgroundImage}/${folder}/${filename}`,
                { responseType: 'blob' }
              )
              if (imageRes.status === 200) {
                item.lctrBgPath = URL.createObjectURL(imageRes.data)
              }
            } catch (error) {
              console.warn(error)
            }
          }
          return {
            ...item,
            defaultYn: item.lctrBgId === defaultBgId ? 'Y' : 'N',
          }
        })
      )

      setBackground(updatedData)
    } catch (error) {
      console.warn(error)
    }
  }, [auth.id])

  useEffect(() => {
    if (!auth.id) return
    setIsLoading(true)

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchMetahuman(),
          fetchLectures(),
          fetchBackground(),
          fetchDepartment(),
        ])
      } catch (error) {
        console.warn(error)
      } finally {
        if (!location.pathname.includes('/learning/')) {
          setTimeout(() => {
            setIsLoading(false)
          }, 600)
        }
      }
    }

    fetchData()
  }, [auth.id, fetchMetahuman, fetchLectures, fetchBackground, fetchDepartment])

  return (
    <>
      <Outlet
        context={{
          lecture,
          metahuman,
          background,
          fetchLectures,
          fetchMetahuman,
          fetchBackground,
          auth,
        }}
      />
    </>
  )
}

export default ProfessorLayout
