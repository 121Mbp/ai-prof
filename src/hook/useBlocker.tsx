import { useEffect } from 'react'

const useBlockNavigation = () => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  //   useEffect(() => {
  //     const handlePageLeave = (event: BeforeUnloadEvent) => {
  //       event.preventDefault()
  //     }

  //     window.addEventListener('popstate', handlePageLeave)
  //     const originalPushState = history.pushState
  //     const originalReplaceState = history.replaceState

  //     history.pushState = function (event: BeforeUnloadEvent) {
  //       handlePageLeave(event)
  //       return originalPushState.apply(history, arguments as any)
  //     }

  //     history.replaceState = function (event: BeforeUnloadEvent) {
  //       handlePageLeave(event)
  //       return originalReplaceState.apply(history, arguments as any)
  //     }
  //     return () => {
  //       window.removeEventListener('popstate', handlePageLeave)
  //       history.pushState = originalPushState
  //       history.replaceState = originalReplaceState
  //     }
  //   }, [location])
}

export default useBlockNavigation
