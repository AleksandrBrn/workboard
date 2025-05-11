//import type { Config } from 'tailwindcss';
/**@type { import('tailwindcss').Config }*/

const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-animate'), // ты используешь tailwindcss-animate
  ],
};
export default config;
