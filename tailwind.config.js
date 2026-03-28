/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple Blue accent — replaces old purple-indigo
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#007AFF',   // Apple Blue
          700: '#0062CC',
          800: '#004EA3',
          900: '#00397A',
        },
        // iOS/macOS neutral surface palette
        surface: {
          50:  '#F2F2F7',   // iOS grouped background (light)
          100: '#FFFFFF',
          200: '#F2F2F7',
          300: '#E5E5EA',
          400: '#D1D1D6',
          500: '#C7C7CC',
          600: '#AEAEB2',
          700: '#8E8E93',   // secondary label
          800: '#636366',
          900: '#3A3A3C',   // dark elevated surface
          950: '#2C2C2E',   // dark primary surface
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.02em',
        snug:    '-0.01em',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
        'modal':      '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
        'sidebar':    '2px 0 20px rgba(0,0,0,0.06)',
        'header':     '0 1px 0 rgba(0,0,0,0.06)',
        'dark-card':  '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)',
        'dark-modal': '0 8px 40px rgba(0,0,0,0.7)',
      },
      borderRadius: {
        'xl2': '18px',
        'xl3': '22px',
      },
      animation: {
        'fade-in':  'fadeIn 0.15s ease-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
        'slide-in': 'slideIn 0.2s cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                               to: { opacity: '1' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' },     to: { opacity: '1', transform: 'scale(1)' } },
        slideUp: { from: { transform: 'translateY(100%)' },              to: { transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
