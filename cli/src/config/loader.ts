/**
 * Configuration Loader
 * Loads config from global (~/.evospec/config.yaml) and local (.evospec/config.yaml)
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { parse as parseYaml } from 'yaml';
import type { EvoSpecConfig, ProjectLocalConfig, LLMProviderName } from './schema.js';
import { DEFAULT_CONFIG, ENV_KEYS } from './defaults.js';

const GLOBAL_CONFIG_DIR = join(homedir(), '.evospec');
const GLOBAL_CONFIG_FILE = join(GLOBAL_CONFIG_DIR, 'config.yaml');
const LOCAL_CONFIG_DIR = '.evospec';
const LOCAL_CONFIG_FILE = 'config.yaml';

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];
    
    if (
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }
  
  return result;
}

function loadYamlFile<T>(filePath: string): T | null {
  if (!existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    return parseYaml(content) as T;
  } catch {
    return null;
  }
}

export function loadGlobalConfig(): Partial<EvoSpecConfig> {
  return loadYamlFile<Partial<EvoSpecConfig>>(GLOBAL_CONFIG_FILE) || {};
}

export function loadLocalConfig(cwd: string = process.cwd()): ProjectLocalConfig | null {
  const localConfigPath = join(cwd, LOCAL_CONFIG_DIR, LOCAL_CONFIG_FILE);
  return loadYamlFile<ProjectLocalConfig>(localConfigPath);
}

export function loadConfig(cwd: string = process.cwd()): EvoSpecConfig {
  // Start with defaults
  let config = { ...DEFAULT_CONFIG };
  
  // Merge global config
  const globalConfig = loadGlobalConfig();
  config = deepMerge(config, globalConfig);
  
  // Merge local config
  const localConfig = loadLocalConfig(cwd);
  if (localConfig) {
    if (localConfig.project) {
      config.project = localConfig.project;
    }
    if (localConfig.llm) {
      config.llm = deepMerge(config.llm, localConfig.llm);
    }
    if (localConfig.versioning) {
      config.versioning = deepMerge(config.versioning, localConfig.versioning);
    }
  }
  
  // Apply environment variables for API keys
  if (process.env[ENV_KEYS.OPENROUTER_API_KEY]) {
    config.providers.openrouter.apiKey = process.env[ENV_KEYS.OPENROUTER_API_KEY];
  }
  if (process.env[ENV_KEYS.OPENAI_API_KEY]) {
    config.providers.openai.apiKey = process.env[ENV_KEYS.OPENAI_API_KEY];
  }
  if (process.env[ENV_KEYS.ANTHROPIC_API_KEY]) {
    config.providers.anthropic.apiKey = process.env[ENV_KEYS.ANTHROPIC_API_KEY];
  }
  
  return config;
}

export function getApiKey(provider: LLMProviderName, config: EvoSpecConfig): string | undefined {
  switch (provider) {
    case 'openrouter':
      return config.providers.openrouter.apiKey || process.env[ENV_KEYS.OPENROUTER_API_KEY];
    case 'openai':
      return config.providers.openai.apiKey || process.env[ENV_KEYS.OPENAI_API_KEY];
    case 'anthropic':
      return config.providers.anthropic.apiKey || process.env[ENV_KEYS.ANTHROPIC_API_KEY];
    case 'ollama':
      return undefined; // Ollama doesn't need API key
  }
}

export function getModel(provider: LLMProviderName, config: EvoSpecConfig): string {
  return config.llm.models[provider];
}

export function getBaseUrl(provider: LLMProviderName, config: EvoSpecConfig): string | undefined {
  return config.providers[provider].baseUrl;
}

export function getGlobalConfigDir(): string {
  return GLOBAL_CONFIG_DIR;
}

export function getGlobalConfigFile(): string {
  return GLOBAL_CONFIG_FILE;
}

export function findProjectRoot(startDir: string = process.cwd()): string | null {
  let currentDir = resolve(startDir);
  const root = resolve('/');
  
  while (currentDir !== root) {
    const evospecDir = join(currentDir, LOCAL_CONFIG_DIR);
    if (existsSync(evospecDir)) {
      return currentDir;
    }
    currentDir = resolve(currentDir, '..');
  }
  
  return null;
}

export function findSpecFile(cwd: string = process.cwd()): string | null {
  const config = loadLocalConfig(cwd);
  if (config?.project?.specFile) {
    const specPath = join(cwd, config.project.specFile);
    if (existsSync(specPath)) {
      return specPath;
    }
  }
  
  // Fallback: look for *.evospec.yaml in cwd
  const { readdirSync } = require('fs');
  try {
    const files = readdirSync(cwd) as string[];
    const specFile = files.find((f: string) => f.endsWith('.evospec.yaml'));
    if (specFile) {
      return join(cwd, specFile);
    }
  } catch {
    // Ignore
  }
  
  return null;
}
