import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#050310',
          900: '#0f0a1e',
          800: '#1a1035',
          700: '#251548',
          600: '#321d5c',
        },
        nebula: {
          pink:   '#e879f9',
          purple: '#a855f7',
          violet: '#7c3aed',
          blue:   '#3b82f6',
          cyan:   '#06b6d4',
        },
        star: {
          white: '#f8fafc',
          warm:  '#fde68a',
          cool:  '#bfdbfe',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'cosmic': 'radial-gradient(ellipse at 50% 0%, #251548 0%, #0f0a1e 60%, #050310 100%)',
        'nebula-gradient': 'linear-gradient(135deg, #7c3aed22, #e879f922, #3b82f622)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168,85,247,0.3)',
        'glow-pink':   '0 0 20px rgba(232,121,249,0.3)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.3)',
        'card':        '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'twinkle':     'twinkle 3s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
      },
      keyframes: {
        twinkle: {
          '0%,100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%':     { opacity: '1',   transform: 'scale(1.2)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 10px rgba(168,85,247,0.2)' },
          '50%':     { boxShadow: '0 0 30px rgba(168,85,247,0.6)' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
