interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-3',
    xl: 'h-24 w-24 border-4',
  }

  const spinner = (
    <div className={`text-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-primary-500 border-t-transparent border-l-transparent border-r-transparent mx-auto ${sizeClasses[size]}`}
      ></div>
      {text && (
        <p className="text-gray-600 mt-4 text-sm md:text-base">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card">
      <div className="animate-pulse space-y-4">
        <LoadingSkeleton className="h-48 w-full" />
        <LoadingSkeleton className="h-6 w-3/4" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <div className="flex gap-3 mt-4">
          <LoadingSkeleton className="h-10 w-24" />
          <LoadingSkeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}

export function ProviderCardSkeleton() {
  return (
    <div className="card">
      <div className="animate-pulse">
        <LoadingSkeleton className="h-48 w-full rounded-t-xl mb-4" />
        <div className="space-y-3">
          <LoadingSkeleton className="h-6 w-3/4" />
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-5/6" />
          <div className="flex items-center gap-2 mt-4">
            <LoadingSkeleton className="h-5 w-20" />
            <LoadingSkeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <LoadingSkeleton className="h-12 flex-1" />
          <LoadingSkeleton className="h-12 w-24" />
        </div>
      ))}
    </div>
  )
}
