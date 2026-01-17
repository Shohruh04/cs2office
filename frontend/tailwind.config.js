/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CS2 Official Colors
        cs2: {
          orange: '#de9b35',
          'orange-light': '#f5a623',
          'orange-dark': '#c4841f',
          gray: '#d4d4d4',
          'gray-light': '#e8e8e8',
          'gray-dark': '#a8a8a8',
          dark: '#2d2d2d',
          darker: '#1a1a1a',
          black: '#0d0d0d',
        },
        // Legacy CS Theme Colors
        cs: {
          dark: '#1a1a1a',
          darker: '#0d0d0d',
          card: '#252525',
          border: '#3d3d3d',
          hover: '#333333',
        },
        // Team Colors
        ct: {
          DEFAULT: '#5d9cec',
          light: '#7cb3f0',
          dark: '#4a7bc4',
        },
        t: {
          DEFAULT: '#de9b35',
          light: '#f5a623',
          dark: '#c4841f',
        },
        // Accent Colors
        accent: {
          gold: '#f5a623',
          orange: '#de9b35',
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
          '0%': { boxShadow: '0 0 5px rgba(222, 155, 53, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(222, 155, 53, 0.8)' },
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
        'cs-glow': '0 0 20px rgba(222, 155, 53, 0.3)',
        'ct-glow': '0 0 20px rgba(93, 156, 236, 0.3)',
        't-glow': '0 0 20px rgba(222, 155, 53, 0.3)',
      },
    },
  },
  plugins: [],
}
