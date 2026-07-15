import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoaderProps {
  text?: string
  fullPage?: boolean
}

const Loader: React.FC<LoaderProps> = ({ text = 'Loading…', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
            <Loader2 size={24} className="text-gold animate-spin" />
          </div>
          <p className="text-muted text-sm">{text}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={20} className="text-gold animate-spin" />
        <p className="text-muted text-sm">{text}</p>
      </div>
    </div>
  )
}

export default Loader
