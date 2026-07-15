import React from 'react'
import { Shield } from 'lucide-react'

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
            AI-powered cyber threat intelligence for Bank of Maharashtra.
            Correlating cybersecurity telemetry with transactional behaviour.
          </p>
          <p className="text-subtle text-xs mt-4">Presented by Bank of Maharashtra · FinSpark'26</p>
        </div>

        {/* Links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Services</p>
          {['Personal Banking', 'Business Banking', 'Loans', 'Cards', 'NRI Services'].map(l => (
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

      <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-subtle">© 2026 Bank of Maharashtra. All rights reserved.</p>
        <p className="text-xs text-subtle">BankShield AI — "Banking Protected by Intelligence"</p>
      </div>
    </div>
  </footer>
)

export default Footer
