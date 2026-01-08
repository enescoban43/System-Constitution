/**
 * Git Operations
 */

import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import { existsSync } from 'fs';
import { join } from 'path';

export interface GitOperations {
  isGitRepo(): Promise<boolean>;
  getCurrentCommit(): Promise<string>;
  getTags(): Promise<string[]>;
  hasUncommittedChanges(): Promise<boolean>;
  add(file: string): Promise<void>;
  commit(message: string): Promise<string>;
  tag(name: string, message?: string): Promise<void>;
  show(ref: string, file: string): Promise<string>;
  checkout(ref: string, options?: { branch?: string }): Promise<void>;
  init(): Promise<void>;
  getTagCommit(tagName: string): Promise<string | null>;
  log(limit?: number): Promise<GitLogEntry[]>;
}

export interface GitLogEntry {
  hash: string;
  date: string;
  message: string;
  author: string;
}

export class GitError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_GIT_REPO' | 'UNCOMMITTED_CHANGES' | 'TAG_EXISTS' | 'GIT_ERROR',
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GitError';
  }
}

export class Git implements GitOperations {
  private git: SimpleGit;
  
  constructor(private cwd: string) {
    const options: Partial<SimpleGitOptions> = {
      baseDir: cwd,
      binary: 'git',
      maxConcurrentProcesses: 6,
    };
    this.git = simpleGit(options);
  }
  
  async isGitRepo(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }
  
  async getCurrentCommit(): Promise<string> {
    const result = await this.git.revparse(['HEAD']);
    return result.trim();
  }
  
  async getTags(): Promise<string[]> {
    const result = await this.git.tags();
    return result.all;
  }
  
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.git.status();
    return !status.isClean();
  }
  
  async add(file: string): Promise<void> {
    await this.git.add(file);
  }
  
  async commit(message: string): Promise<string> {
    const result = await this.git.commit(message);
    return result.commit;
  }
  
  async tag(name: string, message?: string): Promise<void> {
    const tags = await this.getTags();
    if (tags.includes(name)) {
      throw new GitError(
        `Tag ${name} already exists`,
        'TAG_EXISTS'
      );
    }
    
    if (message) {
      await this.git.tag(['-a', name, '-m', message]);
    } else {
      await this.git.tag([name]);
    }
  }
  
  async show(ref: string, file: string): Promise<string> {
    try {
      return await this.git.show([`${ref}:${file}`]);
    } catch (error) {
      throw new GitError(
        `Cannot show ${file} at ${ref}`,
        'GIT_ERROR',
        error
      );
    }
  }
  
  async checkout(ref: string, options?: { branch?: string }): Promise<void> {
    if (options?.branch) {
      await this.git.checkoutBranch(options.branch, ref);
    } else {
      await this.git.checkout(ref);
    }
  }
  
  async init(): Promise<void> {
    await this.git.init();
  }
  
  async getTagCommit(tagName: string): Promise<string | null> {
    try {
      const result = await this.git.revparse([tagName]);
      return result.trim();
    } catch {
      return null;
    }
  }
  
  async log(limit: number = 10): Promise<GitLogEntry[]> {
    const result = await this.git.log({ maxCount: limit });
    return result.all.map(entry => ({
      hash: entry.hash,
      date: entry.date,
      message: entry.message,
      author: entry.author_name,
    }));
  }
}

/**
 * Check if Git is available on the system
 */
export async function isGitAvailable(): Promise<boolean> {
  try {
    const git = simpleGit();
    await git.version();
    return true;
  } catch {
    return false;
  }
}

/**
 * Create Git instance for a directory
 */
export function createGit(cwd: string): Git {
  return new Git(cwd);
}
