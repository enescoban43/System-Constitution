/**
 * OpenAI LLM Provider
 */

import OpenAI from 'openai';
import type { LLMProvider, GenerateRequest, GenerateResponse } from './provider.js';
import { LLMProviderError } from './provider.js';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private client: OpenAI;
  private model: string;
  
  constructor(private config: OpenAIConfig) {
    this.model = config.model;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }
  
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 8192,
      });
      
      const content = response.choices[0]?.message?.content || '';
      
      return {
        content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
        } : undefined,
      };
    } catch (error) {
      throw new LLMProviderError(
        `OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_FAILED',
        this.name,
        error
      );
    }
  }
  
  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }
    
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
