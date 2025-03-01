import { atom } from 'recoil'

export const webSocketState = atom<WebSocket | null>({
  key: 'webSocketState',
  default: null,
})
