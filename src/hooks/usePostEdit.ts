import { useState } from 'react'

import type { ContestPost } from '@types'

interface UsePostEditReturn {
  editingPostId: string | null
  editCount: string
  editDescription: string
  isSaving: boolean
  setEditCount: React.Dispatch<React.SetStateAction<string>>
  setEditDescription: React.Dispatch<React.SetStateAction<string>>
  startEditing: (post: ContestPost) => void
  saveEdit: () => Promise<void>
  cancelEdit: () => void
}

function usePostEdit(
  onSave: (
    postId: string,
    count: number,
    description?: string
  ) => Promise<boolean>
): UsePostEditReturn {
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editCount, setEditCount] = useState<string>('1')
  const [editDescription, setEditDescription] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const startEditing = (post: ContestPost) => {
    setEditingPostId(post.id)
    setEditCount((post.count ?? 1).toString())
    setEditDescription(post.description ?? '')

    // Focus and select the input after state updates
    setTimeout(() => {
      const input = document.querySelector('.edit-count-input')!
      if (input) {
        ;(input as HTMLInputElement).focus()
        ;(input as HTMLInputElement).select()
      }
    }, 0)
  }

  const saveEdit = async () => {
    if (editingPostId && !isSaving) {
      setIsSaving(true)
      try {
        const count = parseInt(editCount) || 1
        const success = await onSave(editingPostId, count, editDescription)
        if (success) {
          setEditingPostId(null)
        }
      } finally {
        setIsSaving(false)
      }
    }
  }

  const cancelEdit = () => {
    setEditingPostId(null)
  }

  return {
    editingPostId,
    editCount,
    editDescription,
    isSaving,
    setEditCount,
    setEditDescription,
    startEditing,
    saveEdit,
    cancelEdit,
  }
}

export default usePostEdit
