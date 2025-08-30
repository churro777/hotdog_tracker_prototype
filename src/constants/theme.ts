// Theme Configuration for CSS Variables and Colors

export const THEME_COLORS = {
  // Primary Brand Colors
  PRIMARY_GRADIENT: {
    START: '#ff6b35',
    END: '#f7931e',
  },

  // Status Colors
  SUCCESS: '#4caf50',
  SUCCESS_BG_LIGHT: '#d4edda',
  SUCCESS_TEXT_LIGHT: '#155724',
  SUCCESS_BG_DARK: '#1d4f2a',

  ERROR: '#f56565',
  ERROR_BG_LIGHT: '#f8d7da',
  ERROR_TEXT_LIGHT: '#721c24',
  ERROR_BG_DARK: '#4a1e21',

  WARNING: '#ffd700',

  // Interactive States
  HOVER_SHADOW: 'rgba(255, 107, 53, 0.3)',
  FOCUS_SHADOW: 'rgba(255, 107, 53, 0.2)',
} as const

// Theme definitions with all color schemes
export const THEME_DEFINITIONS = {
  light: {
    name: 'Light',
    colors: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8f9fa',
      '--bg-surface': '#ffffff',
      '--text-primary': '#343a40',
      '--text-secondary': '#6c757d',
      '--border-color': '#dee2e6',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
      '--input-bg': '#ffffff',
      '--button-hover': '#e9ecef',
      '--primary-gradient': 'linear-gradient(135deg, #ff6b35, #f7931e)',
      '--banner-gradient': 'linear-gradient(135deg, #ff6b6b, #feca57)',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#2d2d2d',
      '--bg-surface': '#2d2d2d',
      '--text-primary': '#ffffff',
      '--text-secondary': '#b0b0b0',
      '--border-color': '#404040',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--input-bg': '#404040',
      '--button-hover': '#404040',
      '--primary-gradient': 'linear-gradient(135deg, #ff6b35, #f7931e)',
      '--banner-gradient': 'linear-gradient(135deg, #4a4a4a, #666)',
    },
  },
  autumn: {
    name: 'Autumn',
    colors: {
      '--bg-primary': '#f3d9b1',
      '--bg-secondary': '#c29979',
      '--bg-surface': '#f3d9b1',
      '--text-primary': '#a22522',
      '--text-secondary': '#c33149',
      '--border-color': '#c29979',
      '--shadow': 'rgba(162, 37, 34, 0.2)',
      '--shadow-hover': 'rgba(162, 37, 34, 0.3)',
      '--input-bg': '#ffffff',
      '--button-hover': '#a8c256',
      '--primary-gradient': 'linear-gradient(135deg, #c33149, #a8c256)',
      '--banner-gradient': 'linear-gradient(135deg, #c33149, #c29979)',
    },
  },
} as const

// CSS Custom Properties (CSS Variables) - Backward compatibility
export const CSS_VARIABLES = {
  LIGHT: THEME_DEFINITIONS.light.colors,
  DARK: THEME_DEFINITIONS.dark.colors,
} as const

// Component-specific Styling Constants
export const COMPONENT_STYLES = {
  // Border Radius Values
  BORDER_RADIUS: {
    SMALL: '4px',
    MEDIUM: '8px',
    LARGE: '12px',
    EXTRA_LARGE: '16px',
    PILL: '20px',
  },

  // Shadow Values
  SHADOWS: {
    SMALL: '0 2px 4px rgba(0,0,0,0.1)',
    MEDIUM: '0 2px 8px var(--shadow)',
    LARGE: '0 4px 20px rgba(255, 107, 53, 0.3)',
    HOVER: '0 8px 24px var(--shadow-hover)',
    MODAL: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  // Spacing Scale
  SPACING: {
    XS: '0.25rem', // 4px
    SM: '0.5rem', // 8px
    MD: '0.75rem', // 12px
    LG: '1rem', // 16px
    XL: '1.5rem', // 24px
    XXL: '2rem', // 32px
  },

  // Typography Scale
  FONT_SIZES: {
    XS: '0.75rem', // 12px
    SM: '0.875rem', // 14px
    BASE: '1rem', // 16px
    LG: '1.125rem', // 18px
    XL: '1.25rem', // 20px
    XXL: '1.5rem', // 24px
    XXXL: '2rem', // 32px
  },

  // Z-Index Scale
  Z_INDEX: {
    DROPDOWN: 10,
    STICKY: 20,
    FIXED: 30,
    MODAL_BACKDROP: 100,
    MODAL: 1000,
    TOOLTIP: 1001,
  },

  // Transition Durations
  TRANSITIONS: {
    FAST: '0.2s ease',
    NORMAL: '0.3s ease',
    SLOW: '0.5s ease',
  },

  // Breakpoints (for media queries)
  BREAKPOINTS: {
    SMALL_PHONE: '480px',
    MOBILE: '768px',
    TABLET: '1024px',
    DESKTOP: '1200px',
  },
} as const

// Animation Constants
export const ANIMATIONS = {
  // Keyframe Names
  KEYFRAMES: {
    FADE_IN: 'fadeIn',
    MODAL_SLIDE_IN: 'modalSlideIn',
  },

  // Transform Values
  TRANSFORMS: {
    SCALE_UP: 'scale(1.1)',
    SCALE_DOWN: 'scale(0.95)',
    MOVE_UP_SMALL: 'translateY(-2px)',
    MOVE_UP_MEDIUM: 'translateY(-4px)',
  },
} as const

// Theme types
export type ThemeName = keyof typeof THEME_DEFINITIONS
export const THEME_NAMES = Object.keys(THEME_DEFINITIONS) as ThemeName[]

// Helper function to get theme by name
export const getTheme = (themeName: ThemeName) => {
  return THEME_DEFINITIONS[themeName]
}

// Helper function to apply theme variables to document
export const applyTheme = (themeName: ThemeName | boolean) => {
  const root = document.documentElement

  // Handle backward compatibility with boolean (dark mode)
  let theme: ThemeName
  if (typeof themeName === 'boolean') {
    theme = themeName ? 'dark' : 'light'
  } else {
    theme = themeName
  }

  const themeDefinition = getTheme(theme)
  const variables = themeDefinition.colors

  // Apply theme color variables
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // Apply component style variables
  root.style.setProperty(
    '--border-radius-sm',
    COMPONENT_STYLES.BORDER_RADIUS.SMALL
  )
  root.style.setProperty(
    '--border-radius-md',
    COMPONENT_STYLES.BORDER_RADIUS.MEDIUM
  )
  root.style.setProperty(
    '--border-radius-lg',
    COMPONENT_STYLES.BORDER_RADIUS.LARGE
  )
  root.style.setProperty(
    '--border-radius-xl',
    COMPONENT_STYLES.BORDER_RADIUS.EXTRA_LARGE
  )
  root.style.setProperty(
    '--border-radius-pill',
    COMPONENT_STYLES.BORDER_RADIUS.PILL
  )

  root.style.setProperty('--spacing-xs', COMPONENT_STYLES.SPACING.XS)
  root.style.setProperty('--spacing-sm', COMPONENT_STYLES.SPACING.SM)
  root.style.setProperty('--spacing-md', COMPONENT_STYLES.SPACING.MD)
  root.style.setProperty('--spacing-lg', COMPONENT_STYLES.SPACING.LG)
  root.style.setProperty('--spacing-xl', COMPONENT_STYLES.SPACING.XL)
  root.style.setProperty('--spacing-xxl', COMPONENT_STYLES.SPACING.XXL)

  root.style.setProperty('--font-size-xs', COMPONENT_STYLES.FONT_SIZES.XS)
  root.style.setProperty('--font-size-sm', COMPONENT_STYLES.FONT_SIZES.SM)
  root.style.setProperty('--font-size-base', COMPONENT_STYLES.FONT_SIZES.BASE)
  root.style.setProperty('--font-size-lg', COMPONENT_STYLES.FONT_SIZES.LG)
  root.style.setProperty('--font-size-xl', COMPONENT_STYLES.FONT_SIZES.XL)
  root.style.setProperty('--font-size-xxl', COMPONENT_STYLES.FONT_SIZES.XXL)
  root.style.setProperty('--font-size-xxxl', COMPONENT_STYLES.FONT_SIZES.XXXL)

  root.style.setProperty('--transition-fast', COMPONENT_STYLES.TRANSITIONS.FAST)
  root.style.setProperty(
    '--transition-normal',
    COMPONENT_STYLES.TRANSITIONS.NORMAL
  )
  root.style.setProperty('--transition-slow', COMPONENT_STYLES.TRANSITIONS.SLOW)

  // Apply animation constants
  root.style.setProperty('--transform-scale-up', ANIMATIONS.TRANSFORMS.SCALE_UP)
  root.style.setProperty(
    '--transform-scale-down',
    ANIMATIONS.TRANSFORMS.SCALE_DOWN
  )
  root.style.setProperty(
    '--transform-move-up-sm',
    ANIMATIONS.TRANSFORMS.MOVE_UP_SMALL
  )
  root.style.setProperty(
    '--transform-move-up-md',
    ANIMATIONS.TRANSFORMS.MOVE_UP_MEDIUM
  )

  // Apply theme class to body for backward compatibility
  document.body.className = document.body.className.replace(/theme-\w+/g, '')
  document.body.classList.add(`theme-${theme}`)

  // Maintain dark-mode class for backward compatibility
  if (theme === 'dark') {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
}

// Helper function to get CSS variable value
export const getCSSVariable = (variableName: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
}

// Direct color access (for JavaScript styling)
export const getThemeColors = (isDarkMode: boolean) => ({
  background: {
    primary: isDarkMode
      ? CSS_VARIABLES.DARK['--bg-primary']
      : CSS_VARIABLES.LIGHT['--bg-primary'],
    secondary: isDarkMode
      ? CSS_VARIABLES.DARK['--bg-secondary']
      : CSS_VARIABLES.LIGHT['--bg-secondary'],
    surface: isDarkMode
      ? CSS_VARIABLES.DARK['--bg-surface']
      : CSS_VARIABLES.LIGHT['--bg-surface'],
  },
  text: {
    primary: isDarkMode
      ? CSS_VARIABLES.DARK['--text-primary']
      : CSS_VARIABLES.LIGHT['--text-primary'],
    secondary: isDarkMode
      ? CSS_VARIABLES.DARK['--text-secondary']
      : CSS_VARIABLES.LIGHT['--text-secondary'],
  },
  border: isDarkMode
    ? CSS_VARIABLES.DARK['--border-color']
    : CSS_VARIABLES.LIGHT['--border-color'],
  shadow: isDarkMode
    ? CSS_VARIABLES.DARK['--shadow']
    : CSS_VARIABLES.LIGHT['--shadow'],
  shadowHover: isDarkMode
    ? CSS_VARIABLES.DARK['--shadow-hover']
    : CSS_VARIABLES.LIGHT['--shadow-hover'],
  input: isDarkMode
    ? CSS_VARIABLES.DARK['--input-bg']
    : CSS_VARIABLES.LIGHT['--input-bg'],
  buttonHover: isDarkMode
    ? CSS_VARIABLES.DARK['--button-hover']
    : CSS_VARIABLES.LIGHT['--button-hover'],

  // Brand colors (same for both themes)
  primary: THEME_COLORS.PRIMARY_GRADIENT.START,
  primaryEnd: THEME_COLORS.PRIMARY_GRADIENT.END,
  warning: THEME_COLORS.WARNING,
  success: THEME_COLORS.SUCCESS,
  error: THEME_COLORS.ERROR,
})

// Utility type for theme-aware components (backward compatibility)
export type ThemeMode = 'light' | 'dark'

// New theme system types
export type Theme = (typeof THEME_DEFINITIONS)[ThemeName]
