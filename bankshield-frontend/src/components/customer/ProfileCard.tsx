import React from 'react'
import { User, Mail, CreditCard } from 'lucide-react'

interface ProfileCardProps {
  fullName: string
  email?: string
  username: string
  accountNumber: string
}

const ProfileCard: React.FC<ProfileCardProps> = ({ fullName, email, username, accountNumber }) => {
  const initials = fullName
    ? fullName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  const maskedAccount = accountNumber
    ? `•••• ${accountNumber.slice(-4)}`
    : '•••• ––––'

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center flex-shrink-0">
          <span className="text-gold font-bold text-lg leading-none">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-text font-semibold text-sm leading-tight truncate">{fullName}</p>
          <p className="text-muted text-xs mt-0.5 truncate">@{username}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-3" />

      {/* Info rows */}
      <div className="space-y-2.5">
        {email && (
          <div className="flex items-center gap-2.5">
            <Mail size={13} className="text-muted flex-shrink-0" />
            <span className="text-xs text-muted truncate">{email}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <User size={13} className="text-muted flex-shrink-0" />
          <span className="text-xs text-muted">@{username}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <CreditCard size={13} className="text-muted flex-shrink-0" />
          <span className="text-xs font-mono text-muted">{maskedAccount}</span>
        </div>
      </div>

      {/* Role badge */}
      <div className="mt-4 bg-gold/8 border border-gold/20 rounded-lg px-3 py-1.5 text-center">
        <span className="text-xs font-semibold text-gold uppercase tracking-widest">
          Verified Customer
        </span>
      </div>
    </div>
  )
}

export default ProfileCard
