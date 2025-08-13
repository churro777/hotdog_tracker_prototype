/**
 * Application constants for the Hot Dog Contest Tracker
 * Centralizes all configuration, UI text, styling, and default data
 */

import { env } from '@utils/env'

/**
 * localStorage key constants for data persistence
 */
export const STORAGE_KEYS = {
  /** Key for storing dark mode preference */
  DARK_MODE: 'hotdog-contest-dark-mode',
  /** Key for storing contest posts */
  POSTS: 'hotdog-contest-posts',
  /** Key for storing contest user data */
  CONTEST_USERS: 'hotdog-contest-contest-users',
  /** Key for storing general user data */
  USERS: 'hotdog-contest-users',
} as const

/**
 * Contest identifier constants
 */
export const CONTEST_IDS = {
  /** Default contest ID used throughout the app */
  DEFAULT: 'hotdog-contest',
} as const


/**
 * Post type constants for different kinds of contest posts
 */
export const POST_TYPES = {
  /** Regular entry post with consumption data */
  ENTRY: 'entry',
  /** Post indicating a user joined the contest */
  JOIN: 'join',
  /** Post for inviting other users to join */
  INVITE: 'invite',
} as const

/**
 * Tab type constants for the main navigation
 */
export const TAB_TYPES = {
  /** Leaderboard tab showing user rankings */
  LEADERBOARD: 'leaderboard',
  /** Feed tab showing chronological posts */
  FEED: 'feed',
  /** Log tab for creating new entries */
  LOG: 'log',
  /** Journal tab for personal post history */
  JOURNAL: 'journal',
} as const

/**
 * UI text constants for consistent messaging throughout the app
 */
export const UI_TEXT = {
  /** Main application title */
  APP_TITLE: env.APP_NAME,
  /** Prefix added to title in development mode */
  DEBUG_PREFIX: env.IS_DEBUG_ENABLED ? 'DEBUG - ' : '',

  TABS: {
    LEADERBOARD: '🏆 Leaderboard',
    FEED: '📰 Feed',
    LOG: '📝 Log',
    JOURNAL: '📔 Journal',
    SETTINGS: '⚙️',
  },

  MESSAGES: {
    SETTINGS_SAVED: 'Settings saved! (This is just a prototype)',
    EXPORT_COMING_SOON: 'Export feature coming soon!',
    DATA_CLEARED: 'All data has been cleared and reset to defaults!',
    CONFIRM_CLEAR_DATA:
      'Are you sure you want to clear all data? This cannot be undone.',
  },

  LOADING_MESSAGES: [
    'Loading championship data... 🏆',
    'And the winner is... 🥇',
    'Counting hot dogs... 🌭',
    'Preparing the leaderboard... 📊',
    'Warming up the competition... 🔥',
    'Fetching contest results... 🎯',
    'Gathering the champions... 👑',
    'Loading the hall of fame... 🏛️',
    'Preparing for battle... ⚔️',
    'Crunching the numbers... 🔢',
    'Summoning the data... ✨',
    'Building the scoreboard... 📈',
  ],

  EMPTY_STATES: {
    NO_CONTESTANTS:
      'No contestants yet! Start logging to get on the leaderboard.',
    NO_POSTS:
      'No posts yet! Head to the "Log" tab to start sharing your progress.',
    NO_ENTRIES:
      'No entries logged yet! Head over to the Log tab to start tracking your progress.',
  },
} as const

// Form Configuration
export const FORM_CONFIG = {
  PLACEHOLDERS: {
    DESCRIPTION: 'How was it? Any comments?',
    NAME: 'Enter your name',
  },

  ALT_TEXT: {
    CONTEST_ITEM: 'Contest item',
    CONTEST_ITEM_PREVIEW: 'Contest item preview',
  },

  INPUT_TYPES: {
    IMAGE_ACCEPT: 'image/*',
  },

  LABELS: {
    UPLOAD_PICTURE: '📷 Upload Picture (Optional)',
    ITEMS_CONSUMED: 'Items Consumed',
    DESCRIPTION_OPTIONAL: 'Description (Optional)',
    DISPLAY_NAME: 'Display Name',
    ENABLE_NOTIFICATIONS: 'Enable notifications for new posts',
    DARK_MODE: 'Dark mode',
  },
} as const

// Numeric Limits and Defaults
export const LIMITS = {
  MIN_ITEM_COUNT: 1,
  MAX_ITEM_COUNT: 50,
  DEFAULT_ITEM_COUNT: 1,
  TEXTAREA_ROWS_SMALL: 2,
  TEXTAREA_ROWS_MEDIUM: 3,
} as const

export const TIMEOUTS = {
  FOCUS_DELAY: 0,
} as const

// Environment Configuration
export const CONFIG = {
  DEV_HOSTNAMES: ['localhost', '127.0.0.1'],
  BASE_PATH: '/hotdog_tracker_prototype/',
  IS_DEVELOPMENT: env.isDevelopment,
  IS_PRODUCTION: env.isProduction,
  IS_DEBUG_ENABLED: env.IS_DEBUG_ENABLED,
  APP_VERSION: env.APP_VERSION,
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
    FOOTER: 'modal-footer',
  },

  // Form Elements
  FORM: {
    SECTION: 'form-section',
    INPUT: 'settings-input',
    BUTTON_PRIMARY: 'btn-primary',
    BUTTON_SECONDARY: 'btn-secondary',
  },
} as const


// Statistics Labels
export const STATS_LABELS = {
  TOTAL_ITEMS: 'Total Items',
  POSTS: 'Posts',
  AVG_PER_POST: 'Avg per Post',
  BEST_SINGLE_POST: 'Best Single Post',
} as const

// Button and Action Text
export const BUTTON_TEXT = {
  LOG_ENTRY: '📝 Log Entry',
  SAVE_SETTINGS: '💾 Save Settings',
  EXPORT_DATA: '📥 Export Data',
  CLEAR_ALL_DATA: '🗑️ Clear All Data',
  REMOVE: 'Remove',
  CLOSE: 'Close',
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
  CLOSE: '✕',
} as const
