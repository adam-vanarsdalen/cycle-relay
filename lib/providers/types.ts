import type { CycleStage, GeneratedCommunication, PatientContext } from '@/lib/types'

export interface IModelProvider {
  generateCommunication(
    stage: CycleStage,
    context: PatientContext,
    systemPrompt: string,
    userPrompt: string
  ): Promise<GeneratedCommunication>
}
