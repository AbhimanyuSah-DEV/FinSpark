/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background:    '#0B2535',
        surface:       '#112D3E',
        'surface-2':   '#1A3A4E',
        'surface-3':   '#22475E',
        gold:          '#F5A623',
        'gold-dark':   '#D4891A',
        'gold-light':  '#FBBF5A',
        teal:          '#0B8A7A',
        text:          '#FFFFFF',
        muted:         '#94A3B8',
        subtle:        '#64748B',
        border:        '#1E3A4A',
        'border-light':'#2A4A5E',
        success:       '#16A34A',
        warning:       '#F59E0B',
        danger:        '#DC2626',
        orange:        '#EA580C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm:  '8px',
        lg:  '16px',
        xl:  '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(245,166,35,0.15)',
        'glow-red': '0 0 20px rgba(220,38,38,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
