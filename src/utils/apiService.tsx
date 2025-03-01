import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_HOST_NAME}`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.log('interceptors', error)
    if (error.message === 'Network Error') {
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
