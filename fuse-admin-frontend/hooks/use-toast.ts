import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error'

export type Toast = {
  id: string
  type: ToastType
  message: string
  title?: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ type, message, title }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message, title }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toasts,
    toast,
    dismiss,
    success: (message: string, title?: string) => toast({ type: 'success', message, title }),
    error: (message: string, title?: string) => toast({ type: 'error', message, title }),
  }
}

