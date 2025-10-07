import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'

type ToastProps = {
  type?: ToastType
  title?: string
  message?: string
  onClose?: () => void
  duration?: number
  className?: string
}

type ToastManagerProps = {
  toasts: Array<{ id: string; type: ToastType; message: string }>
  onDismiss: (id: string) => void
}

export function Toast({
  type = 'success',
  title,
  message,
  onClose,
  duration = 3000,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!onClose) return

    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  const Icon = type === 'success' ? CheckCircle : AlertCircle

  return (
    <div
      className={cn(
        'pointer-events-auto w-80 rounded-lg border bg-card shadow-lg ring-1 ring-black/5',
        type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50',
        className
      )}
      role="status"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', type === 'success' ? 'text-emerald-600' : 'text-red-600')} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <p className="text-sm font-semibold text-foreground">{title}</p>
            )}
            {message && (
              <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-3 inline-flex text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )}

export function ToastManager({ toasts, onDismiss }: ToastManagerProps) {
  return (
    <div className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-end sm:p-6 z-[9999]">
      <div className="flex w-full flex-col items-end space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => onDismiss(toast.id)}
          />
        ))}
      </div>
    </div>
  )}
