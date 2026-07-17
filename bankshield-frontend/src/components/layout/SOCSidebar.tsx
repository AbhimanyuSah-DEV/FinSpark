import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Brain, AlertTriangle, Activity, Atom, Settings, Shield } from 'lucide-react'

// Sections that exist on the /soc page — clicking scrolls to them
const NAV_ITEMS = [
  { label: 'Dashboard',            icon: LayoutDashboard, sectionId: null          },
  { label: 'Threat Intelligence',  icon: Brain,           sectionId: 'threats'     },
  { label: 'Incidents',            icon: AlertTriangle,   sectionId: 'incidents'   },
  { label: 'Live Monitoring',      icon: Activity,        sectionId: 'live'        },
  { label: 'Quantum Intelligence', icon: Atom,            sectionId: 'quantum'     },
  { label: 'Settings',             icon: Settings,        sectionId: null          },
]

const SOCSidebar: React.FC = () => {
  const navigate = useNavigate()
  const [activeLabel, setActiveLabel] = React.useState('Dashboard')

  const handleClick = (label: string, sectionId: string | null) => {
    setActiveLabel(label)
    if (sectionId) {
      // Smooth scroll to the section on the current /soc page
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else if (label === 'Dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate('/soc')
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-surface border-r border-border flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-gold" />
          <div className="leading-none">
            <p className="text-xs text-muted font-medium uppercase tracking-widest">Security Operations</p>
            <p className="text-sm font-bold text-text mt-0.5">Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, sectionId }) => {
          const isActive = activeLabel === label
          return (
            <button
              key={label}
              onClick={() => handleClick(label, sectionId)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 text-left
                ${isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-muted hover:text-text hover:bg-surface-2 border border-transparent'}
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-muted/50">BankShield AI</p>
        <p className="text-xs text-muted/50">SOC Platform v1.0</p>
      </div>
    </aside>
  )
}

export default SOCSidebar
