// API base URL from environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Local storage keys
export const TOKEN_KEY = 'bankshield_token'
export const USER_KEY  = 'bankshield_user'

// Roles
export enum Role {
  USER  = 'USER',
  ADMIN = 'ADMIN',
}

// Risk levels
export enum RiskLevel {
  LOW      = 'LOW',
  MEDIUM   = 'MEDIUM',
  HIGH     = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Risk colour map
export const RISK_COLORS: Record<string, { bg: string; text: string; border: string; pulse: string }> = {
  LOW:      { bg: 'bg-success/10',  text: 'text-success',  border: 'border-success/30',  pulse: '' },
  MEDIUM:   { bg: 'bg-warning/10',  text: 'text-warning',  border: 'border-warning/30',  pulse: '' },
  HIGH:     { bg: 'bg-orange/10',   text: 'text-orange',   border: 'border-orange/30',   pulse: 'animate-pulse-slow' },
  CRITICAL: { bg: 'bg-danger/10',   text: 'text-danger',   border: 'border-danger/30',   pulse: 'animate-pulse-fast' },
}

// Pipeline stages for BrainCore animation
export const PIPELINE_STAGES = [
  { id: 1, label: 'Submitting Transaction',       icon: 'send' },
  { id: 2, label: 'Analysing Behaviour Profile',  icon: 'user-check' },
  { id: 3, label: 'Running Correlation Engine',   icon: 'git-branch' },
  { id: 4, label: 'Consulting Fraud AI Model',    icon: 'cpu' },
  { id: 5, label: 'Computing Threat Score',       icon: 'shield-alert' },
  { id: 6, label: 'Building Incident Record',     icon: 'file-text' },
  { id: 7, label: 'Generating AI Summary',        icon: 'sparkles' },
  { id: 8, label: 'Complete',                     icon: 'check-circle' },
]

// Auto-refresh interval (ms)
export const REFRESH_INTERVAL = 30_000
