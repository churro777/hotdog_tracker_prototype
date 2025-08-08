# COMPONENT_STYLES Usage Guide

This guide shows how to use the centralized component styling constants throughout the application.

## 1. In CSS Files (Recommended)

Use CSS custom properties that are automatically applied by the theme system:

```css
/* Before (hardcoded values) */
.my-component {
  border-radius: 12px;
  padding: 1.5rem;
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

/* After (using CSS variables) */
.my-component {
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  font-size: var(--font-size-xl);
  transition: all var(--transition-fast);
}
```

### Available CSS Variables

**Border Radius:**

- `var(--border-radius-sm)` → 4px
- `var(--border-radius-md)` → 8px  
- `var(--border-radius-lg)` → 12px
- `var(--border-radius-xl)` → 16px
- `var(--border-radius-pill)` → 20px

**Spacing:**

- `var(--spacing-xs)` → 0.25rem (4px)
- `var(--spacing-sm)` → 0.5rem (8px)
- `var(--spacing-md)` → 0.75rem (12px)
- `var(--spacing-lg)` → 1rem (16px)
- `var(--spacing-xl)` → 1.5rem (24px)
- `var(--spacing-xxl)` → 2rem (32px)

**Font Sizes:**

- `var(--font-size-xs)` → 0.75rem (12px)
- `var(--font-size-sm)` → 0.875rem (14px)
- `var(--font-size-base)` → 1rem (16px)
- `var(--font-size-lg)` → 1.125rem (18px)
- `var(--font-size-xl)` → 1.25rem (20px)
- `var(--font-size-xxl)` → 1.5rem (24px)
- `var(--font-size-xxxl)` → 2rem (32px)

**Transitions:**

- `var(--transition-fast)` → 0.2s ease
- `var(--transition-normal)` → 0.3s ease
- `var(--transition-slow)` → 0.5s ease

## 2. In JavaScript/TSX (For Dynamic Styling)

Import and use COMPONENT_STYLES directly:

```tsx
import { COMPONENT_STYLES } from '../constants/theme'

// Direct usage
const dynamicStyle = {
  borderRadius: COMPONENT_STYLES.BORDER_RADIUS.LARGE,
  padding: COMPONENT_STYLES.SPACING.XL,
  fontSize: COMPONENT_STYLES.FONT_SIZES.XL,
  transition: COMPONENT_STYLES.TRANSITIONS.FAST,
  boxShadow: COMPONENT_STYLES.SHADOWS.LARGE
}

// Or using the convenience hook
import useComponentStyles from '../hooks/useComponentStyles'

function MyComponent() {
  const styles = useComponentStyles()
  
  const dynamicStyle = {
    borderRadius: styles.borderRadius.large,
    padding: styles.spacing.xl,
    fontSize: styles.fontSize.xl,
    transition: styles.transitions.fast,
    boxShadow: styles.shadows.large
  }
  
  return <div style={dynamicStyle}>Content</div>
}
```

## 3. Examples of Implementation

### High-Impact Replacements (100+ occurrences)

1. **Border Radius 12px** → `var(--border-radius-lg)`
2. **Border Radius 8px** → `var(--border-radius-md)`  
3. **Transition 0.2s ease** → `var(--transition-fast)`
4. **Font Size 1.5rem** → `var(--font-size-xxl)`
5. **Padding/Margin 1rem** → `var(--spacing-lg)`

### Before & After Examples

```css
/* BEFORE - Hardcoded values */
.modal-content {
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.button {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

/* AFTER - Using CSS variables */
.modal-content {
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn var(--transition-normal) ease-out;
}

.button {
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}
```

## 4. Benefits

- ✅ **Consistency** - All components use the same spacing/sizing values
- ✅ **Maintainability** - Change values in one place, apply everywhere
- ✅ **Type Safety** - TypeScript ensures correct constant usage
- ✅ **Performance** - CSS variables are optimized by browsers
- ✅ **Theme Support** - Values automatically update with theme changes

## 5. Migration Strategy

1. **Start with high-impact values** (border-radius, common spacing)
2. **Use CSS variables in new components**
3. **Gradually replace hardcoded values in existing CSS**
4. **Use JavaScript styling for dynamic/conditional styles**

## 6. Files to Update (Priority Order)

1. `SettingsModal.css` - 15+ hardcoded values
2. `App.css` - 50+ hardcoded values  
3. `LeaderboardTab.css` - 10+ hardcoded values
4. `FeedTab.css` - 12+ hardcoded values
5. `LogTab.css` - 8+ hardcoded values
6. `JournalTab.css` - 10+ hardcoded values

This system ensures consistent, maintainable, and theme-aware styling across the entire application.
