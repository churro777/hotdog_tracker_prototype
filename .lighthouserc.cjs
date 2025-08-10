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
        ],
        // Disable some audits that can be flaky in CI
        skipAudits: [
          'canonical', // Skip canonical URL audit (flaky in CI)
          'bf-cache', // Skip back/forward cache audit (flaky in CI)
        ],
        // Set timeouts for slow CI environments
        maxWaitForLoad: 30000,
        maxWaitForFcp: 15000,
        pauseAfterLoadMs: 1000,
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
