'use client'

import { useState, useCallback } from 'react'
import { ProviderToggle } from '@/components/ProviderToggle'
import { CoordinatorForm } from '@/components/CoordinatorForm'
import { CommunicationOutput } from '@/components/CommunicationOutput'
import { AuditLog } from '@/components/AuditLog'
import { generateCommunication } from '@/app/actions'
import type { PatientContext, GeneratedCommunication, AuditEntry, ModelProvider } from '@/lib/types'

const POLICY_TAG =
  'HIPAA: No PHI stored. AI-assisted draft only. Coordinator review required before sending.'

export default function Home() {
  const [provider, setProvider] = useState<ModelProvider>('ollama')
  const [output, setOutput] = useState<GeneratedCommunication | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])

  const handleGenerate = useCallback(
    async (context: PatientContext) => {
      setError(null)
      const result = await generateCommunication(context)

      if ('error' in result) {
        setError(result.message)
        return
      }

      const comm: GeneratedCommunication = { ...result }
      setOutput(comm)

      const entry: AuditEntry = {
        id: crypto.randomUUID(),
        timestamp: comm.timestamp,
        stage: comm.stage,
        provider: comm.provider,
        policyTag: POLICY_TAG,
      }

      setAuditEntries((prev) => {
        const next = [...prev, entry]
        return next.length > 20 ? next.slice(next.length - 20) : next
      })
    },
    [provider]
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative border-b border-white/8 px-4 md:px-6 py-4">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 120% at 50% -20%, rgba(6,182,212,0.07) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[#06B6D4] tracking-tight">
                Cycle Relay
              </h1>
              <p className="text-xs text-[#94A3B8] hidden sm:block">
                IVF coordinator communication assistant
              </p>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Demo
            </span>
            <span className="hidden md:inline-block text-[10px] text-[#94A3B8]/60">
              Built for Coastal Fertility Specialists
            </span>
          </div>
          <ProviderToggle provider={provider} onChange={setProvider} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left: Form */}
          <section className="bg-[#0F1E35] border border-white/8 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
              Coordinator Input
            </h2>
            <CoordinatorForm
              provider={provider}
              onGenerate={handleGenerate}
            />
          </section>

          {/* Right: Output */}
          <section className="bg-[#0F1E35] border border-white/8 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
              Generated Communication
            </h2>
            <CommunicationOutput output={output} />
          </section>
        </div>

        {/* Audit Log */}
        <div className="mt-6">
          <AuditLog entries={auditEntries} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-xs text-[#94A3B8]/60">
          <span>Cycle Relay by Adam VanArsdalen</span>
          <div className="flex items-center gap-4">
            <span>Built with Next.js and Claude</span>
            <a
              href="https://github.com/adam-vanarsdalen/cycle-relay"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
