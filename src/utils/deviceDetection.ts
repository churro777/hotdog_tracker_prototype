/**
 * Device detection utilities
 */

/**
 * Detects if the current device is mobile based on user agent and screen size
 * @returns true if the device is likely mobile
 */
export const isMobileDevice = (): boolean => {
  // Check user agent for mobile indicators
  const userAgent =
    navigator.userAgent ??
    navigator.vendor ??
    (window as unknown as { opera?: string }).opera ??
    ''
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase())

  // Check for touch support
  const hasTouchSupport =
    'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Check screen size (mobile breakpoint from CSS)
  const isSmallScreen = window.innerWidth <= 768

  // Return true if any mobile indicators are present
  return isMobileUserAgent || (hasTouchSupport && isSmallScreen)
}

/**
 * Checks if the device supports camera capture
 * @returns true if camera capture is supported
 */
export const supportsCameraCapture = (): boolean => {
  return (
    isMobileDevice() &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices
  )
}
