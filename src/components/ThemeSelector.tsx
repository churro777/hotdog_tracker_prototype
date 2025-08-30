import './ThemeSelector.css'
import { getTheme, type ThemeName } from '@constants/theme'
import useTheme from '@hooks/useTheme'

/**
 * Theme selector component that allows users to switch between available themes
 */
function ThemeSelector() {
  const { themeName, availableThemes, setThemeName } = useTheme()

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setThemeName(e.target.value as ThemeName)
  }

  return (
    <div className="theme-selector">
      <label className="theme-selector-label">Theme:</label>
      <select
        className="theme-selector-dropdown"
        value={themeName}
        onChange={handleThemeChange}
      >
        {availableThemes.map(theme => (
          <option key={theme} value={theme}>
            {getTheme(theme).name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ThemeSelector
