import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { searchState, searchQueryName } from './../../state/searchState'
import { layerpopupState } from './../../state/layerpopupState'
import styles from '@/assets/styles/Search.module.scss'
import Close from '@/assets/svg/close.svg?react'
import Search from '@/assets/svg/search.svg?react'

const SearchBox: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState<string>()
  const [isOpen, setIsOpen] = useRecoilState(searchState)
  const [, setIsLayer] = useRecoilState(layerpopupState)
  const [, setSearchName] = useRecoilState(searchQueryName)

  if (!isOpen) return null

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (search === undefined || search.trim().length < 1) {
      setIsLayer({
        isOpen: true,
        title: '검색어',
        message: '검색어를 입력해 주세요.',
      })
      return
    }
    setSearchName('')
    setSearchName(search)
    setIsOpen(false)
    navigate('/search')
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className={styles.searchBox}>
      <button onClick={handleClose}>
        <Close />
      </button>
      <form onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='검색어를 입력하세요'
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type='submit'>
          <Search />
        </button>
      </form>
    </div>
  )
}

export default SearchBox
