import { useState, useCallback, useRef } from 'react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface FileDropzoneProps {
  value?: string
  file?: File | null
  onFileSelect: (file: File) => void
  onClear?: () => void
  label?: string
  aspectRatio?: 'square' | 'banner' | 'auto'
  size?: 'small' | 'medium' | 'large'
  maxSizeMB?: number
}

export default function FileDropzone({
  value,
  file: _file,
  onFileSelect,
  onClear,
  label = 'Upload Image',
  aspectRatio = 'auto',
  size = 'medium',
  maxSizeMB = 5,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    small: {
      container: 'max-w-xs',
      preview: aspectRatio === 'square' ? 'w-32 h-32' : aspectRatio === 'banner' ? 'w-full h-24' : 'w-full h-32',
      icon: 'h-10 w-10',
      text: 'text-xs',
    },
    medium: {
      container: 'max-w-md',
      preview: aspectRatio === 'square' ? 'w-48 h-48' : aspectRatio === 'banner' ? 'w-full h-32' : 'w-full h-40',
      icon: 'h-12 w-12',
      text: 'text-sm',
    },
    large: {
      container: 'max-w-2xl',
      preview: '',
      icon: 'h-16 w-16',
      text: 'text-sm',
    },
  }

  const validateFile = (selectedFile: File): string | null => {
    if (!selectedFile.type.startsWith('image/')) {
      return 'Please upload an image file'
    }

    const sizeMB = selectedFile.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const handleFile = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    // Create preview first
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      // Only call onFileSelect after preview is ready
      onFileSelect(selectedFile)
    }
    reader.readAsDataURL(selectedFile)
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    }
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Prioritize preview (local file), then value (URL from backend)
  const displayImage = preview || value

  return (
    <div className={`space-y-2 ${sizeClasses[size].container}`}>
      {label && (
        <label className={`block font-medium text-gray-700 ${sizeClasses[size].text}`}>
          {label}
        </label>
      )}

      {displayImage ? (
        <div className="relative group">
          <img
            src={displayImage.startsWith('http') ? displayImage : displayImage.startsWith('data:') ? displayImage : `${import.meta.env.VITE_API_URL}${displayImage}`}
            alt="Preview"
            className={`object-cover rounded-lg border-2 border-gray-200 ${sizeClasses[size].preview}`}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg text-center cursor-pointer transition-all
            ${size === 'small' ? 'p-4 min-h-[120px]' : size === 'medium' ? 'p-6 min-h-[160px]' : 'p-8 min-h-[200px]'}
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center h-full">
            {isDragging ? (
              <CloudArrowUpIcon className={`${sizeClasses[size].icon} text-primary-500 mb-2`} />
            ) : (
              <PhotoIcon className={`${sizeClasses[size].icon} text-gray-400 mb-2`} />
            )}
            <p className={`text-gray-600 mb-1 ${sizeClasses[size].text}`}>
              {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
            </p>
            <p className={`text-gray-500 ${size === 'small' ? 'text-xs' : 'text-xs'}`}>
              PNG, JPG, GIF up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className={`text-red-600 mt-2 ${sizeClasses[size].text}`}>{error}</p>
      )}
    </div>
  )
}
