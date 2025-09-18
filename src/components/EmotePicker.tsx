import { memo, useRef, useEffect } from 'react'

import { REACTION_EMOJIS, type ReactionEmoji } from '@types'

import './EmotePicker.css'

interface EmotePickerProps {
  /** Whether the picker is currently open */
  isOpen: boolean
  /** Function to close the picker */
  onClose: () => void
  /** Function called when an emoji is selected */
  onSelect: (emoji: ReactionEmoji) => void
  /** Currently selected emojis */
  selectedEmojis?: string[]
  /** Whether the picker is disabled */
  disabled?: boolean
}

/**
 * EmotePicker component displays a grid of predefined emoji reactions.
 * Users can select multiple emojis to react to a post.
 */
function EmotePicker({
  isOpen,
  onClose,
  onSelect,
  selectedEmojis = [],
  disabled = false,
}: EmotePickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
    return undefined
  }, [isOpen, onClose])

  // Close picker on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
    return undefined
  }, [isOpen, onClose])

  const handleEmojiClick = (emoji: ReactionEmoji) => {
    if (disabled) return

    // Toggle the emoji in the selection
    onSelect(emoji)
    // Don't close the picker - let users select multiple emojis
  }

  if (!isOpen) return null

  return (
    <div className="emote-picker-overlay">
      <div className="emote-picker" ref={pickerRef}>
        <div className="emote-picker-header">
          <span className="emote-picker-title">React with emojis</span>
          <button
            className="emote-picker-close"
            onClick={onClose}
            aria-label="Close emoji picker"
          >
            ×
          </button>
        </div>

        <div className="emote-picker-grid">
          {Object.values(REACTION_EMOJIS).map(emoji => (
            <button
              key={emoji}
              className={`emote-picker-emoji ${
                selectedEmojis.includes(emoji) ? 'selected' : ''
              } ${disabled ? 'disabled' : ''}`}
              onClick={() => handleEmojiClick(emoji)}
              disabled={disabled}
              title={getEmojiTitle(emoji)}
              aria-label={`React with ${getEmojiTitle(emoji)}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="emote-picker-footer">
          <button
            className="done-btn"
            onClick={onClose}
            aria-label="Done selecting reactions"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Get human-readable title for emoji
 */
function getEmojiTitle(emoji: string): string {
  const titleMap: Record<string, string> = {
    [REACTION_EMOJIS.THUMBS_UP]: 'Thumbs up',
    [REACTION_EMOJIS.HEART]: 'Love',
    [REACTION_EMOJIS.HEART_EYES]: 'Heart eyes',
    [REACTION_EMOJIS.PARTY]: 'Celebrate',
    [REACTION_EMOJIS.FIRE]: 'Fire',
    [REACTION_EMOJIS.HUNDRED]: 'Perfect',
    [REACTION_EMOJIS.LAUGH]: 'Laugh',
    [REACTION_EMOJIS.THINKING]: 'Thinking',
  }
  return titleMap[emoji] ?? emoji
}

export default memo(EmotePicker)
