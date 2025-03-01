import { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { departmentState } from '../../state/departmentState'
import styles from './../../assets/styles/Layout.module.scss'
import Select from '../../components/common/Select'
import Sort from '../../components/common/Sort'

interface StudentFilterProps {
  originalLecture: any
  filteredLecture: any
  setFilteredLecture: (data: any) => void
}

const StudentFilter: React.FC<StudentFilterProps> = ({
  originalLecture,
  filteredLecture,
  setFilteredLecture,
}) => {
  const filterRef = useRef<HTMLDivElement>(null)
  const department: any[] = useRecoilValue(departmentState) || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  )

  const isDataEmpty = originalLecture?.length === 0

  const handleSort = (sortType: string) => {
    let sortedData = [...filteredLecture]
    if (sortType === '최신 순') {
      sortedData = sortedData?.sort((a, b) => b.sbjId - a.sbjId)
    } else if (sortType === '이름 순') {
      sortedData = sortedData?.sort((a, b) => a.sbjNm.localeCompare(b.sbjNm))
    }
    setFilteredLecture?.(sortedData)
  }

  const handleDepartmentFilterName = (name: string) => {
    setSelectedDepartment(name)
  }

  useEffect(() => {
    let filteredData = [...originalLecture]

    if (
      selectedDepartment &&
      selectedDepartment !== '학과 전체' &&
      selectedDepartment !== '과목 전체'
    ) {
      filteredData = filteredData.filter(
        (item: any) => item.deptNm === selectedDepartment
      )
    }

    setFilteredLecture(filteredData)
  }, [setFilteredLecture, selectedDepartment])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className={styles.filter}>
      <div ref={filterRef}>
        <Select
          title={`학과 전체`}
          data={[{ deptCd: '', deptNm: '학과 전체' }, ...department]}
          isOpen={openIndex === 0}
          setIsOpen={() => setOpenIndex(openIndex === 0 ? null : 0)}
          isDataEmpty={isDataEmpty}
          onSelect={(value: string) => {
            handleDepartmentFilterName(value)
          }}
        />
        <Select
          title={`과목 전체`}
          data={[{ deptCd: '', deptNm: '과목 전체' }]}
          isOpen={openIndex === 1}
          setIsOpen={() => setOpenIndex(openIndex === 1 ? null : 1)}
          isDataEmpty={isDataEmpty}
        />
        <Select
          title={`과정 전체`}
          data={[{ sbjCd: '', sbjNm: '과정 전체' }]}
          isOpen={openIndex === 2}
          setIsOpen={() => setOpenIndex(openIndex === 2 ? null : 2)}
          isDataEmpty={isDataEmpty}
        />
        <Select
          title={`주차`}
          data={[{ weekCd: '', weekNm: '주차' }]}
          isOpen={openIndex === 3}
          setIsOpen={() => setOpenIndex(openIndex === 3 ? null : 3)}
          isDataEmpty={isDataEmpty}
        />
      </div>
      <Sort
        array={['최신 순', '이름 순']}
        isDataEmpty={isDataEmpty}
        onSort={handleSort}
      />
    </div>
  )
}

export default StudentFilter
