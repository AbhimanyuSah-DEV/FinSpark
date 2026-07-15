import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Trophy, Star } from 'lucide-react'

// ── Shield + Bank SVG Illustration ──────────────────────────────────────────
const ShieldBankIllustration: React.FC = () => (
  <svg
    viewBox="0 0 420 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-md"
    aria-label="BankShield AI illustration"
  >
    {/* Outer glow rings */}
    <circle cx="210" cy="195" r="165" stroke="#F5A623" strokeOpacity="0.06" strokeWidth="1" />
    <circle cx="210" cy="195" r="140" stroke="#F5A623" strokeOpacity="0.10" strokeWidth="1" />
    <circle cx="210" cy="195" r="115" stroke="#0B8A7A" strokeOpacity="0.15" strokeWidth="1" />

    {/* Shield body */}
    <path
      d="M210 42 L320 88 L320 198 C320 268 210 330 210 330 C210 330 100 268 100 198 L100 88 Z"
      fill="#112D3E"
      stroke="#F5A623"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Shield inner fill */}
    <path
      d="M210 62 L305 102 L305 198 C305 256 210 308 210 308 C210 308 115 256 115 198 L115 102 Z"
      fill="#1A3A4E"
    />

    {/* Bank building columns base */}
    <rect x="175" y="215" width="70" height="40" rx="3" fill="#0B8A7A" fillOpacity="0.6" />
    {/* Bank steps */}
    <rect x="168" y="252" width="84" height="8" rx="2" fill="#F5A623" fillOpacity="0.8" />
    <rect x="162" y="258" width="96" height="7" rx="2" fill="#F5A623" fillOpacity="0.5" />

    {/* Bank columns */}
    {[180, 193, 206, 219, 232].map((x, i) => (
      <rect key={i} x={x} y="168" width="7" height="48" rx="2" fill="#94A3B8" fillOpacity="0.7" />
    ))}

    {/* Bank roof / pediment */}
    <polygon points="160,168 260,168 210,132" fill="#F5A623" fillOpacity="0.9" />
    <rect x="162" y="165" width="96" height="6" rx="2" fill="#F5A623" />

    {/* Bank door */}
    <rect x="203" y="225" width="14" height="30" rx="3" fill="#0B8A7A" />

    {/* Data flow lines — left side */}
    <line x1="60" y1="120" x2="100" y2="160" stroke="#0B8A7A" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.7" />
    <line x1="30" y1="195" x2="100" y2="195" stroke="#F5A623" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.5" />
    <line x1="60" y1="270" x2="100" y2="230" stroke="#0B8A7A" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.7" />

    {/* Data flow lines — right side */}
    <line x1="360" y1="120" x2="320" y2="160" stroke="#0B8A7A" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.7" />
    <line x1="390" y1="195" x2="320" y2="195" stroke="#F5A623" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.5" />
    <line x1="360" y1="270" x2="320" y2="230" stroke="#0B8A7A" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.7" />

    {/* Floating node dots — left */}
    <circle cx="55" cy="120" r="5" fill="#F5A623" fillOpacity="0.8" />
    <circle cx="25" cy="195" r="5" fill="#0B8A7A" fillOpacity="0.9" />
    <circle cx="55" cy="270" r="5" fill="#F5A623" fillOpacity="0.8" />

    {/* Floating node dots — right */}
    <circle cx="365" cy="120" r="5" fill="#0B8A7A" fillOpacity="0.9" />
    <circle cx="395" cy="195" r="5" fill="#F5A623" fillOpacity="0.8" />
    <circle cx="365" cy="270" r="5" fill="#0B8A7A" fillOpacity="0.9" />

    {/* Checkmark at shield top */}
    <circle cx="210" cy="80" r="14" fill="#F5A623" fillOpacity="0.15" stroke="#F5A623" strokeWidth="1.5" />
    <polyline points="203,80 208,86 218,74" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Small binary / data blips */}
    <text x="36" y="148" fontSize="9" fill="#94A3B8" fillOpacity="0.5" fontFamily="monospace">01</text>
    <text x="370" y="148" fontSize="9" fill="#94A3B8" fillOpacity="0.5" fontFamily="monospace">10</text>
    <text x="36" y="255" fontSize="9" fill="#94A3B8" fillOpacity="0.5" fontFamily="monospace">11</text>
    <text x="370" y="255" fontSize="9" fill="#94A3B8" fillOpacity="0.5" fontFamily="monospace">00</text>
  </svg>
)

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="flex flex-col items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-5 flex-1 min-w-[130px]">
    <div className="text-gold">{icon}</div>
    <span className="text-xl font-bold text-white">{value}</span>
    <span className="text-xs text-muted text-center leading-tight">{label}</span>
  </div>
)

// ── Hero ──────────────────────────────────────────────────────────────────────
const Hero: React.FC = () => (
  <section className="bg-background relative overflow-hidden">
    {/* Background gradient blobs */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-screen-2xl mx-auto px-6 pt-20 pb-10">
      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 w-fit">
            <ShieldCheck size={14} className="text-gold" />
            <span className="text-gold text-xs font-semibold tracking-wide uppercase">
              AI-Powered Cyber Threat Intelligence
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-none tracking-tight">
            Banking
            <br />
            <span className="text-gold">Protected</span>
            <br />
            By Intelligence
          </h1>

          {/* Subtitle */}
          <p className="text-muted text-lg leading-relaxed max-w-xl">
            AI-powered cyber threat intelligence that correlates cybersecurity
            telemetry with banking transactions to proactively stop fraud.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/login?role=user"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-background font-bold text-sm px-7 py-3 rounded-xl transition-colors duration-200 shadow-glow"
            >
              Customer Login
            </Link>
            <Link
              to="/login?role=admin"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-border-light hover:border-gold/50 hover:bg-white/5 text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors duration-200"
            >
              Admin Security Center
            </Link>
          </div>
        </div>

        {/* Right column — SVG illustration */}
        <div className="flex items-center justify-center lg:justify-end">
          <ShieldBankIllustration />
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-14">
        <StatCard
          icon={<Trophy size={22} />}
          value="&#x20B9;10L+"
          label="Prize Pool"
        />
        <StatCard
          icon={<Star size={22} />}
          value="Winner"
          label="Showcase"
        />
        <StatCard
          icon={<ShieldCheck size={22} />}
          value="Grand"
          label="Finale"
        />
      </div>
    </div>
  </section>
)

export default Hero
