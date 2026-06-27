'use client'

import { useState } from 'react'
import { Copy, Check, ClipboardList, AlertTriangle, FileText, User } from 'lucide-react'
import { STAGE_LABELS } from '@/lib/types'
import type { GeneratedCommunication } from '@/lib/types'

interface CommunicationOutputProps {
  output: GeneratedCommunication | null
}

export function CommunicationOutput({ output }: CommunicationOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!output?.patientMessage) return
    await navigator.clipboard.writeText(output.patientMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <ClipboardList className="w-10 h-10 text-[#94A3B8]/30" />
        <div>
          <p className="text-[#F8FAFC]/70 text-sm font-medium">No message generated yet</p>
          <p className="text-[#94A3B8] text-xs mt-1">
            Select a stage, fill in the context, and click Generate.
          </p>
        </div>
      </div>
    )
  }

  const formattedTime = new Date(output.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Patient Message */}
      <div className="bg-[#0F1E35] border border-white/8 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Patient Message
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors px-2 py-1 rounded hover:bg-white/5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-[#F8FAFC] leading-relaxed whitespace-pre-wrap">
            {output.patientMessage}
          </p>
        </div>
      </div>

      {/* Coordinator Summary */}
      <div className="bg-[#0F1E35] border border-white/8 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
          <FileText className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
            Coordinator Summary
          </span>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
            {output.coordinatorSummary}
          </p>
        </div>
      </div>

      {/* Clinical Flags */}
      {output.clinicalFlags.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-500/10">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Clinical Flags — Physician Review Recommended
            </span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2">
            {output.clinicalFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/70 shrink-0" />
                <p className="text-sm text-amber-200/80 leading-relaxed">{flag}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output Meta */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]/60 px-1">
        <span>{STAGE_LABELS[output.stage]}</span>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${
              output.provider === 'claude'
                ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20'
                : 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20'
            }`}
          >
            {output.provider === 'claude' ? 'Claude' : 'Ollama'}
          </span>
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* HIPAA policy tag */}
      <p className="text-[10px] text-[#94A3B8]/40 leading-relaxed text-center">
        HIPAA: No PHI stored. AI-assisted draft only. Coordinator review required before sending.
      </p>
    </div>
  )
}
