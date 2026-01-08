/**
 * Default Configuration Values
 */

import type { EvoSpecConfig, LLMConfig, ProvidersConfig, VersioningConfig } from './schema.js';

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'openrouter',
  models: {
    openrouter: 'anthropic/claude-3.5-sonnet',
    openai: 'gpt-4-turbo',
    anthropic: 'claude-3-5-sonnet-20241022',
    ollama: 'llama3',
  },
  temperature: 0.3,
  maxRetries: 3,
};

export const DEFAULT_PROVIDERS_CONFIG: ProvidersConfig = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
  },
  anthropic: {},
  ollama: {
    baseUrl: 'http://localhost:11434',
  },
};

export const DEFAULT_VERSIONING_CONFIG: VersioningConfig = {
  autoCommit: true,
  autoTag: true,
  tagPrefix: 'v',
};

export const DEFAULT_CONFIG: EvoSpecConfig = {
  llm: DEFAULT_LLM_CONFIG,
  providers: DEFAULT_PROVIDERS_CONFIG,
  versioning: DEFAULT_VERSIONING_CONFIG,
};

export const ENV_KEYS = {
  OPENROUTER_API_KEY: 'OPENROUTER_API_KEY',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
} as const;
