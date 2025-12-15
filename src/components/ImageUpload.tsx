import { useState, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
  label?: string
  aspectRatio?: 'square' | 'banner' | 'auto'
  size?: 'small' | 'medium' | 'large'
  maxSizeMB?: number
  uploadEndpoint: string
  uploadKey?: string
}

// Base API URL (e.g. http://localhost:3000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Strip `/api/v1` from the end to get the backend origin for serving static files like `/uploads/...`
const BACKEND_ORIGIN = API_URL.replace(/\/?api\/v1\/?$/, '')

export default function ImageUpload({
  value,
  onChange,
  onClear,
  label = 'Upload Image',
  aspectRatio = 'auto',
  size = 'medium',
  maxSizeMB = 5,
  uploadEndpoint,
  uploadKey = 'file',
}: ImageUploadProps) {
  const { getToken } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    square: 'aspect-square',
    banner: 'aspect-[21/9]',
    auto: 'aspect-video',
  }

  const sizeClasses = {
    small: {
      container: 'max-w-xs',
      preview: value ? (aspectRatio === 'square' ? 'w-32 h-32' : aspectRatio === 'banner' ? 'w-full h-24' : 'w-full h-32') : '',
      icon: 'h-10 w-10',
      text: 'text-xs',
    },
    medium: {
      container: 'max-w-md',
      preview: value ? (aspectRatio === 'square' ? 'w-48 h-48' : aspectRatio === 'banner' ? 'w-full h-32' : 'w-full h-40') : '',
      icon: 'h-12 w-12',
      text: 'text-sm',
    },
    large: {
      container: 'max-w-2xl',
      preview: value ? '' : '',
      icon: 'h-16 w-16',
      text: 'text-sm',
    },
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file'
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append(uploadKey, file)

      // Get auth token from Clerk
      const token = await getToken()

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          // Backend returns full provider/service object
          // Extract the image URL from the response
          const imageUrl =
            response.url ||
            response.path ||
            response.profileImage ||
            response.bannerImage ||
            response.image ||
            response.data?.url
          if (imageUrl) {
            onChange(imageUrl)
          } else {
            console.error('Response:', response)
            setUploadError('Upload successful but no URL returned')
          }
        } else {
          const error = JSON.parse(xhr.responseText)
          setUploadError(error.message || 'Upload failed')
        }
        setIsUploading(false)
        setUploadProgress(0)
      })

      xhr.addEventListener('error', () => {
        setUploadError('Network error during upload')
        setIsUploading(false)
        setUploadProgress(0)
      })

      xhr.open('POST', `${API_URL}${uploadEndpoint}`)
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      xhr.send(formData)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Failed to upload image')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }, [uploadFile])

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
      uploadFile(files[0])
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    }
    onChange('')
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-2 ${sizeClasses[size].container}`}>
      {label && (
        <label className={`block font-medium text-gray-700 ${sizeClasses[size].text}`}>
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group">
          <img
            src={
              value.startsWith('http')
                ? value
                : `${BACKEND_ORIGIN}${value}`
            }
            alt="Uploaded preview"
            className={`object-cover rounded-lg border-2 border-gray-200 ${sizeClasses[size].preview || aspectClasses[aspectRatio]}`}
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
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg text-center cursor-pointer transition-all
            ${size === 'small' ? 'p-4 min-h-[120px]' : size === 'medium' ? 'p-6 min-h-[160px]' : 'p-8 min-h-[200px]'}
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${isUploading ? 'pointer-events-none opacity-75' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center h-full">
            {isUploading ? (
              <>
                <div className={`animate-spin rounded-full border-b-2 border-primary-500 mb-2 ${size === 'small' ? 'h-8 w-8' : 'h-12 w-12'}`}></div>
                <p className={`text-gray-600 ${sizeClasses[size].text}`}>Uploading... {Math.round(uploadProgress)}%</p>
                <div className="w-full max-w-xs mt-2 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <p className={`text-red-600 mt-2 ${sizeClasses[size].text}`}>{uploadError}</p>
      )}
    </div>
  )
}
