/**
 * History Command
 * Show version history
 */

import { Command } from 'commander';
import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { loadConfig, findSpecFile } from '../config/loader.js';
import { createGit, isGitAvailable } from '../versioning/git.js';
import { getHistory, getHistoryWithGit, type HistoryEntryWithGit } from '../versioning/history.js';
import { getCurrentVersion } from '../versioning/bump.js';

export function createHistoryCommand(): Command {
  const cmd = new Command('history')
    .description('Show version history')
    .option('-n, --limit <n>', 'Number of versions to show', '10')
    .option('--git', 'Include Git commit info')
    .option('--changes', 'Show change details')
    .option('--json', 'Output as JSON')
    .option('-f, --file <file>', 'Spec file path')
    .action(async (options: {
      limit: string;
      git?: boolean;
      changes?: boolean;
      json?: boolean;
      file?: string;
    }) => {
      try {
        // Find spec file
        const specFile = options.file ? resolve(options.file) : findSpecFile();
        
        if (!specFile || !existsSync(specFile)) {
          console.error(chalk.red('Error: No spec file found'));
          process.exit(1);
        }
        
        const config = loadConfig();
        const limit = parseInt(options.limit, 10);
        const currentVersion = getCurrentVersion(specFile);
        
        let history: HistoryEntryWithGit[];
        
        if (options.git) {
          const gitAvailable = await isGitAvailable();
          const git = gitAvailable ? createGit(process.cwd()) : null;
          history = await getHistoryWithGit(specFile, git, config.versioning.tagPrefix);
        } else {
          history = getHistory(specFile);
        }
        
        // Sort by version descending (newest first)
        history = history.sort((a, b) => {
          const [aMajor, aMinor, aPatch] = a.version.split('.').map(Number);
          const [bMajor, bMinor, bPatch] = b.version.split('.').map(Number);
          if (bMajor !== aMajor) return bMajor - aMajor;
          if (bMinor !== aMinor) return bMinor - aMinor;
          return bPatch - aPatch;
        });
        
        // Limit
        history = history.slice(0, limit);
        
        // JSON output
        if (options.json) {
          console.log(JSON.stringify(history, null, 2));
          return;
        }
        
        // Text output
        console.log();
        console.log(chalk.bold('Version History'));
        console.log(chalk.gray('==============='));
        console.log();
        
        for (const entry of history) {
          const isCurrent = entry.version === currentVersion;
          const versionStr = `v${entry.version}${isCurrent ? chalk.cyan(' (current)') : ''}`;
          
          console.log(chalk.bold(versionStr));
          
          if (entry.basedOn) {
            console.log(chalk.gray(`  Based on: v${entry.basedOn}`));
          }
          
          if (entry.notes) {
            console.log(chalk.gray(`  Notes: ${entry.notes}`));
          }
          
          if (options.git && entry.git) {
            console.log(chalk.gray(`  Git: ${entry.git.hash} - ${entry.git.message}`));
            console.log(chalk.gray(`  Date: ${entry.git.date}`));
          }
          
          if (options.changes && entry.changes && entry.changes.length > 0) {
            console.log(chalk.gray('  Changes:'));
            for (const change of entry.changes) {
              let changeStr = `    - ${change.op}: ${change.target}`;
              if (change.field) changeStr += `.${change.field}`;
              if (change.type) changeStr += ` (${change.type})`;
              console.log(chalk.gray(changeStr));
            }
          }
          
          console.log();
        }
        
        if (history.length === 0) {
          console.log(chalk.gray('No history entries found'));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return cmd;
}
