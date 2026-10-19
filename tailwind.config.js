/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eafaf2',
          100: '#cdf2dd',
          200: '#9ee5bd',
          300: '#65d297',
          400: '#34bd72',
          500: '#16a34a',
          600: '#0d8a3e',
          700: '#0b6e34',
          800: '#0b572c',
          900: '#0a4724',
          950: '#032812',
        },
        navy: {
          50: '#eef3fb',
          100: '#d6e2f5',
          200: '#aec5eb',
          300: '#7ea1de',
          400: '#4f7ccb',
          500: '#2f60b3',
          600: '#234a93',
          700: '#1e3c78',
          800: '#1a3162',
          900: '#162950',
          950: '#0d1a33',
        },
        accent: {
          400: '#f6c344',
          500: '#eab308',
          600: '#ca8a04',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(13, 26, 51, 0.08)',
        card: '0 8px 28px -8px rgba(13, 26, 51, 0.18)',
        glow: '0 0 0 4px rgba(22, 163, 74, 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
    },
  },
  plugins: [],
};
