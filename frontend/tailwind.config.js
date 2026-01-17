/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CS2 Dark Theme Colors
        cs: {
          dark: '#0a0a0b',
          darker: '#050506',
          card: '#12131a',
          border: '#1e2029',
          hover: '#1a1b24',
        },
        // Team Colors
        ct: {
          DEFAULT: '#5d9cec',
          light: '#7cb3f0',
          dark: '#4a7bc4',
        },
        t: {
          DEFAULT: '#e57373',
          light: '#ef9a9a',
          dark: '#c62828',
        },
        // Accent Colors
        accent: {
          gold: '#ffc107',
          orange: '#ff9800',
          green: '#4caf50',
          red: '#f44336',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 152, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 152, 0, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        countUp: {
          '0%': { transform: 'scale(1.2)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'cs': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'cs-glow': '0 0 20px rgba(255, 152, 0, 0.3)',
        'ct-glow': '0 0 20px rgba(93, 156, 236, 0.3)',
        't-glow': '0 0 20px rgba(229, 115, 115, 0.3)',
      },
    },
  },
  plugins: [],
}
