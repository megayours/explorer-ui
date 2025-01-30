export const colors = {
  // Primary colors
  primary: {
    DEFAULT: '#1A365D', // Navy blue from the logo and headings
    light: '#2C4F8C',
    dark: '#0F2442',
  },
  
  // Accent colors
  accent: {
    coral: '#F87171', // Coral color from the "Get Started" button
    blue: '#3B82F6',
  },
  
  // Background colors
  background: {
    DEFAULT: '#FFFFFF', // Pure white background
    light: '#F8FAFC', // Very light gray for subtle backgrounds
    card: '#FFFFFF',
    hover: '#F1F5F9',
  },
  
  // Border colors
  border: {
    DEFAULT: '#E2E8F0', // Light gray for borders
    hover: '#CBD5E1',
  },
  
  // Text colors
  text: {
    primary: '#1E293B', // Dark navy for primary text
    secondary: '#64748B', // Medium gray for secondary text
    muted: '#94A3B8', // Lighter gray for less important text
  },

  // Status colors
  status: {
    success: {
      text: '#059669',
      bg: '#ECFDF5',
    },
    error: {
      text: '#DC2626',
      bg: '#FEF2F2',
    },
  }
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
} as const;

export const gradients = {
  subtle: 'linear-gradient(to bottom, rgb(255, 255, 255), rgb(249, 250, 251))',
} as const; 