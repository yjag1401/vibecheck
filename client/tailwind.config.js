/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: 'rgba(14, 14, 20, 0.72)',
        border: 'rgba(244, 246, 255, 0.08)',
        cyan: '#00F0FF',
        critical: '#FF3B30',
        high: '#FF9500',
        medium: '#FFD60A',
        dim: '#888888',
        terminal: '#0D1117',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  },
  plugins: []
};
