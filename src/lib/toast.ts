export type ToastVariant = 'success' | 'error'

export function toast(message: string, variant: ToastVariant = 'success') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('ace:toast', {
      detail: { id: Date.now() + Math.random(), message, variant },
    })
  )
}
