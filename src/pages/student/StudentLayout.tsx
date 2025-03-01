import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { spinnerState } from '../../state/spinnerState'
import { authState } from '../../state/authState'
import { departmentState } from '../../state/departmentState'
import { updateThumbnailPaths } from '../../components/common/BlobObjectURL'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'

const StudentLayout: React.FC = () => {
  const auth: any = useRecoilValue(authState)
  const [learning, setLearning] = useState<any[]>([])
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [finished, setFinished] = useState<any[]>([])
  const [, setIsLoading] = useRecoilState(spinnerState)
  const [, setDepartment] = useRecoilState(departmentState)

  const fetchLectures = useCallback(async () => {
    try {
      const response = await api.post(`${apiConfig.prof.lecture.studSbjList}`, {
        userId: auth.id,
        size: 2000,
        page: 0,
      })
      console.log(response.data.content)
      if (response.data.content.length > 0) {
        const sortedData = response.data.content.sort(
          (a: any, b: any) => b.sbjId - a.sbjId
        )
        const updatedData = await updateThumbnailPaths(sortedData, 'subject')

        const categorized = updatedData.reduce(
          (acc: any, subject: any) => {
            acc[subject.sbjStatus].push(subject)
            return acc
          },
          { '-1': [], '0': [], '1': [], '2': [] } as { [key: string]: any[] }
        )

        setUpcoming(categorized['0']) // 수강 예정
        setLearning(categorized['1']) // 수강 중
        setFinished(categorized['2']) // 수강 완료
      }
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

  useEffect(() => {
    if (!auth.id) return
    setIsLoading(true)
    const fetchData = async () => {
      try {
        await Promise.all([fetchLectures(), fetchDepartment()])
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
  }, [auth.id, fetchLectures, fetchDepartment])

  return (
    <>
      <Outlet context={{ learning, upcoming, finished, auth }} />
    </>
  )
}

export default StudentLayout
