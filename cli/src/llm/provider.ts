/**
 * LLM Provider Interface
 */

export interface GenerateRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface LLMProvider {
  readonly name: string;
  
  /**
   * Generate completion from prompt
   */
  generate(request: GenerateRequest): Promise<GenerateResponse>;
  
  /**
   * Check if provider is configured and available
   */
  isAvailable(): Promise<boolean>;
}

export class LLMProviderError extends Error {
  constructor(
    message: string,
    public readonly code: 'PROVIDER_NOT_CONFIGURED' | 'PROVIDER_UNAVAILABLE' | 'GENERATION_FAILED',
    public readonly provider: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'LLMProviderError';
  }
}
