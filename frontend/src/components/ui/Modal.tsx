import React, { useEffect } from "react"

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  footer?: React.ReactNode
  children: React.ReactNode
  widthClass?: string
}

export function Modal({ open, onClose, title, footer, children, widthClass = "max-w-3xl" }: Props) {
  // قفل تمرير الخلفية + تعويض عرض السكروب بدون قفزة (يدعم RTL)
  useEffect(() => {
    if (!open) return
    const docEl = document.documentElement
    const body = document.body

    const scrollbar = window.innerWidth - docEl.clientWidth
    const dir = getComputedStyle(docEl).direction
    const inlineEnd = dir === "rtl" ? "paddingLeft" : "paddingRight"

    const prevOverflow = body.style.overflow
    const prevPadRight = body.style.paddingRight
    const prevPadLeft  = body.style.paddingLeft

    body.style.overflow = "hidden"
    if (inlineEnd === "paddingRight") body.style.paddingRight = `${scrollbar}px`
    else body.style.paddingLeft = `${scrollbar}px`

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadRight
      body.style.paddingLeft  = prevPadLeft
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true"
           className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] ${widthClass}`}>
        <div className="card rounded-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="font-semibold">{title}</div>
            <button onClick={onClose} className="px-3 py-1 rounded-lg hover:bg-white/10">✕</button>
          </div>
          <div className="p-4">{children}</div>
          {footer && <div className="px-4 py-3 border-t border-white/10">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
