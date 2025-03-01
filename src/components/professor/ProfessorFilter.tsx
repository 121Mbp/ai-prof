import { useEffect, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { departmentState } from '../../state/departmentState'
import styles from './../../assets/styles/Layout.module.scss'
import Select from '../../components/common/Select'
import Sort from '../../components/common/Sort'

interface ProfessorFilterProps {
  originalLecture: any
  filteredLecture: any
  setFilteredLecture: (data: any) => void
}

const ProfessorFilter: React.FC<ProfessorFilterProps> = ({
  originalLecture,
  filteredLecture,
  setFilteredLecture,
}) => {
  const filterRef = useRef<HTMLDivElement>(null)
  const department: any[] = useRecoilValue(departmentState) || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
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
    setFilteredLecture(sortedData)
  }

  const handleFilterStatus = (status: string) => {
    setSelectedStatus(status)
  }

  const handleDepartmentFilterName = (name: string) => {
    setSelectedDepartment(name)
  }

  useEffect(() => {
    let filteredData = [...originalLecture]

    if (selectedStatus && selectedStatus !== 'all') {
      filteredData = filteredData.filter(
        (item: any) => item.sbjStatus === selectedStatus
      )
    }

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
  }, [setFilteredLecture, selectedStatus, selectedDepartment])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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
        <Select
          title={'전체'}
          data={[
            { statusCd: 'all', statusNm: '전체' },
            { statusCd: '0', statusNm: '진행예정' },
            { statusCd: '1', statusNm: '진행중' },
            { statusCd: '2', statusNm: '진행완료' },
          ]}
          isOpen={openIndex === 4}
          setIsOpen={() => setOpenIndex(openIndex === 4 ? null : 4)}
          isDataEmpty={isDataEmpty}
          onSelect={(value: string) => {
            handleFilterStatus(value)
          }}
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

export default ProfessorFilter
