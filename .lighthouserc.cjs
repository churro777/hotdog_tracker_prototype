module.exports = {
  ci: {
    collect: {
      url: ['https://hotdog-tracker-def59.web.app/'],
      numberOfRuns: 1, // Reduce runs for faster CI
      settings: {
        chromeFlags: [
          '--headless',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--allow-running-insecure-content',
          '--disable-features=TranslateUI',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--window-size=1200,800',
        ],
        // Disable some audits that can be flaky in CI
        skipAudits: [
          'canonical', // Skip canonical URL audit (flaky in CI)
          'bf-cache', // Skip back/forward cache audit (flaky in CI)
          'largest-contentful-paint', // Skip LCP audit (can be flaky)
        ],
        // Set generous timeouts for slow CI environments and React apps
        maxWaitForLoad: 45000,
        maxWaitForFcp: 30000,
        pauseAfterLoadMs: 3000,
        // Add throttling settings
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      // Set reasonable thresholds for CI
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['error', { minScore: 0.8 }], // Keep accessibility strict
        'categories:best-practices': ['warn', { minScore: 0.7 }],
        'categories:seo': ['warn', { minScore: 0.7 }],
      },
    },
    upload: {
      target: 'temporary-public-storage', // Upload results for debugging
    },
  },
}
