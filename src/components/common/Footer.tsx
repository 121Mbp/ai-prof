import { Link } from 'react-router-dom'
import styles from './../../assets/styles/Layout.module.scss'
import SiteMore from '@/assets/svg/more.svg?react'

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div>
        <p>All rights reserved.</p>
        <ul>
          <li>
            <Link to={'#'}>운영정책</Link>
          </li>
          <li>
            <Link to={'#'}>이용약관</Link>
          </li>
          <li>
            <Link to={'#'}>개인정보처리방침</Link>
          </li>
          <li>
            <span>
              Family Site
              <SiteMore />
            </span>
            <div>
              <ul>
                <li>
                  <Link
                    to={`https://www.navar.com/`}
                    target='_blank'
                  >
                    AI 대학교
                  </Link>
                </li>
                <li>
                  <Link
                    to={`https://www.navar.com/`}
                    target='_blank'
                  >
                    AI 교육원
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
