import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Brain, Zap, Eye, ArrowRight, Activity, Lock, GitBranch, Cpu, ShieldAlert, Atom } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

// ── Hero Illustration (inline SVG) ───────────────────────────────────────────
const HeroIllustration: React.FC = () => (
  <svg viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
    <ellipse cx="210" cy="330" rx="140" ry="18" fill="#F5A623" fillOpacity="0.08" />
    <path d="M210 30 L330 80 L330 200 C330 280 210 340 210 340 C210 340 90 280 90 200 L90 80 Z"
      fill="#112D3E" stroke="#1E3A4A" strokeWidth="2" />
    <path d="M210 50 L310 94 L310 200 C310 268 210 318 210 318"
      stroke="#F5A623" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
    <rect x="160" y="155" width="12" height="60" rx="2" fill="#F5A623" fillOpacity="0.8" />
    <rect x="180" y="155" width="12" height="60" rx="2" fill="#F5A623" fillOpacity="0.8" />
    <rect x="200" y="155" width="12" height="60" rx="2" fill="#F5A623" fillOpacity="0.8" />
    <rect x="220" y="155" width="12" height="60" rx="2" fill="#F5A623" fillOpacity="0.8" />
    <rect x="240" y="155" width="12" height="60" rx="2" fill="#F5A623" fillOpacity="0.8" />
    <polygon points="150,155 270,155 250,130 170,130" fill="#F5A623" />
    <rect x="148" y="215" width="124" height="10" rx="2" fill="#F5A623" fillOpacity="0.9" />
    <circle cx="60" cy="120" r="14" fill="#112D3E" stroke="#F5A623" strokeWidth="1.5" strokeOpacity="0.5" />
    <circle cx="360" cy="120" r="14" fill="#112D3E" stroke="#F5A623" strokeWidth="1.5" strokeOpacity="0.5" />
    <circle cx="40" cy="220" r="10" fill="#112D3E" stroke="#1E3A4A" strokeWidth="1.5" />
    <circle cx="380" cy="220" r="10" fill="#112D3E" stroke="#1E3A4A" strokeWidth="1.5" />
    <line x1="74" y1="120" x2="90" y2="140" stroke="#F5A623" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3" />
    <line x1="346" y1="120" x2="330" y2="140" stroke="#F5A623" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3" />
    <circle cx="90" cy="310" r="4" fill="#F5A623" fillOpacity="0.4" />
    <circle cx="160" cy="310" r="4" fill="#F5A623" fillOpacity="0.4" />
    <circle cx="260" cy="310" r="4" fill="#F5A623" fillOpacity="0.4" />
    <circle cx="330" cy="310" r="4" fill="#F5A623" fillOpacity="0.4" />
    <line x1="94" y1="310" x2="156" y2="310" stroke="#1E3A4A" strokeWidth="1.5" />
    <line x1="264" y1="310" x2="326" y2="310" stroke="#1E3A4A" strokeWidth="1.5" />
  </svg>
)

const LandingPage: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />

    {/* Hero */}
    <section className="px-6 py-16 md:py-24">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 mb-6">
              <Shield size={12} className="text-gold" />
              <span className="text-gold text-xs font-medium">FinSpark'26 · Bank of Maharashtra</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-text uppercase leading-none tracking-tight mb-6">
              Banking<br />Protected by<br /><span className="text-gold">Intelligence</span>
            </h1>
            <p className="text-muted text-lg leading-relaxed mb-8 max-w-lg">
              AI-powered cyber threat intelligence that correlates cybersecurity telemetry with banking transactions to proactively stop fraud.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/login?role=user" className="btn-primary text-base px-6 py-3">
                Customer Login <ArrowRight size={16} />
              </Link>
              <Link to="/login?role=admin" className="btn-secondary text-base px-6 py-3">
                <Lock size={16} /> Admin Security Center
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {['₹10L+ Prize Pool', 'Winner Showcase · Global FinTech Fest 2026', 'Grand Finale · COEP Pune'].map(s => (
                <div key={s} className="bg-surface/60 border border-border/50 rounded-lg px-3 py-2">
                  <span className="text-xs text-muted">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>

    {/* Why AI Banking */}
    <section className="py-20 px-6">
      <div className="max-w-screen-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">Why BankShield AI</p>
        <h2 className="text-3xl font-bold text-text mb-4">Traditional Security Is Reactive.<br /><span className="text-gold">We Are Predictive.</span></h2>
        <p className="text-muted max-w-2xl mb-12">Banks generate millions of telemetry signals daily. BankShield AI correlates cybersecurity events with transactional behaviour to detect threats before they become fraud.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Proactive Threat Detection', desc: 'Correlates login telemetry, device fingerprints, and transaction patterns in real-time before a fraudulent transfer completes.' },
            { icon: Brain,  title: 'Explainable AI Intelligence', desc: 'Every incident includes an AI-generated summary explaining exactly why a transaction was flagged — transparent, not a black box.' },
            { icon: Eye,    title: 'Behaviour Profiling',         desc: "Builds a baseline of each customer's normal behaviour. Any deviation — new device, new city, odd hour — instantly correlates." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface border border-border rounded-xl p-6">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                <Icon size={20} className="text-gold" />
              </div>
              <h3 className="font-semibold text-text mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How Threat Intelligence Works */}
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-screen-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">Intelligence Pipeline</p>
        <h2 className="text-3xl font-bold text-text mb-12">How Threat Intelligence Works</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {[
            { n: '01', label: 'Login',              sub: 'IP, device, browser captured' },
            { n: '02', label: 'Transaction',        sub: 'Amount, location, merchant' },
            { n: '03', label: 'BrainCore Analysis', sub: 'Behaviour deviation scored' },
            { n: '04', label: 'Correlation',        sub: 'Signals cross-referenced' },
            { n: '05', label: 'Incident Created',   sub: 'AI summary generated' },
            { n: '06', label: 'Protected',          sub: 'Threats blocked instantly' },
          ].map((step, i, arr) => (
            <React.Fragment key={step.n}>
              <div className="flex flex-col items-center text-center min-w-[110px]">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm mb-3 ${i === arr.length - 1 ? 'bg-gold border-gold text-background' : 'bg-surface-2 border-border text-gold'}`}>
                  {step.n}
                </div>
                <p className="font-semibold text-text text-sm">{step.label}</p>
                <p className="text-muted text-xs mt-1 max-w-[90px]">{step.sub}</p>
              </div>
              {i < arr.length - 1 && <div className="hidden md:block flex-1 h-px bg-border mx-1 mt-[-28px]" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>

    {/* AI Features */}
    <section className="py-20 px-6">
      <div className="max-w-screen-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">AI Capabilities</p>
        <h2 className="text-3xl font-bold text-text mb-12">What Makes BankShield AI Different</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Activity,    title: 'Behaviour Profiling',   desc: 'Builds baseline per user: usual locations, devices, merchants, hours, and transaction amounts.' },
            { icon: GitBranch,   title: 'Correlation Engine',    desc: 'Cross-references login history, device changes, IP geolocation, and transaction context simultaneously.' },
            { icon: Cpu,         title: 'Fraud AI Model',        desc: 'ML model returns fraud probability and confidence score for every single transaction.' },
            { icon: Atom,        title: 'Quantum Risk Module',   desc: 'Prototype quantum indicators detecting HNDL (Harvest Now Decrypt Later) attack patterns.' },
            { icon: Brain,       title: 'AI Investigator',       desc: 'Gemini-powered natural language summaries explaining every incident for SOC analysts.' },
            { icon: ShieldAlert, title: 'Real-time Monitoring',  desc: 'SOC dashboard with live transaction feed, incident queue, and 30-second auto-refresh.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface border border-border rounded-xl p-5 hover:border-gold/30 transition-colors">
              <Icon size={20} className="text-gold mb-3" />
              <h3 className="font-semibold text-text mb-1.5">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Quick Services */}
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-screen-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">Quick Access</p>
        <h2 className="text-3xl font-bold text-text mb-10">Banking Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Check Balance', emoji: '💰' }, { label: 'Fund Transfer', emoji: '↗️' },
            { label: 'Transactions',  emoji: '📋' }, { label: 'Statement',     emoji: '📄' },
            { label: 'Apply for Loan',emoji: '🏦' }, { label: 'Credit Cards',  emoji: '💳' },
            { label: 'Manage Account',emoji: '⚙️' }, { label: 'Support',       emoji: '🎧' },
          ].map(({ label, emoji }) => (
            <Link key={label} to="/login?role=user"
              className="bg-surface-2 border border-border rounded-xl p-5 flex flex-col items-center gap-3 hover:border-gold/30 hover:bg-surface-3 transition-all group">
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium text-muted group-hover:text-text transition-colors text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
)

export default LandingPage
