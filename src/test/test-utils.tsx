import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'

/**
 * Custom render function that includes common providers
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add providers here when needed (like theme, router, etc.)
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }