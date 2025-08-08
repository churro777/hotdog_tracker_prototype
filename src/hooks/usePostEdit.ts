import { useState } from 'react'
import type { ContestPost } from '@types'

interface UsePostEditReturn {
  editingPostId: string | null
  editCount: string
  editDescription: string
  setEditCount: React.Dispatch<React.SetStateAction<string>>
  setEditDescription: React.Dispatch<React.SetStateAction<string>>
  startEditing: (post: ContestPost) => void
  saveEdit: () => void
  cancelEdit: () => void
}

function usePostEdit(
  onSave: (postId: string, count: number, description?: string) => void
): UsePostEditReturn {
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editCount, setEditCount] = useState<string>('1')
  const [editDescription, setEditDescription] = useState<string>('')

  const startEditing = (post: ContestPost) => {
    setEditingPostId(post.id)
    setEditCount((post.count || 1).toString())
    setEditDescription(post.description || '')

    // Focus and select the input after state updates
    setTimeout(() => {
      const input = document.querySelector(
        '.edit-count-input'
      ) as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    }, 0)
  }

  const saveEdit = () => {
    if (editingPostId) {
      const count = parseInt(editCount) || 1
      onSave(editingPostId, count, editDescription)
      setEditingPostId(null)
    }
  }

  const cancelEdit = () => {
    setEditingPostId(null)
  }

  return {
    editingPostId,
    editCount,
    editDescription,
    setEditCount,
    setEditDescription,
    startEditing,
    saveEdit,
    cancelEdit,
  }
}

export default usePostEdit
