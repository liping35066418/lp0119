/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        industrial: {
          50: '#F0F5FA',
          100: '#D9E4F0',
          200: '#B3C9E0',
          300: '#8AAFD0',
          400: '#5E8FC0',
          500: '#3D70B0',
          600: '#2E5A8C',
          700: '#1E3A5F',
          800: '#152A44',
          900: '#0D1A2B',
          950: '#071019',
        },
        tech: {
          50: '#E6FBFF',
          100: '#B8F4FF',
          200: '#8AF0FF',
          300: '#5CE9FF',
          400: '#2EE2FF',
          500: '#00D4FF',
          600: '#00A8CC',
          700: '#007D99',
          800: '#005266',
          900: '#002633',
        },
        success: {
          400: '#34E0BE',
          500: '#00C9A7',
          600: '#00A085',
          700: '#007763',
        },
        warning: {
          400: '#FF9B6E',
          500: '#FF6B35',
          600: '#E05520',
          700: '#B23D10',
        },
        metal: {
          100: '#E2E8F0',
          200: '#CBD5E0',
          300: '#A0AEC0',
          400: '#718096',
          500: '#4A5568',
          600: '#2D3748',
          700: '#1A202C',
          800: '#0F1419',
          900: '#080B0E',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-green': '0 0 20px rgba(0, 201, 167, 0.4)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.1)',
        'metal': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)",
        'metal-gradient': 'linear-gradient(180deg, #2D3748 0%, #1A202C 100%)',
        'tech-gradient': 'linear-gradient(135deg, #00D4FF 0%, #007D99 100%)',
      },
      backgroundSize: {
        'grid-20': '20px 20px',
        'grid-40': '40px 40px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 212, 255, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
};
