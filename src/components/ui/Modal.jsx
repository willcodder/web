import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const dialogRef = useRef()
  const previousFocus = useRef()

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement
      document.body.style.overflow = 'hidden'
      // Focus first focusable element after render
      requestAnimationFrame(() => {
        const el = dialogRef.current?.querySelector(FOCUSABLE)
        el?.focus()
      })
    } else {
      document.body.style.overflow = ''
      previousFocus.current?.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Focus trap
  function onKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab') return
    const focusable = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])]
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={onKeyDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Panel — slides up from bottom on mobile, centered on desktop */}
      <div
        ref={dialogRef}
        className={`
          relative bg-white dark:bg-gray-800 w-full
          rounded-t-2xl sm:rounded-xl shadow-xl
          ${sizes[size]} max-h-[92vh] sm:max-h-[90vh]
          flex flex-col border border-gray-200 dark:border-gray-700
          animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="modal-title" className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>

        {/* Drag handle indicator on mobile */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" aria-hidden="true" />
      </div>
    </div>
  )
}
