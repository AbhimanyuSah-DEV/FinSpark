import client from './client'
import type { AxiosResponse } from 'axios'
import type { AdminDashboard, Incident, IncidentListResponse, QuantumOverview, BehaviourProfile } from '../types'

export const getAdminDashboard = (): Promise<AdminDashboard> =>
  client.get('/admin/dashboard').then((r: AxiosResponse<AdminDashboard>) => r.data)

export const getIncidents = (page = 1, riskLevel?: string): Promise<IncidentListResponse> =>
  client.get('/admin/incidents', { params: { page, ...(riskLevel && { risk_level: riskLevel }) } })
    .then((r: AxiosResponse<IncidentListResponse>) => r.data)

// Use human-readable incident_id like "INC-1003" — NOT UUID
export const getIncidentDetail = (incidentId: string): Promise<Incident> =>
  client.get(`/admin/incidents/${incidentId}`).then((r: AxiosResponse<Incident>) => r.data)

export const getAllTransactions = (page = 1, pageSize = 20) =>
  client.get('/admin/transactions', { params: { page, page_size: pageSize } })
    .then((r: AxiosResponse) => r.data)

export const getQuantumOverview = (): Promise<QuantumOverview> =>
  client.get('/admin/quantum').then((r: AxiosResponse<QuantumOverview>) => r.data)

export const getBehaviourProfile = (userId: string): Promise<BehaviourProfile> =>
  client.get(`/admin/behaviour/${userId}`).then((r: AxiosResponse<BehaviourProfile>) => r.data)

export const getAllUsers = () =>
  client.get('/admin/users').then((r: AxiosResponse) => r.data)

// ── AI Chat ─────────────────────────────────────────────────────────────────
export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export const adminChat = (
  message: string,
  incidentId?: string,
  history: ChatMessage[] = []
): Promise<{ reply: string; context_used: string[] }> =>
  client.post('/admin/chat', { message, incident_id: incidentId, history })
    .then((r: AxiosResponse) => r.data)

// ── Transaction Actions ──────────────────────────────────────────────────────
export const transactionAction = (
  transactionId: string,
  action: 'REVERSE' | 'CANCEL',
  reason = ''
): Promise<{ success: boolean; action: string; message: string; new_status: string }> =>
  client.post(`/admin/transactions/${transactionId}/action`, { action, reason })
    .then((r: AxiosResponse) => r.data)
