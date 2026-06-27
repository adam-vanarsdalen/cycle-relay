import Anthropic from '@anthropic-ai/sdk'
import type { IModelProvider } from './types'
import type { CycleStage, GeneratedCommunication, PatientContext } from '@/lib/types'

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()
}

export class ClaudeProvider implements IModelProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateCommunication(
    stage: CycleStage,
    context: PatientContext,
    systemPrompt: string,
    userPrompt: string
  ): Promise<GeneratedCommunication> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText =
      message.content[0].type === 'text' ? message.content[0].text : ''
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
      provider: 'claude',
    }
  }
}
