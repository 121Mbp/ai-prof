import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { authState } from '../../state/authState'
import { searchQueryName } from '../../state/searchState'
import { layerpopupState } from '../../state/layerpopupState'
import { spinnerState } from '../../state/spinnerState'
import { FormatDate } from '../../components/common/FormatTime'
import styles from './../../assets/styles/Search.module.scss'
import api from '../../utils/apiService'
import apiConfig from '../../utils/apiConfig.json'
import Search from '@/assets/svg/search.svg?react'

const SearchPage: React.FC = () => {
  const navigate = useNavigate()
  const auth: any = useRecoilValue(authState)
  const [data, setData] = useState<string[]>([])
  const [search, setSearch] = useRecoilState(searchQueryName)
  const [, setIsLayer] = useRecoilState(layerpopupState)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [, setIsLoading] = useRecoilState(spinnerState)

  const handleItemView = (id: number | undefined) => {
    navigate(`/${auth.role}/lecture/${id}`)
    console.log(`/${auth.role}/lecture/${id}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!search.trim()) {
      setIsLayer({
        isOpen: true,
        title: '검색어',
        message: '검색어를 입력해 주세요.',
      })
      return
    }
  }

  useEffect(() => {
    setIsLoading(true)
    const fetchSearch = async () => {
      try {
        const response = await api.post(`${apiConfig.prof.lecture.allList}`)
        const data = response.data.reverse()
        setData(data)
        setIsLoading(false)
      } catch (error) {
        console.warn(error)
        setIsLoading(false)
      }
    }
    fetchSearch()
  }, [setIsLoading])

  const handleTabIndex = (index: number) => () => {
    setActiveTab(index)
  }

  return (
    <div className={styles.searchPage}>
      <form onSubmit={handleSearch}>
        <button type='submit'>
          <Search />
        </button>
        <input
          type='text'
          value={search || ''}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <div>
        <ul>
          {['전체', '수강 예정', '수강중', '수강 완료'].map((label, index) => (
            <li
              key={index}
              className={activeTab === index ? styles.on : ''}
            >
              <button onClick={handleTabIndex(index)}>{label}</button>
            </li>
          ))}
        </ul>
        <div>
          <div>
            {data.length > 0 ? <p>{data.length}개의 검색 결과</p> : <p></p>}
            <select>
              <option value={`1`}>최신순</option>
              <option value={`2`}>이름순</option>
            </select>
          </div>
          <ul className={data.length === 0 ? styles.empty : ''}>
            {data?.length > 0 ? (
              data?.map((item: any, i: number) => (
                <li
                  key={`item` + i}
                  onClick={
                    item.category === 'upcoming'
                      ? () =>
                          setIsLayer({
                            isOpen: true,
                            title: '수강일에 만나요!',
                            message:
                              '03월 12일<span>부터 수강 가능합니다.</span>',
                          })
                      : () => handleItemView(item.id)
                  }
                >
                  <Link to='/'>
                    <div>
                      <div
                        style={{
                          backgroundImage: `url('https://s3-alpha-sig.figma.com/img/0eda/2aba/8229998259707a3893eaaf6def1ad69d?Expires=1735516800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=pOzKE-PAC9VQbX2IFaDqrLHepvYOHhQHnmndp9EaiybYjNCshC7MrirVA1a596k-KYfoSK2gnNhQt~t-2PaifN2rwtCOCteEWMUUJZQvBEH647Gi6angrY7X4ABtOCqqQwBw7IXX9fvW~0KrCWgPoyuLWpqfV5ZGQ9ZCtu9FOonBM5Vsl9oH9Xxz7ES4mkSo17XEZWnFqJJQ0ULfjfQBZBCbnMcR-U9cIvSeGPhMwdASF15sn4cu6erNTF1qIYUd5KfzF2I02j6mUXCuLpQ32fPL2dj~tJEbhkl7ZQCR-tNMPCwg1rgVkh2kknloDk~Ucc5EpTfIJse4y6hjCleDjQ__')`,
                        }}
                      ></div>
                    </div>
                    <div>
                      <p>{item.title}</p>
                      <p>CHAPTER 1 - 2</p>
                      <p>
                        {item.lctrStatus === '0' && (
                          <span className={styles.purple}>진행 예정</span>
                        )}
                        {item.lctrStatus === '1' && (
                          <span className={styles.primary}>진행중</span>
                        )}
                        {item.lctrStatus === '2' && <span>진행 완료</span>}
                        {FormatDate(item.rlsStartDtm)} ~
                        {FormatDate(item.rlsCmplDtm)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li>검색 결과가 없습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
