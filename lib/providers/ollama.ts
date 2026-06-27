import type { IModelProvider } from './types'
import type { CycleStage, GeneratedCommunication, PatientContext } from '@/lib/types'

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()
}

export class OllamaProvider implements IModelProvider {
  private baseUrl: string
  private model: string

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_OLLAMA_BASE_URL ?? 'http://localhost:11434'
    this.model = process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? 'llama3'
  }

  async generateCommunication(
    stage: CycleStage,
    context: PatientContext,
    systemPrompt: string,
    userPrompt: string
  ): Promise<GeneratedCommunication> {
    let response: Response
    try {
      response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          system: systemPrompt,
          prompt: userPrompt,
          stream: false,
          format: 'json',
        }),
      })
    } catch {
      throw new Error(
        'Ollama connection failed. Ensure Ollama is running locally. See README for setup.'
      )
    }

    if (!response.ok) {
      throw new Error(
        'Ollama connection failed. Ensure Ollama is running locally. See README for setup.'
      )
    }

    const data = await response.json()
    const rawText: string = data.response ?? ''
    const cleaned = stripMarkdownFences(rawText)
    const parsed = JSON.parse(cleaned)

    return {
      patientMessage: parsed.patientMessage ?? '',
      coordinatorSummary: parsed.coordinatorSummary ?? '',
      clinicalFlags: Array.isArray(parsed.clinicalFlags)
        ? parsed.clinicalFlags
        : [],
      stage,
      timestamp: new Date().toISOString(),
      provider: 'ollama',
    }
  }
}
