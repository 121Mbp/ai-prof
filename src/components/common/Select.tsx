import { useEffect, useState } from 'react'
import styles from '@/assets/styles/Common.module.scss'
import Updn from '@/assets/svg/updn.svg?react'

interface SelectProps {
  lctrId?: string
  title?: string
  data?: any[]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isDataEmpty?: boolean
  onSelect?: (value: string) => void
}

const Select: React.FC<SelectProps> = ({
  lctrId,
  title,
  data = [],
  isOpen,
  setIsOpen,
  isDataEmpty,
  onSelect,
}) => {
  const sampleItem = data?.[0] || {}
  const titleKey =
    Object.keys(sampleItem).find((key) => key.endsWith('Nm')) || ''
  const valueKey =
    Object.keys(sampleItem).find((key) => key.endsWith('Cd')) || ''

  const defaultSelectedItem =
    data?.find((item) => item[valueKey] == lctrId) || sampleItem

  const [selectedItem, setSelectedItem] = useState(
    defaultSelectedItem[titleKey] || title
  )

  useEffect(() => {
    if (defaultSelectedItem) {
      setSelectedItem(defaultSelectedItem[titleKey])
    }
  }, [defaultSelectedItem])

  const handleSelect = (item: any) => {
    setSelectedItem(item[titleKey])
    onSelect?.(item[valueKey])
  }

  return (
    <div className={`${styles.select} ${isDataEmpty ? styles.disabled : ''}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedItem}</span>
        <button>
          <Updn />
        </button>
        {data?.length > 0 && (
          <div className={`${styles.dropdown} ${isOpen ? styles.active : ''}`}>
            <ul>
              {data?.map((item, i) => (
                <li
                  key={item[valueKey] || i}
                  onClick={() => handleSelect(item)}
                  className={item[titleKey] === selectedItem ? styles.on : ''}
                >
                  {item[titleKey]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Select
