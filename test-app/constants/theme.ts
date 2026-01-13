// [UX_SALLY] Institutional Brutalist Theme - CE LIT
export const THEME = {
  colors: {
    background: '#0E1117',
    surface: '#151A24',
    bone: '#E5E5E5',
    primary: '#1754CF', // Diagnostic Blue
    success: '#0DF20D', // Terminal Green
    error: '#EC1313',   // Alert Red
    graphite: '#2A2A2A',
    textMuted: 'rgba(229, 229, 229, 0.4)',
  },
  typography: {
    display: {
      fontFamily: 'System', // Matches 'Public Sans' feel
      fontWeight: '700',
    },
    mono: {
      fontFamily: 'Courier', // For that terminal/scanline feel
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 64,
  }
};

export const COMMON_STYLES = {
  grain: {
    opacity: 0.04,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(229, 229, 229, 0.4)',
    shadowColor: 'rgba(229, 229, 229, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  }
};
