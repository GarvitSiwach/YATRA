import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0E0E0E',
        gold: '#C9A24D',
        pearl: '#F8F7F3'
      },
      boxShadow: {
        card: '0 14px 40px -24px rgba(0, 0, 0, 0.28)',
        glow: '0 10px 30px -14px rgba(201, 162, 77, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;
