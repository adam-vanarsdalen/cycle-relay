'use client'

import { STAGE_LABELS } from '@/lib/types'
import type { DemoPatient } from '@/lib/types'

interface DemoPatientCardProps {
  patient: DemoPatient
  isActive: boolean
  onSelect: (patient: DemoPatient) => void
}

export function DemoPatientCard({ patient, isActive, onSelect }: DemoPatientCardProps) {
  return (
    <button
      onClick={() => onSelect(patient)}
      className={`text-left p-3 rounded-lg border transition-all duration-150 w-full ${
        isActive
          ? 'border-[#06B6D4]/60 bg-[#06B6D4]/5'
          : 'border-white/8 bg-[#0F1E35] hover:border-[#06B6D4]/40 hover:bg-[#06B6D4]/3'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">{patient.name}</span>
        <span className="text-xs text-[#94A3B8] shrink-0">Age {patient.age}</span>
      </div>
      <div className="mb-1.5">
        <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/20">
          {STAGE_LABELS[patient.stage]}
        </span>
      </div>
      <p className="text-xs text-[#94A3B8] leading-relaxed">{patient.description}</p>
    </button>
  )
}
