import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // IncomePilot core palette — mirrored from Flutter app dark theme
        ip: {
          // Backgrounds
          'bg-deep':    '#070F15',
          'bg-mid':     '#0A1820',
          'bg-surface': '#0E2030',
          'bg-raised':  '#112438',
          'bg-card':    '#0D1E2A',

          // Primary teal accent
          'primary':        '#3DD6B0',
          'primary-light':  '#5EE4C0',
          'primary-dim':    'rgba(61,214,176,0.12)',
          'primary-border': 'rgba(61,214,176,0.28)',
          'primary-glow':   'rgba(61,214,176,0.15)',

          // Secondary / amber accent for goals
          'amber': '#F5A623',

          // Text
          'text':       '#E8F5F2',
          'text-muted': '#6E9BAA',
          'text-dim':   '#3E6474',

          // Borders
          'border':       'rgba(255,255,255,0.07)',
          'border-med':   'rgba(255,255,255,0.11)',
          'border-strong':'rgba(255,255,255,0.18)',
        },
      },

      fontFamily: {
        sans: [
          'var(--font-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      backgroundImage: {
        'ip-gradient': 'linear-gradient(160deg, #070F15 0%, #0A1820 55%, #060D12 100%)',
        'ip-card-gradient': 'linear-gradient(135deg, rgba(61,214,176,0.06) 0%, rgba(14,32,48,0.0) 100%)',
        'ip-glow-radial': 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(61,214,176,0.12) 0%, transparent 70%)',
        'ip-hero-radial': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,214,176,0.18) 0%, transparent 65%)',
      },

      boxShadow: {
        'ip-card': '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)',
        'ip-glow': '0 0 40px rgba(61,214,176,0.12)',
        'ip-glow-sm': '0 0 20px rgba(61,214,176,0.10)',
        'ip-button': '0 4px 20px rgba(61,214,176,0.22)',
      },

      animation: {
        'fade-up':   'fadeUp 0.6s ease-out both',
        'fade-in':   'fadeIn 0.5s ease-out both',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':   'shimmer 2.4s linear infinite',
      },

      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },

      borderRadius: {
        'ip': '20px',
        'ip-sm': '14px',
        'ip-lg': '28px',
      },
    },
  },
  plugins: [],
}

export default config
