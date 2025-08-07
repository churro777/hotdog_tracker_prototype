// localStorage Keys
export const STORAGE_KEYS = {
  DARK_MODE: 'hotdog-contest-dark-mode',
  POSTS: 'hotdog-contest-posts',
  CONTEST_USERS: 'hotdog-contest-contest-users',
  USERS: 'hotdog-contest-users'
} as const

// User and Contest Identifiers
export const CONTEST_IDS = {
  DEFAULT: 'hotdog-contest'
} as const

export const USER_IDS = {
  CURRENT_USER: '1',
  JOEY_CHESTNUT: '2',
  TAKERU_KOBAYASHI: '3',
  MATT_STONIE: '4',
  FRIEND: '5',
  SARAH_JOHNSON: '6',
  MIKE_CHEN: '7',
  EMMA_WILSON: '8'
} as const

// Post and Tab Types
export const POST_TYPES = {
  ENTRY: 'entry',
  JOIN: 'join',
  INVITE: 'invite'
} as const

export const TAB_TYPES = {
  LEADERBOARD: 'leaderboard',
  FEED: 'feed',
  LOG: 'log',
  JOURNAL: 'journal'
} as const

// UI Text and Messages
export const UI_TEXT = {
  APP_TITLE: '🌭 Hot Dog Contest',
  DEBUG_PREFIX: 'DEBUG - ',
  
  TABS: {
    LEADERBOARD: '🏆 Leaderboard',
    FEED: '📰 Feed',
    LOG: '📝 Log',
    JOURNAL: '📔 Journal',
    SETTINGS: '⚙️'
  },
  
  MESSAGES: {
    SETTINGS_SAVED: 'Settings saved! (This is just a prototype)',
    EXPORT_COMING_SOON: 'Export feature coming soon!',
    DATA_CLEARED: 'All data has been cleared and reset to defaults!',
    CONFIRM_CLEAR_DATA: 'Are you sure you want to clear all data? This cannot be undone.'
  },
  
  EMPTY_STATES: {
    NO_CONTESTANTS: 'No contestants yet! Start logging to get on the leaderboard.',
    NO_POSTS: 'No posts yet! Head to the "Log" tab to start sharing your progress.',
    NO_ENTRIES: 'No entries logged yet! Head over to the Log tab to start tracking your progress.'
  }
} as const

// Form Configuration
export const FORM_CONFIG = {
  PLACEHOLDERS: {
    DESCRIPTION: 'How was it? Any comments?',
    NAME: 'Enter your name'
  },
  
  ALT_TEXT: {
    CONTEST_ITEM: 'Contest item',
    CONTEST_ITEM_PREVIEW: 'Contest item preview'
  },
  
  INPUT_TYPES: {
    IMAGE_ACCEPT: 'image/*'
  },
  
  LABELS: {
    UPLOAD_PICTURE: '📷 Upload Picture (Optional)',
    ITEMS_CONSUMED: 'Items Consumed',
    DESCRIPTION_OPTIONAL: 'Description (Optional)',
    DISPLAY_NAME: 'Display Name',
    ENABLE_NOTIFICATIONS: 'Enable notifications for new posts',
    DARK_MODE: 'Dark mode'
  }
} as const

// Numeric Limits and Defaults
export const LIMITS = {
  MIN_ITEM_COUNT: 1,
  MAX_ITEM_COUNT: 50,
  DEFAULT_ITEM_COUNT: 1,
  TEXTAREA_ROWS_SMALL: 2,
  TEXTAREA_ROWS_MEDIUM: 3
} as const

export const TIMEOUTS = {
  FOCUS_DELAY: 0
} as const

// Environment Configuration
export const CONFIG = {
  DEV_HOSTNAMES: ['localhost', '127.0.0.1'],
  BASE_PATH: '/hotdog_tracker_prototype/'
} as const

// CSS Class Names
export const CSS_CLASSES = {
  // Common Layout
  TAB_PANEL: 'tab-panel',
  EMPTY_STATE: 'empty-state',
  
  // Post Components
  POST_HEADER: 'post-header',
  POST_CONTENT: 'post-content',
  POST_ITEM: 'post-item',
  POST_USER: 'post-user',
  POST_TIMESTAMP: 'post-timestamp',
  POST_TIMESTAMP_ACTIONS: 'post-timestamp-actions',
  POST_DESCRIPTION: 'post-description',
  POST_COUNT: 'post-count',
  POST_IMAGE: 'post-image',
  
  // Edit Controls
  EDIT_FORM: 'edit-form',
  EDIT_CONTROLS: 'edit-controls',
  EDIT_INPUTS: 'edit-inputs',
  EDIT_COUNT: 'edit-count',
  EDIT_DESCRIPTION: 'edit-description',
  EDIT_COUNT_INPUT: 'edit-count-input',
  EDIT_DESCRIPTION_INPUT: 'edit-description-input',
  
  // Buttons
  EDIT_POST_BTN: 'edit-post-btn',
  SAVE_EDIT_BTN: 'save-edit-btn',
  CANCEL_EDIT_BTN: 'cancel-edit-btn',
  
  // Modal
  MODAL: {
    BACKDROP: 'modal-backdrop',
    CONTENT: 'modal-content',
    HEADER: 'modal-header',
    CLOSE_BTN: 'modal-close-btn',
    FOOTER: 'modal-footer'
  },
  
  // Form Elements
  FORM: {
    SECTION: 'form-section',
    INPUT: 'settings-input',
    BUTTON_PRIMARY: 'btn-primary',
    BUTTON_SECONDARY: 'btn-secondary'
  }
} as const

// Default Mock Data
export const DEFAULT_DATA = {
  USERS: [
    { id: 'cu-1', contestId: CONTEST_IDS.DEFAULT, userId: USER_IDS.JOEY_CHESTNUT, userName: 'Joey Chestnut', totalCount: 23 },
    { id: 'cu-2', contestId: CONTEST_IDS.DEFAULT, userId: USER_IDS.TAKERU_KOBAYASHI, userName: 'Takeru Kobayashi', totalCount: 18 },
    { id: 'cu-3', contestId: CONTEST_IDS.DEFAULT, userId: USER_IDS.MATT_STONIE, userName: 'Matt Stonie', totalCount: 15 },
    { id: 'cu-4', contestId: CONTEST_IDS.DEFAULT, userId: USER_IDS.CURRENT_USER, userName: 'You', totalCount: 3 },
    { id: 'cu-5', contestId: CONTEST_IDS.DEFAULT, userId: USER_IDS.FRIEND, userName: 'Your Friend', totalCount: 7 }
  ],
  
  POST: {
    DESCRIPTION: 'Just crushed 5 more! 🌭',
    COUNT: 5
  }
} as const

// Statistics Labels
export const STATS_LABELS = {
  TOTAL_ITEMS: 'Total Items',
  POSTS: 'Posts', 
  AVG_PER_POST: 'Avg per Post',
  BEST_SINGLE_POST: 'Best Single Post'
} as const

// Button and Action Text
export const BUTTON_TEXT = {
  LOG_ENTRY: '📝 Log Entry',
  SAVE_SETTINGS: '💾 Save Settings',
  EXPORT_DATA: '📥 Export Data',
  CLEAR_ALL_DATA: '🗑️ Clear All Data',
  REMOVE: 'Remove',
  CLOSE: 'Close'
} as const

// Emoji and Icons
export const ICONS = {
  HOT_DOG: '🌭',
  TROPHY: '🏆',
  NEWSPAPER: '📰', 
  PENCIL: '📝',
  NOTEBOOK: '📔',
  SETTINGS: '⚙️',
  CAMERA: '📷',
  PARTY: '🎉',
  MAIL: '📧',
  SAVE: '💾',
  INBOX: '📥',
  TRASH: '🗑️',
  EDIT: '✏️',
  CANCEL: '❌',
  CLOSE: '✕'
} as const