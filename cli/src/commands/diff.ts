/**
 * Diff Command
 * Compare two versions
 */

import { Command } from 'commander';
import { existsSync, readFileSync } from 'fs';
import { resolve, basename } from 'path';
import chalk from 'chalk';
import { loadConfig, findSpecFile } from '../config/loader.js';
import { createGit, isGitAvailable } from '../versioning/git.js';
import { getHistory, getSpecAtVersion } from '../versioning/history.js';
import { getCurrentVersion } from '../versioning/bump.js';

export function createDiffCommand(): Command {
  const cmd = new Command('diff')
    .description('Compare two versions')
    .argument('<version1>', 'First version (e.g., 1.0.0, v1.0.0, HEAD~1)')
    .argument('[version2]', 'Second version (default: current)')
    .option('--format <fmt>', 'Output format: text|json|yaml', 'text')
    .option('--changes-only', 'Show only changes[], not full diff')
    .option('-f, --file <file>', 'Spec file path')
    .action(async (version1: string, version2: string | undefined, options: {
      format: string;
      changesOnly?: boolean;
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
        const gitAvailable = await isGitAvailable();
        
        if (!gitAvailable) {
          console.error(chalk.red('Error: Git required for diff command'));
          process.exit(1);
        }
        
        const git = createGit(process.cwd());
        const isRepo = await git.isGitRepo();
        
        if (!isRepo) {
          console.error(chalk.red('Error: Not a Git repository'));
          process.exit(1);
        }
        
        // Normalize version strings
        const normalizeVersion = (v: string) => v.replace(/^v/, '');
        const v1 = normalizeVersion(version1);
        const v2 = version2 ? normalizeVersion(version2) : getCurrentVersion(specFile) || '';
        
        // Get spec content at versions
        const specFileName = basename(specFile);
        
        let content1: string | null;
        let content2: string | null;
        
        // Check if version1 is a Git ref (like HEAD~1)
        if (version1.startsWith('HEAD') || version1.includes('~') || version1.includes('^')) {
          try {
            content1 = await git.show(version1, specFileName);
          } catch {
            console.error(chalk.red(`Error: Cannot find spec at ${version1}`));
            process.exit(1);
          }
        } else {
          content1 = await getSpecAtVersion(specFile, v1, git, config.versioning.tagPrefix);
        }
        
        if (!version2) {
          content2 = readFileSync(specFile, 'utf-8');
        } else if (version2.startsWith('HEAD') || version2.includes('~') || version2.includes('^')) {
          try {
            content2 = await git.show(version2, specFileName);
          } catch {
            console.error(chalk.red(`Error: Cannot find spec at ${version2}`));
            process.exit(1);
          }
        } else {
          content2 = await getSpecAtVersion(specFile, v2, git, config.versioning.tagPrefix);
        }
        
        if (!content1) {
          console.error(chalk.red(`Error: Cannot find spec at version ${v1}`));
          process.exit(1);
        }
        
        if (!content2) {
          console.error(chalk.red(`Error: Cannot find spec at version ${v2}`));
          process.exit(1);
        }
        
        // Show changes only
        if (options.changesOnly) {
          const history = getHistory(specFile);
          const relevantChanges = history
            .filter(h => {
              const hv = h.version.split('.').map(Number);
              const v1Parts = v1.split('.').map(Number);
              const v2Parts = v2.split('.').map(Number);
              
              // Check if version is between v1 and v2
              const isAfterV1 = hv[0] > v1Parts[0] ||
                (hv[0] === v1Parts[0] && hv[1] > v1Parts[1]) ||
                (hv[0] === v1Parts[0] && hv[1] === v1Parts[1] && hv[2] > v1Parts[2]);
              
              const isBeforeOrEqualV2 = hv[0] < v2Parts[0] ||
                (hv[0] === v2Parts[0] && hv[1] < v2Parts[1]) ||
                (hv[0] === v2Parts[0] && hv[1] === v2Parts[1] && hv[2] <= v2Parts[2]);
              
              return isAfterV1 && isBeforeOrEqualV2;
            })
            .flatMap(h => h.changes.map(c => ({ version: h.version, ...c })));
          
          if (options.format === 'json') {
            console.log(JSON.stringify(relevantChanges, null, 2));
          } else {
            console.log();
            console.log(chalk.bold(`Changes from v${v1} to v${v2}`));
            console.log(chalk.gray('='.repeat(30)));
            console.log();
            
            if (relevantChanges.length === 0) {
              console.log(chalk.gray('No changes recorded'));
            } else {
              for (const change of relevantChanges) {
                let changeStr = `[v${change.version}] ${change.op}: ${change.target}`;
                if (change.field) changeStr += `.${change.field}`;
                if (change.type) changeStr += ` (${change.type})`;
                console.log(changeStr);
              }
            }
          }
          return;
        }
        
        // Full diff
        console.log();
        console.log(chalk.bold(`Diff: v${v1} → v${v2}`));
        console.log(chalk.gray('='.repeat(30)));
        console.log();
        
        // Simple line-by-line diff
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');
        
        const maxLines = Math.max(lines1.length, lines2.length);
        let hasDiff = false;
        
        for (let i = 0; i < maxLines; i++) {
          const line1 = lines1[i] || '';
          const line2 = lines2[i] || '';
          
          if (line1 !== line2) {
            hasDiff = true;
            if (line1 && !line2) {
              console.log(chalk.red(`- ${line1}`));
            } else if (!line1 && line2) {
              console.log(chalk.green(`+ ${line2}`));
            } else {
              console.log(chalk.red(`- ${line1}`));
              console.log(chalk.green(`+ ${line2}`));
            }
          }
        }
        
        if (!hasDiff) {
          console.log(chalk.gray('No differences found'));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return cmd;
}
