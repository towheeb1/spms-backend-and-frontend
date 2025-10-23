import React from "react"

type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 select-none"
    >
      <span
        className={`w-10 h-6 rounded-full transition ${checked ? "bg-brand" : "bg-white/20"} 
                    flex items-center ${checked ? "justify-end" : "justify-start"} px-0.5`}
      >
        <span className="w-5 h-5 bg-white rounded-full transition-transform" />
      </span>
      {label && <span className="text-sm opacity-90">{label}</span>}
    </button>
  )
}
