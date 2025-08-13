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
      // Log file details for debugging
      console.log('📸 Image upload started:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      })

      // Check file size (Firestore document limit is 1MB, base64 encoding increases size by ~33%)
      const maxSize = 750 * 1024 // 750KB to account for base64 overhead
      if (file.size > maxSize) {
        console.error('❌ Image file too large:', {
          size: file.size,
          maxSize,
          fileName: file.name,
        })
        alert(
          `Image file is too large (${Math.round(file.size / 1024)}KB). Please choose an image smaller than ${Math.round(maxSize / 1024)}KB.`
        )
        return
      }

      const reader = new FileReader()

      reader.onload = e => {
        const result = e.target?.result as string
        console.log('✅ Image upload successful:', {
          fileName: file.name,
          originalSize: file.size,
          base64Length: result.length,
          previewPrefix: result.substring(0, 50) + '...',
        })
        setImagePreview(result)
      }

      reader.onerror = e => {
        console.error('❌ Image upload failed:', {
          error: e,
          fileName: file.name,
          fileSize: file.size,
        })
        alert(
          'Failed to load image. Please try again or choose a different image.'
        )
      }

      reader.onabort = () => {
        console.warn('⚠️ Image upload aborted:', file.name)
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
