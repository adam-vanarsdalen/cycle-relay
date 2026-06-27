'use client'

import { useState, useTransition } from 'react'
import { Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { CycleStage, CycleStageGroup, STAGE_LABELS, STAGE_GROUPS } from '@/lib/types'
import type { PatientContext, ModelProvider } from '@/lib/types'
import { DEMO_PATIENTS } from '@/lib/demo-patients'
import { DemoPatientCard } from './DemoPatientCard'

interface CoordinatorFormProps {
  provider: ModelProvider
  onGenerate: (context: PatientContext) => Promise<void>
}

const emptyContext = (): PatientContext => ({
  stage: CycleStage.STIM_MID,
  patientName: '',
  follicleCount: '',
  e2Level: '',
  medicationAdjustment: '',
  nextAppointment: '',
  clinicalNotes: '',
})

export function CoordinatorForm({ provider, onGenerate }: CoordinatorFormProps) {
  const [context, setContext] = useState<PatientContext>(emptyContext())
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isOllamaOnCloud =
    provider === 'ollama' && process.env.NEXT_PUBLIC_MODEL_PROVIDER !== 'ollama'

  const set = (field: keyof PatientContext, value: string) => {
    setContext((prev) => ({ ...prev, [field]: value }))
    setActiveDemoId(null)
  }

  const loadDemo = (patient: (typeof DEMO_PATIENTS)[number]) => {
    setContext({ ...patient.context })
    setActiveDemoId(patient.id)
  }

  const clear = () => {
    setContext(emptyContext())
    setActiveDemoId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await onGenerate(context)
    })
  }

  const canGenerate = context.patientName.trim().length > 0 && !isPending

  return (
    <div className="flex flex-col gap-5">
      {/* Demo patient cards */}
      <div>
        <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
          Demo Patients
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_PATIENTS.map((patient) => (
            <DemoPatientCard
              key={patient.id}
              patient={patient}
              isActive={activeDemoId === patient.id}
              onSelect={loadDemo}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-white/6" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Stage */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Cycle Stage <span className="text-[#06B6D4]">*</span>
            </label>
            <select
              value={context.stage}
              onChange={(e) => set('stage', e.target.value)}
              className="w-full bg-[#0F1E35] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]/50 transition-colors"
            >
              {Object.values(CycleStageGroup).map((group) => (
                <optgroup key={group} label={group}>
                  {STAGE_GROUPS[group].map((stage) => (
                    <option key={stage} value={stage}>
                      {STAGE_LABELS[stage]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Patient Name */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Patient First Name <span className="text-[#06B6D4]">*</span>
            </label>
            <input
              type="text"
              value={context.patientName}
              onChange={(e) => set('patientName', e.target.value)}
              placeholder="e.g. Sarah"
              className="w-full bg-[#0F1E35] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06B6D4]/50 transition-colors"
            />
          </div>

          {/* Follicle Count */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Follicle Count / Egg Data
            </label>
            <input
              type="text"
              value={context.follicleCount ?? ''}
              onChange={(e) => set('follicleCount', e.target.value)}
              placeholder="e.g. Left: 6 (14,15,16mm), Right: 5 (12,13mm)"
              className="w-full bg-[#0F1E35] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06B6D4]/50 transition-colors"
            />
          </div>

          {/* E2 */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              E2 / Lab Value
            </label>
            <input
              type="text"
              value={context.e2Level ?? ''}
              onChange={(e) => set('e2Level', e.target.value)}
              placeholder="e.g. 1,240 pg/mL"
              className="w-full bg-[#0F1E35] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06B6D4]/50 transition-colors"
            />
          </div>

          {/* Next Appointment */}
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Next Appointment
            </label>
            <input
              type="text"
              value={context.nextAppointment ?? ''}
              onChange={(e) => set('nextAppointment', e.target.value)}
              placeholder="e.g. Tomorrow at 7:30am"
              className="w-full bg-[#0F1E35] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06B6D4]/50 transition-colors"
            />
          </div>

          {/* Medication */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Medication / Instructions
            </label>
            <input
              type="text"
              value={context.medicationAdjustment ?? ''}
              onChange={(e) => set('medicationAdjustment', e.target.value)}
              placeholder="e.g. Continue Gonal-F 225 IU, add Ganirelix tonight"
              className="w-full bg-[#0F1E35] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06B6D4]/50 transition-colors"
            />
          </div>

          {/* Clinical Notes */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Coordinator Notes
            </label>
            <textarea
              value={context.clinicalNotes ?? ''}
              onChange={(e) => set('clinicalNotes', e.target.value)}
              placeholder="Any additional context for the AI to consider..."
              rows={3}
              className="w-full bg-[#0F1E35] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06B6D4]/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Ollama info state */}
        {isOllamaOnCloud && (
          <div className="rounded-lg bg-emerald-600/10 border border-emerald-600/20 p-3">
            <p className="text-xs text-emerald-400 leading-relaxed">
              <span className="font-medium">Ollama — Local HIPAA Deployment</span>
              <span className="block mt-1 text-emerald-400/70">
                On the live demo, generation requires a local Ollama instance. PHI never
                leaves your network with this mode. See README for setup instructions.
              </span>
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canGenerate || isOllamaOnCloud}
            className="flex-1 flex items-center justify-center gap-2 bg-[#06B6D4] hover:bg-[#06B6D4]/90 disabled:bg-[#06B6D4]/30 disabled:cursor-not-allowed text-[#0B1628] font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-150"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Communication
              </>
            )}
          </button>

          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] border border-white/8 hover:border-white/20 rounded-lg transition-all duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}
