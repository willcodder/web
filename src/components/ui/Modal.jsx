import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const dialogRef    = useRef()
  const previousFocus = useRef()

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement
      document.body.style.overflow = 'hidden'
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

  function onKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab') return
    const focusable = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])]
    if (!focusable.length) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={onKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        ref={dialogRef}
        className={`
          relative w-full ${sizes[size]}
          bg-white dark:bg-[#1C1C1E]
          rounded-t-[22px] sm:rounded-[20px]
          shadow-modal dark:shadow-dark-modal
          max-h-[94vh] sm:max-h-[90vh]
          flex flex-col
          sm:animate-scale-in animate-slide-up
        `}
      >
        {/* Drag handle (mobile only) */}
        <div
          className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-9 h-1 bg-gray-300 dark:bg-[#3A3A3C] rounded-full"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 sm:px-6 sm:pt-5 border-b border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
          <h2
            id="modal-title"
            className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/[0.06] dark:bg-white/[0.1] text-gray-500 dark:text-gray-400 hover:bg-black/[0.1] dark:hover:bg-white/[0.15] transition-colors flex-shrink-0"
          >
            <X size={14} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  )
}
