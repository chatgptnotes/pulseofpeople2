/**
 * ChatGPT-inspired Design System
 * Modern, clean, and minimalistic design tokens
 */

export const chatgptTheme = {
  // Typography - Clean, readable fonts
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'SF Mono', 'Consolas', 'Monaco', monospace"
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px - body text minimum
      md: '1.125rem',    // 18px - body text comfortable
      lg: '1.25rem',     // 20px
      xl: '1.5rem',      // 24px
      '2xl': '1.875rem', // 30px
      '3xl': '2.25rem'   // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  // Color Palette - Neutral with subtle accents
  colors: {
    // Background colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F7F7F8',    // Very light gray
      tertiary: '#ECECF1',     // Soft gray
      hover: '#F3F3F4',
      active: '#E8E8ED'
    },

    // Text colors
    text: {
      primary: '#0D0D0D',      // Near black
      secondary: '#565869',    // Medium gray
      tertiary: '#8E8EA0',     // Light gray
      disabled: '#ACACBE',
      inverse: '#FFFFFF'
    },

    // Border colors
    border: {
      light: '#ECECF1',
      medium: '#D9D9E3',
      dark: '#ACACBE',
      focus: '#10A37F'         // Accent green for focus
    },

    // Accent colors (used sparingly)
    accent: {
      primary: '#10A37F',      // ChatGPT green
      primaryHover: '#0E8B6F',
      secondary: '#6E6E80',
      error: '#EF4146',
      warning: '#FDB022',
      success: '#10A37F',
      info: '#1A7FDB'
    },

    // Semantic colors
    status: {
      success: '#10A37F',
      error: '#EF4146',
      warning: '#FDB022',
      info: '#1A7FDB'
    }
  },

  // Spacing - Generous, balanced padding
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    base: '1rem',     // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem'     // 96px
  },

  // Border Radius - Soft, rounded corners
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows - Subtle, layered depth
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    none: 'none'
  },

  // Transitions - Smooth, stylish animations
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Component-specific tokens
  components: {
    button: {
      paddingX: '1rem',        // 16px
      paddingY: '0.625rem',    // 10px
      borderRadius: '0.5rem',  // 8px
      fontSize: '0.875rem',    // 14px
      fontWeight: 500,
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)'
    },

    input: {
      paddingX: '0.75rem',     // 12px
      paddingY: '0.625rem',    // 10px
      borderRadius: '0.5rem',  // 8px
      fontSize: '1rem',        // 16px
      borderWidth: '1px',
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)'
    },

    card: {
      padding: '1.5rem',       // 24px
      borderRadius: '0.75rem', // 12px
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ECECF1'
    },

    navigation: {
      itemPadding: '0.75rem 1rem',     // 12px 16px
      itemMargin: '0.25rem 0',          // 4px vertical spacing
      itemBorderRadius: '0.5rem',       // 8px
      fontSize: '0.875rem',             // 14px
      iconSize: '1.25rem',              // 20px
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)'
    },

    modal: {
      borderRadius: '1rem',    // 16px
      padding: '2rem',         // 32px
      shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      backdropBlur: '8px'
    },

    tab: {
      padding: '0.75rem 1.5rem',       // 12px 24px - generous spacing
      borderRadius: '0.5rem',          // 8px
      fontSize: '0.875rem',            // 14px
      fontWeight: 500,
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      margin: '0 0.5rem'               // 8px horizontal spacing between tabs
    }
  }
};

// Helper function to get CSS variable format
export function getCSSVar(path: string): string {
  return `var(--${path.replace(/\./g, '-')})`;
}

// Export type for TypeScript autocomplete
export type ChatGPTTheme = typeof chatgptTheme;
