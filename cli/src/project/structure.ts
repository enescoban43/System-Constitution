/**
 * Project Structure Creation
 */

import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  generateProjectConfig,
  generateGitignore,
  generateReadme,
  generateMinimalSpecTemplate,
} from './templates.js';

export interface ProjectStructure {
  projectDir: string;
  sysconstDir: string;
  cacheDir: string;
  configFile: string;
  specFile: string;
  gitignoreFile: string;
  readmeFile: string;
}

export interface CreateStructureOptions {
  projectName: string;
  targetDir: string;
  specContent?: string;
  description?: string;
  provider?: string;
  model?: string;
  createReadme?: boolean;
}

export interface CreateStructureResult {
  success: boolean;
  structure: ProjectStructure;
  errors: string[];
  warnings: string[];
}

/**
 * Get project structure paths
 */
export function getProjectStructure(targetDir: string, projectName: string): ProjectStructure {
  const specFileName = `${projectName}.sysconst.yaml`;
  
  return {
    projectDir: targetDir,
    sysconstDir: join(targetDir, '.sysconst'),
    cacheDir: join(targetDir, '.sysconst', 'cache'),
    configFile: join(targetDir, '.sysconst', 'config.yaml'),
    specFile: join(targetDir, specFileName),
    gitignoreFile: join(targetDir, '.gitignore'),
    readmeFile: join(targetDir, 'README.md'),
  };
}

/**
 * Check if directory is empty or doesn't exist
 */
export function isDirectoryEmpty(dir: string): boolean {
  if (!existsSync(dir)) {
    return true;
  }
  
  const files = readdirSync(dir);
  return files.length === 0;
}

/**
 * Check if project already exists
 */
export function projectExists(targetDir: string): {
  exists: boolean;
  reason?: 'sysconst_dir' | 'spec_file';
} {
  const sysconstDir = join(targetDir, '.sysconst');
  if (existsSync(sysconstDir)) {
    return { exists: true, reason: 'sysconst_dir' };
  }
  
  // Check for any .sysconst.yaml file
  if (existsSync(targetDir)) {
    try {
      const files = readdirSync(targetDir);
      const specFile = files.find(f => f.endsWith('.sysconst.yaml'));
      if (specFile) {
        return { exists: true, reason: 'spec_file' };
      }
    } catch {
      // Ignore
    }
  }
  
  return { exists: false };
}

/**
 * Create project directory structure
 */
export function createProjectStructure(options: CreateStructureOptions): CreateStructureResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const structure = getProjectStructure(options.targetDir, options.projectName);
  const specFileName = `${options.projectName}.sysconst.yaml`;
  
  try {
    // Create project directory if it doesn't exist
    if (!existsSync(structure.projectDir)) {
      mkdirSync(structure.projectDir, { recursive: true });
    }
    
    // Create .sysconst directory
    if (!existsSync(structure.sysconstDir)) {
      mkdirSync(structure.sysconstDir, { recursive: true });
    }
    
    // Create cache directory
    if (!existsSync(structure.cacheDir)) {
      mkdirSync(structure.cacheDir, { recursive: true });
    }
    
    // Create .gitkeep in cache
    writeFileSync(join(structure.cacheDir, '.gitkeep'), '', 'utf-8');
    
    // Create config.yaml
    const configContent = generateProjectConfig(
      options.projectName,
      specFileName,
      options.provider,
      options.model
    );
    writeFileSync(structure.configFile, configContent, 'utf-8');
    
    // Create .gitignore (merge with existing if present)
    const gitignoreContent = generateGitignore();
    if (existsSync(structure.gitignoreFile)) {
      warnings.push('.gitignore already exists, skipping');
    } else {
      writeFileSync(structure.gitignoreFile, gitignoreContent, 'utf-8');
    }
    
    // Create spec file
    const specContent = options.specContent || generateMinimalSpecTemplate(options.projectName);
    writeFileSync(structure.specFile, specContent, 'utf-8');
    
    // Create README.md
    if (options.createReadme !== false) {
      if (existsSync(structure.readmeFile)) {
        warnings.push('README.md already exists, skipping');
      } else {
        const readmeContent = generateReadme(
          options.projectName,
          specFileName,
          options.description
        );
        writeFileSync(structure.readmeFile, readmeContent, 'utf-8');
      }
    }
    
    return {
      success: true,
      structure,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return {
      success: false,
      structure,
      errors,
      warnings,
    };
  }
}
