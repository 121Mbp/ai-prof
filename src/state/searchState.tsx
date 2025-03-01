import { atom } from 'recoil'

export const searchState = atom({
  key: 'searchState',
  default: false,
})

export const searchQueryName = atom({
  key: 'searchQueryName',
  default: '',
})
