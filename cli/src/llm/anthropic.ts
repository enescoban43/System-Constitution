/**
 * Anthropic LLM Provider
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, GenerateRequest, GenerateResponse } from './provider.js';
import { LLMProviderError } from './provider.js';

export interface AnthropicConfig {
  apiKey: string;
  model: string;
}

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  private client: Anthropic;
  private model: string;
  
  constructor(private config: AnthropicConfig) {
    this.model = config.model;
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }
  
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: request.maxTokens ?? 8192,
        system: request.systemPrompt,
        messages: [
          { role: 'user', content: request.userPrompt },
        ],
        temperature: request.temperature ?? 0.3,
      });
      
      const textBlock = response.content.find(block => block.type === 'text');
      const content = textBlock && textBlock.type === 'text' ? textBlock.text : '';
      
      return {
        content,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      throw new LLMProviderError(
        `Anthropic generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      // Simple check - try a minimal request
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
