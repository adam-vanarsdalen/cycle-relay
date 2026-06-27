'use client'

import { useState } from 'react'
import type { ModelProvider } from '@/lib/types'

interface ProviderToggleProps {
  provider: ModelProvider
  onChange: (provider: ModelProvider) => void
}

export function ProviderToggle({ provider, onChange }: ProviderToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="flex items-center gap-1 bg-[#0F1E35] rounded-full p-1 border border-white/8">
      <button
        onClick={() => onChange('claude')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
          provider === 'claude'
            ? 'bg-[#06B6D4] text-[#0B1628] shadow-sm'
            : 'text-[#94A3B8] hover:text-[#F8FAFC]'
        }`}
      >
        Claude
        <span className="ml-1 opacity-60">Cloud</span>
      </button>

      <div className="relative">
        <button
          onClick={() => onChange('ollama')}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
            provider === 'ollama'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Ollama
          <span className="opacity-60">Local / HIPAA</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-70" />
        </button>

        {showTooltip && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#0F1E35] border border-white/10 rounded-lg p-3 z-50 shadow-xl">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              <span className="text-emerald-400 font-medium block mb-1">Local deployment only.</span>
              PHI never leaves your network. Requires a local Ollama instance.
              See README for setup instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
