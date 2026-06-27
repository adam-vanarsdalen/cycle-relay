import type { IModelProvider } from './types'
import type { ModelProvider } from '@/lib/types'
import { ClaudeProvider } from './claude'
import { OllamaProvider } from './ollama'

export function getProvider(provider: ModelProvider): IModelProvider {
  if (provider === 'ollama') return new OllamaProvider()
  return new ClaudeProvider()
}

export type { IModelProvider }
