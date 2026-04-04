/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: 'rgba(255,255,255,0.05)',
        'surface-strong': 'rgba(255,255,255,0.08)',
        accent: '#ffffff',
        critical: '#ff3b30',
        high: '#ff9500',
        medium: '#ffcc00',
      }
    }
  },
  plugins: []
};
