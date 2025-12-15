import { useEffect, useState } from 'react'

interface LocationBeamAnimationProps {
  isSearching: boolean
}

export default function LocationBeamAnimation({ isSearching }: LocationBeamAnimationProps) {
  const [pulseCount, setPulseCount] = useState(0)

  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setPulseCount((prev) => (prev + 1) % 3)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isSearching])

  if (!isSearching) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative">
        {/* Center Point */}
        <div className="relative z-10 w-6 h-6 bg-primary-500 rounded-full shadow-lg">
          <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping"></div>
        </div>

        {/* Beam Circles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary-500 ${
              i <= pulseCount ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-300`}
            style={{
              width: `${(i + 1) * 100}px`,
              height: `${(i + 1) * 100}px`,
              animation: `pulse-ring ${2 + i * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`,
            }}
          ></div>
        ))}

        {/* Rotating Beam */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
          <div className="relative w-full h-full animate-spin-slow">
            <div className="absolute top-0 left-1/2 w-1 h-32 bg-gradient-to-t from-primary-500 to-transparent -translate-x-1/2 opacity-50"></div>
            <div className="absolute bottom-0 left-1/2 w-1 h-32 bg-gradient-to-b from-primary-500 to-transparent -translate-x-1/2 opacity-50"></div>
          </div>
        </div>

        {/* Text */}
        <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-white text-lg font-semibold mb-2">Searching for providers nearby</p>
          <div className="flex gap-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
