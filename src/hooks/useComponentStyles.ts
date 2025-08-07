import { COMPONENT_STYLES } from '../constants/theme'

/**
 * Custom hook that provides easy access to component styling constants.
 * This allows components to use consistent styling values in JavaScript for dynamic styling.
 * All values come from the centralized COMPONENT_STYLES configuration.
 * 
 * @returns {object} Object containing organized styling constants with shortcuts for common properties
 */
function useComponentStyles() {
  return {
    // Border radius shortcuts
    borderRadius: {
      small: COMPONENT_STYLES.BORDER_RADIUS.SMALL,
      medium: COMPONENT_STYLES.BORDER_RADIUS.MEDIUM,
      large: COMPONENT_STYLES.BORDER_RADIUS.LARGE,
      xl: COMPONENT_STYLES.BORDER_RADIUS.EXTRA_LARGE,
      pill: COMPONENT_STYLES.BORDER_RADIUS.PILL
    },
    
    // Shadow shortcuts
    shadows: {
      small: COMPONENT_STYLES.SHADOWS.SMALL,
      medium: COMPONENT_STYLES.SHADOWS.MEDIUM,
      large: COMPONENT_STYLES.SHADOWS.LARGE,
      hover: COMPONENT_STYLES.SHADOWS.HOVER,
      modal: COMPONENT_STYLES.SHADOWS.MODAL
    },
    
    // Spacing shortcuts
    spacing: {
      xs: COMPONENT_STYLES.SPACING.XS,
      sm: COMPONENT_STYLES.SPACING.SM,
      md: COMPONENT_STYLES.SPACING.MD,
      lg: COMPONENT_STYLES.SPACING.LG,
      xl: COMPONENT_STYLES.SPACING.XL,
      xxl: COMPONENT_STYLES.SPACING.XXL
    },
    
    // Font size shortcuts
    fontSize: {
      xs: COMPONENT_STYLES.FONT_SIZES.XS,
      sm: COMPONENT_STYLES.FONT_SIZES.SM,
      base: COMPONENT_STYLES.FONT_SIZES.BASE,
      lg: COMPONENT_STYLES.FONT_SIZES.LG,
      xl: COMPONENT_STYLES.FONT_SIZES.XL,
      xxl: COMPONENT_STYLES.FONT_SIZES.XXL,
      xxxl: COMPONENT_STYLES.FONT_SIZES.XXXL
    },
    
    // Transition shortcuts
    transitions: {
      fast: COMPONENT_STYLES.TRANSITIONS.FAST,
      normal: COMPONENT_STYLES.TRANSITIONS.NORMAL,
      slow: COMPONENT_STYLES.TRANSITIONS.SLOW
    },
    
    // Z-index shortcuts
    zIndex: {
      dropdown: COMPONENT_STYLES.Z_INDEX.DROPDOWN,
      sticky: COMPONENT_STYLES.Z_INDEX.STICKY,
      fixed: COMPONENT_STYLES.Z_INDEX.FIXED,
      modalBackdrop: COMPONENT_STYLES.Z_INDEX.MODAL_BACKDROP,
      modal: COMPONENT_STYLES.Z_INDEX.MODAL,
      tooltip: COMPONENT_STYLES.Z_INDEX.TOOLTIP
    },
    
    // Direct access to all styles for advanced use cases
    raw: COMPONENT_STYLES
  }
}

export default useComponentStyles