import { useState } from 'react'

interface UseImageUploadReturn {
  imagePreview: string | null
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleCameraCapture: () => void
  handlePhotoLibrary: () => void
  clearImage: () => void
  resetFileInput: (inputId: string) => void
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
}

function useImageUpload(): UseImageUploadReturn {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const compressImage = (
    file: File,
    maxSizeKB = 750,
    quality = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions to reduce file size
        const maxDimension = 1200 // Max width or height
        let { width, height } = img

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        // Try different quality levels until we get under the size limit
        const tryCompress = (currentQuality: number): void => {
          const compressedDataUrl = canvas.toDataURL(
            'image/jpeg',
            currentQuality
          )
          const compressedSizeKB = Math.round(
            (compressedDataUrl.length * 3) / 4 / 1024
          )

          console.log('🔄 Compression attempt:', {
            quality: currentQuality,
            sizeKB: compressedSizeKB,
            targetKB: maxSizeKB,
          })

          if (compressedSizeKB <= maxSizeKB || currentQuality <= 0.1) {
            console.log('✅ Image compression successful:', {
              originalSize: Math.round(file.size / 1024) + 'KB',
              compressedSize: compressedSizeKB + 'KB',
              quality: currentQuality,
              dimensions: `${width}x${height}`,
            })
            resolve(compressedDataUrl)
          } else {
            // Reduce quality and try again
            tryCompress(currentQuality - 0.1)
          }
        }

        tryCompress(quality)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
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

  const processFile = (file: File) => {
    // Log file details for debugging
    console.log('📸 Image upload started:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    })

    // Check if image needs compression
    const maxSize = 750 * 1024 // 750KB to account for base64 overhead

    if (file.size > maxSize) {
      console.log('📷 Image is large, attempting compression...', {
        originalSize: Math.round(file.size / 1024) + 'KB',
        maxSize: Math.round(maxSize / 1024) + 'KB',
      })

      // Attempt compression
      compressImage(file)
        .then(compressedDataUrl => {
          setImagePreview(compressedDataUrl)
        })
        .catch(error => {
          console.error('❌ Image compression failed:', error)
          alert(
            'Unable to compress image. Please try a smaller image or use a different photo.'
          )
        })
    } else {
      // File is already small enough, process normally
      const reader = new FileReader()

      reader.onload = e => {
        const result = e.target?.result as string
        console.log('✅ Image upload successful (no compression needed):', {
          fileName: file.name,
          originalSize: file.size,
          base64Length: result.length,
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

  const handleFileInputChange = (fileInput: HTMLInputElement) => {
    const file = fileInput.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleCameraCapture = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.capture = 'environment' // Use rear camera
    fileInput.addEventListener('change', () => {
      handleFileInputChange(fileInput)
    })
    fileInput.click()
  }

  const handlePhotoLibrary = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.addEventListener('change', () => {
      handleFileInputChange(fileInput)
    })
    fileInput.click()
  }

  return {
    imagePreview,
    handleImageUpload,
    handleCameraCapture,
    handlePhotoLibrary,
    clearImage,
    resetFileInput,
    setImagePreview,
  }
}

export default useImageUpload
