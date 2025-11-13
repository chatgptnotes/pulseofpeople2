/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ChatGPT-inspired typography
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'Monaco', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px - body text minimum
        'md': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px - body text comfortable
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],
        'xl': ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }]
      },

      // Neutral color palette with subtle accents
      colors: {
        // ChatGPT-inspired semantic colors
        chatgpt: {
          // Background colors
          bg: {
            primary: '#FFFFFF',
            secondary: '#F7F7F8',
            tertiary: '#ECECF1',
            hover: '#F3F3F4',
            active: '#E8E8ED',
          },
          // Text colors
          text: {
            primary: '#0D0D0D',
            secondary: '#565869',
            tertiary: '#8E8EA0',
            disabled: '#ACACBE',
          },
          // Border colors
          border: {
            light: '#ECECF1',
            medium: '#D9D9E3',
            dark: '#ACACBE',
            focus: '#10A37F',
          },
        },

        // Accent colors (ChatGPT green)
        accent: {
          DEFAULT: '#10A37F',
          hover: '#0E8B6F',
          light: '#D1F4E8',
          dark: '#0D8B6F'
        },

        // Keep existing primary/secondary for compatibility
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#10A37F',
          600: '#0E8B6F',
          700: '#0D8B6F',
          900: '#0A6B56',
        },
        secondary: {
          50: '#F7F7F8',
          100: '#ECECF1',
          500: '#565869',
          600: '#3F3F4D',
          700: '#2B2B36',
          900: '#0D0D0D',
        }
      },

      // Generous spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem'
      },

      // Soft rounded corners
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px'
      },

      // Subtle shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'none': 'none'
      },

      // Smooth transitions
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '500': '500ms'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
  },
  plugins: [],
}