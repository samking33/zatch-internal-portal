import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: 'var(--sidebar-bg)',
        page: 'var(--page-bg)',
        card: 'var(--card-bg)',
        border: 'var(--card-border)',
        muted: 'var(--text-muted)',
        secondary: 'var(--text-secondary)',
        primary: 'var(--text-primary)',
        brand: 'var(--blue)',
        success: 'var(--green)',
        warning: 'var(--amber)',
        danger: 'var(--red)',
        purple: 'var(--purple)',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
      },
      borderRadius: {
        card: '14px',
      },
      fontSize: {
        base: ['14px', '20px'],
      },
    },
  },
  plugins: [],
};

export default config;
