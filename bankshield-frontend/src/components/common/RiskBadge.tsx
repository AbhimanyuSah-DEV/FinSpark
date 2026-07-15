import React from 'react'
import { RISK_COLORS } from '../../utils/constants'
import type { RiskLevel } from '../../types'

interface RiskBadgeProps {
  level: RiskLevel | string
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showDot = true }) => {
  const colors = RISK_COLORS[level] ?? RISK_COLORS['LOW']

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size]

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${colors.pulse}`} />
      )}
      {level}
    </span>
  )
}

export default RiskBadge
