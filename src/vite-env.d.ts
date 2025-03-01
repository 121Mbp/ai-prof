/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// declare module '@/*'
declare module 'swiper/scss'
declare module 'swiper/scss/navigation'
declare module 'swiper/scss/pagination'
declare module '*.svg' {
  import * as React from 'react'
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
  const src: string
  export default src
}
