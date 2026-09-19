/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B132B',
          850: '#111C3D',
          800: '#1C2541',
          700: '#26345A',
          600: '#3A4B75',
        },
        risk: {
          low: '#10B981',      // Emerald green
          'low-bg': '#064E3B',
          medium: '#F59E0B',   // Amber yellow
          'medium-bg': '#78350F',
          high: '#EF4444',     // Crimson red
          'high-bg': '#7F1D1D',
        },
        accent: {
          cyan: '#00F0FF',
          blue: '#3B82F6',
          sky: '#38BDF8',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-once': 'ping 0.8s cubic-bezier(0, 0, 0.2, 1) 1',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.2))' },
        }
      }
    },
  },
  plugins: [],
}
