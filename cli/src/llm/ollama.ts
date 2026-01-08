/**
 * Ollama LLM Provider (Local)
 */

import type { LLMProvider, GenerateRequest, GenerateResponse } from './provider.js';
import { LLMProviderError } from './provider.js';

export interface OllamaConfig {
  model: string;
  baseUrl?: string;
}

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaProvider implements LLMProvider {
  readonly name = 'ollama';
  private baseUrl: string;
  private model: string;
  
  constructor(private config: OllamaConfig) {
    this.model = config.model;
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }
  
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `${request.systemPrompt}\n\n${request.userPrompt}`,
          stream: false,
          options: {
            temperature: request.temperature ?? 0.3,
            num_predict: request.maxTokens ?? 8192,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as OllamaGenerateResponse;
      
      return {
        content: data.response,
        usage: data.prompt_eval_count && data.eval_count ? {
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
        } : undefined,
      };
    } catch (error) {
      throw new LLMProviderError(
        `Ollama generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_FAILED',
        this.name,
        error
      );
    }
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
