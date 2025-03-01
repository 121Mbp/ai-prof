import { useState } from 'react'
import styles from './../../assets/styles/Common.module.scss'

interface SortProps {
  array: string[]
  isDataEmpty: boolean
  onSort: (sortType: string) => void
}

const Sort: React.FC<SortProps> = ({ array, isDataEmpty, onSort }) => {
  const [activeTab, setActiveTab] = useState<number>(0)

  const handleTabIndex = (index: number) => {
    setActiveTab(index)
    onSort(array[index])
  }
  return (
    <div className={`${styles.sort} ${isDataEmpty ? styles.disabled : ''}`}>
      <ul>
        {array.map((item, i) => (
          <li
            key={i}
            className={activeTab === i ? styles.on : ''}
          >
            <button onClick={() => handleTabIndex(i)}>{item}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sort
