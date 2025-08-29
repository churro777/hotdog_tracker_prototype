import { useState, useEffect } from 'react'

import { COMPONENT_STYLES } from '@constants/theme'

type LayoutType = 'Mobile' | 'Tablet' | 'Desktop'

const useResponsiveLayout = (): LayoutType => {
  const [layout, setLayout] = useState<LayoutType>('Desktop')

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth

      if (width < parseInt(COMPONENT_STYLES.BREAKPOINTS.MOBILE)) {
        setLayout('Mobile')
      } else if (width < parseInt(COMPONENT_STYLES.BREAKPOINTS.TABLET)) {
        setLayout('Tablet')
      } else {
        setLayout('Desktop')
      }
    }

    updateLayout()

    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  return layout
}

export default useResponsiveLayout
