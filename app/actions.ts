'use server'

import { getProvider } from '@/lib/providers'
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/prompts'
import type { PatientContext, GeneratedCommunication } from '@/lib/types'

export interface GenerationError {
  error: true
  message: string
}

export async function generateCommunication(
  context: PatientContext
): Promise<GeneratedCommunication | GenerationError> {
  if (!context.patientName?.trim()) {
    return { error: true, message: 'Patient name is required.' }
  }
  if (!context.stage) {
    return { error: true, message: 'Cycle stage is required.' }
  }

  try {
    const provider = getProvider()
    const userPrompt = buildPrompt(context.stage, context)
    const result = await provider.generateCommunication(
      context.stage,
      context,
      SYSTEM_PROMPT,
      userPrompt
    )
    return result
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { error: true, message }
  }
}
