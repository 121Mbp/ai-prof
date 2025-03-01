import { atom } from 'recoil'

export const recordingState = atom<MediaStream | null>({
  key: 'recordingState',
  default: null,
})
