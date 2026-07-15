import client from './client'
import type { TokenResponse, LoginPayload, UserProfile } from '../types'
import type { AxiosResponse } from 'axios'

export const login = (payload: LoginPayload): Promise<TokenResponse> =>
  client.post('/auth/login', payload).then((r: AxiosResponse<TokenResponse>) => r.data)

export const getMe = (): Promise<UserProfile> =>
  client.get('/auth/me').then((r: AxiosResponse<UserProfile>) => r.data)
