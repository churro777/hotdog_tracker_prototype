import { useState } from 'react'

interface UseImageUploadReturn {
  imagePreview: string | null
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  clearImage: () => void
  resetFileInput: (inputId: string) => void
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
}

function useImageUpload(): UseImageUploadReturn {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
  }

  const resetFileInput = (inputId: string) => {
    const fileInput = document.getElementById(inputId) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return {
    imagePreview,
    handleImageUpload,
    clearImage,
    resetFileInput,
    setImagePreview,
  }
}

export default useImageUpload
