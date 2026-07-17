import React from 'react'
import { Shield, Info } from 'lucide-react'

const Footer: React.FC = () => (
  <footer className="bg-surface border-t border-border mt-auto">
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-gold" />
            <span className="font-bold text-text">BankShield <span className="text-gold">AI</span></span>
          </div>
          <p className="text-muted text-sm leading-relaxed max-w-xs">
            AI-powered cyber-financial threat intelligence platform.
            Correlating cybersecurity telemetry with transactional behaviour in real time.
          </p>
          <p className="text-subtle text-xs mt-4">FinSpark'26 · Hackathon Prototype</p>
        </div>

        {/* Links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Platform</p>
          {['Customer Dashboard', 'Security Center', 'Threat Intelligence', 'Incident Queue', 'Quantum Monitor'].map(l => (
            <a key={l} href="#" className="block text-sm text-subtle hover:text-muted transition-colors mb-1.5">{l}</a>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Security</p>
          {['Cyber Security', 'Fraud Protection', 'Security Tips', 'Report Phishing', 'Privacy Policy'].map(l => (
            <a key={l} href="#" className="block text-sm text-subtle hover:text-muted transition-colors mb-1.5">{l}</a>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-gold/5 border border-gold/15 rounded-xl px-5 py-4 flex items-start gap-3">
        <Info size={14} className="text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-gold mb-1">Educational Hackathon Prototype</p>
          <p className="text-xs text-muted leading-relaxed">
            This application was developed for the Bank of Maharashtra FinSpark Hackathon.
            It is not affiliated with, endorsed by, or operated by Bank of Maharashtra and
            does not collect or process real banking credentials.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-subtle">© 2026 BankShield AI. All rights reserved.</p>
        <p className="text-xs text-subtle">BankShield AI — "Banking Protected by Intelligence"</p>
      </div>
    </div>
  </footer>
)

export default Footer
