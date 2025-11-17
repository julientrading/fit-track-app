import { useEffect } from 'react'
import { CheckCircle, TrendingUp } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'info' | 'celebration'
  duration?: number
  onClose: () => void
}

export const Toast = ({ message, type = 'success', duration = 2000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    info: <CheckCircle className="w-6 h-6" />,
    celebration: <TrendingUp className="w-6 h-6" />,
  }

  const backgrounds = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    celebration: 'bg-gradient-to-r from-purple-500 to-pink-500',
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`${backgrounds[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] max-w-md`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="font-semibold text-lg">{message}</p>
      </div>
    </div>
  )
}
