import client from './client'
import type { AxiosResponse } from 'axios'
import type { UserDashboard, Transaction, TransferPayload, TransferResponse, UserProfile } from '../types'

export const getUserDashboard = (): Promise<UserDashboard> =>
  client.get('/user/dashboard').then((r: AxiosResponse<UserDashboard>) => r.data)

export const getMyTransactions = (limit = 20, offset = 0): Promise<Transaction[]> =>
  client.get('/user/transactions', { params: { limit, offset } }).then((r: AxiosResponse<Transaction[]>) => r.data)

export const getUserProfile = (): Promise<UserProfile> =>
  client.get('/user/profile').then((r: AxiosResponse<UserProfile>) => r.data)

export const submitTransfer = (payload: TransferPayload): Promise<TransferResponse> =>
  client.post('/user/transfer', payload).then((r: AxiosResponse<TransferResponse>) => r.data)

export const getLoginHistory = (): Promise<import('../types').LoginHistory[]> =>
  client.get('/user/login-history').then((r: AxiosResponse<import('../types').LoginHistory[]>) => r.data)
