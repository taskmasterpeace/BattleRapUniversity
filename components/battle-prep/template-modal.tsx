"use client"

import type { PrepTemplate } from "@/lib/types"
import { X } from "lucide-react"

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  templates: PrepTemplate[]
  onApply: (template: PrepTemplate) => void
}

export function TemplateModal({ isOpen, onClose, templates, onApply }: TemplateModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border-2 border-zinc-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-700 bg-zinc-800">
          <h2 className="text-lg font-display font-bold text-zinc-100 tracking-wide">SELECT PREP TEMPLATE</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates */}
        <div className="p-4 space-y-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onApply(template)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-orange-500 p-4 text-left transition-colors group"
            >
              <h3 className="text-sm font-display font-bold text-zinc-100 group-hover:text-orange-500 tracking-wide">
                {template.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">({template.description})</p>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-zinc-700">
          <button
            onClick={() => templates[0] && onApply(templates[0])}
            className="flex-1 bg-orange-600 hover:bg-orange-500 px-4 py-2 text-sm font-display font-bold text-white tracking-wide transition-colors"
          >
            APPLY TEMPLATE
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
