'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { STAGE_LABELS } from '@/lib/types'
import type { AuditEntry } from '@/lib/types'

interface AuditLogProps {
  entries: AuditEntry[]
}

export function AuditLog({ entries }: AuditLogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })

  return (
    <div className="border border-white/8 rounded-lg overflow-hidden bg-[#0F1E35]">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-xs font-medium text-[#94A3B8]">Audit Log</span>
          {entries.length > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] text-[10px] font-bold">
              {entries.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#94A3B8]/50">Session only — clears on refresh</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]/50" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]/50" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/6">
          {entries.length === 0 ? (
            <p className="text-xs text-[#94A3B8]/50 px-4 py-4">
              No generations this session.
            </p>
          ) : (
            <div className="divide-y divide-white/4 max-h-64 overflow-y-auto">
              {entries
                .slice()
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="px-4 py-3 flex flex-col gap-0.5">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-[#94A3B8]/60 font-mono">
                        {formatTime(entry.timestamp)}
                      </span>
                      <span className="text-[#F8FAFC]/70">
                        {STAGE_LABELS[entry.stage]}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          entry.provider === 'claude'
                            ? 'bg-[#06B6D4]/10 text-[#06B6D4]'
                            : 'bg-emerald-600/10 text-emerald-400'
                        }`}
                      >
                        {entry.provider}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8]/40 leading-relaxed">
                      {entry.policyTag}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
