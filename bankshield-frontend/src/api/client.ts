import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: { response?: { status: number } }) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('bankshield_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
