/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#171717', // dark gray/almost black
        secondary: '#737373',
        background: {
          light: '#ffffff',
          dark: '#171717',
        },
        card: {
          light: '#ffffff',
          dark: '#262626',
        },
        text: {
          light: '#171717',
          dark: '#f5f5f5',
        },
        accent: {
          light: '#404040', 
          dark: '#d4d4d4',
        },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
        serif: ['var(--font-libre)', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 