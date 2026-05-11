import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#1B3A6B', 2: '#142D56', 3: '#0E2040', 4: '#0A1628', light: '#2A4F8A' },
        gold:  { DEFAULT: '#C8971A', 2: '#D4A520', 3: '#E8B830', 4: '#F5D060', dark: '#9E7410' },
        off:   '#F4F6FA',
        g1:    '#E8ECF2',
        g2:    '#B8C4D4',
        g3:    '#7A8BA0',
        g4:    '#4A5A70',
        kgreen: '#1A7A48',
        kred:   '#C0321E',
        kblue:  '#1B5FA8',
        korange:'#C85A00',
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono:  ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
