'use server'

import { getProvider } from '@/lib/providers'
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/prompts'
import { CycleStage } from '@/lib/types'
import type { PatientContext, GeneratedCommunication, ModelProvider } from '@/lib/types'

const MANDATORY_FLAGS: Partial<Record<CycleStage, string>> = {
  [CycleStage.BETA_NEGATIVE]: 'Physician follow-up consultation required — beta negative result.',
}

export interface GenerationError {
  error: true
  message: string
}

export async function generateCommunication(
  context: PatientContext,
  providerName: ModelProvider
): Promise<GeneratedCommunication | GenerationError> {
  if (!context.patientName?.trim()) {
    return { error: true, message: 'Patient name is required.' }
  }
  if (!context.stage) {
    return { error: true, message: 'Cycle stage is required.' }
  }

  try {
    const provider = getProvider(providerName)
    const userPrompt = buildPrompt(context.stage, context)
    const result = await provider.generateCommunication(
      context.stage,
      context,
      SYSTEM_PROMPT,
      userPrompt
    )

    // Enforce mandatory clinical flags that must appear regardless of model output
    const mandatoryFlag = MANDATORY_FLAGS[context.stage]
    if (mandatoryFlag && !result.clinicalFlags.some(f => f.includes('Physician follow-up'))) {
      result.clinicalFlags = [mandatoryFlag, ...result.clinicalFlags]
    }

    return result
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { error: true, message }
  }
}
