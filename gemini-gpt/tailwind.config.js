/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (can be removed later)
        'gpt-main': '#343541',
        'gpt-sidebar': '#202123',
        'gpt-hover': '#2A2B32',
        'gpt-text': '#ECECF1',
        'gpt-secondary': '#444654',
        // Theme-aware colors using CSS variables
        'main': 'var(--bg-main)',
        'bg-main': 'var(--bg-main)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent-color': 'var(--accent-color)',
      },
      textColor: {
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
      backgroundColor: {
        'main': 'var(--bg-main)',
        'bg-sidebar': 'var(--bg-sidebar)',
      },
    },
  },
  plugins: [],
}

