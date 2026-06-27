import type { IModelProvider } from './types'
import { ClaudeProvider } from './claude'
import { OllamaProvider } from './ollama'

export function getProvider(): IModelProvider {
  const providerEnv = process.env.NEXT_PUBLIC_MODEL_PROVIDER ?? 'claude'
  if (providerEnv === 'ollama') {
    return new OllamaProvider()
  }
  return new ClaudeProvider()
}

export type { IModelProvider }
