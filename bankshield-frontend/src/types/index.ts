// ── TypeScript types matching backend response shapes exactly ────────────────

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string
  token_type:   string
  role:         'USER' | 'ADMIN'
  user_id:      string
  full_name:    string
}

export interface LoginPayload {
  username:    string
  password:    string
  ip_address?: string
  device?:     string
  browser?:    string
  location?:   string
}

export interface UserProfile {
  id:             string
  full_name:      string
  email:          string
  username:       string
  account_number: string
  balance:        number
  role:           'USER' | 'ADMIN'
}

export interface LoginHistory {
  id:        string
  timestamp: string
  location:  string
  device:    string
  ip:        string
  status:    string
}

// ── Transactions ──────────────────────────────────────────────────────────────
export interface Transaction {
  id:               string
  sender?:          string
  receiver?:        string
  amount:           number
  transaction_type: string
  status:           string
  location?:        string
  ip_address?:      string
  device?:          string
  merchant?:        string
  timestamp:        string
}

export interface TransferPayload {
  receiver_account:  string
  amount:            number
  transaction_type:  string
  password:          string
  description?:      string
  device?:           string
  ip_address?:       string
  location?:         string
  merchant?:         string
}

// ── Incident ──────────────────────────────────────────────────────────────────
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface TimelineEvent {
  time:        string
  event:       string
  detail:      string
  type:        string
  risk_level?: string
}

export interface Incident {
  id:                       string
  incident_id:              string
  transaction_id:           string | null
  user_id:                  string
  incident_type:            string
  risk_level:               RiskLevel
  overall_risk_score:       number
  fraud_probability:        number
  fraud_confidence:         number
  fraud_reasons:            string[]
  behaviour_deviation_score:number
  correlation_signals:      string[]
  timeline:                 TimelineEvent[]
  ai_summary:               string
  why_suspicious:           string
  business_impact:          string
  recommended_actions:      string[]
  quantum_exposure_score:   number
  quantum_hndl_warning:     boolean
  quantum_recommendation:   string
  created_at:               string
  affected_user:            string
  transaction_amount:       number | null
}

export interface TransferResponse extends Incident {
  transaction: {
    id:               string
    amount:           number
    receiver_account: string
    status:           string
  }
}

// ── Dashboards ────────────────────────────────────────────────────────────────
export interface UserDashboard {
  full_name:           string
  account_number:      string
  balance:             number
  recent_transactions: Transaction[]
  total_transactions:  number
}

export interface AdminKPI {
  total_transactions:   number
  total_incidents:      number
  critical_incidents:   number
  high_incidents:       number
  medium_incidents:     number
  low_incidents:        number
  fraud_rate:           number
  avg_fraud_probability:number
  quantum_alerts:       number
}

export interface AdminDashboard {
  kpi:                 AdminKPI
  recent_incidents:    Incident[]
  recent_transactions: Transaction[]
}

export interface IncidentListResponse {
  incidents:  Incident[]
  total:      number
  page:       number
  page_size:  number
}

// ── Quantum ───────────────────────────────────────────────────────────────────
export interface QuantumIncident {
  incident_id:             string
  quantum_exposure_score:  number
  quantum_hndl_warning:    boolean
  quantum_recommendation:  string
  affected_user:           string
  created_at:              string
}

export interface QuantumOverview {
  total_quantum_alerts: number
  incidents:            QuantumIncident[]
}

// ── Behaviour Profile ─────────────────────────────────────────────────────────
export interface BehaviourProfile {
  user_id:           string
  usual_locations:   string[]
  usual_devices:     string[]
  usual_merchants:   string[]
  usual_tx_min:      number
  usual_tx_max:      number
  usual_hours_start: number
  usual_hours_end:   number
  transaction_count: number
}
