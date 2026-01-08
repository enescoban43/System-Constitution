/**
 * Checkout Command
 * Switch to a specific version
 */

import { Command } from 'commander';
import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { loadConfig, findSpecFile } from '../config/loader.js';
import { createGit, isGitAvailable } from '../versioning/git.js';

export function createCheckoutCommand(): Command {
  const cmd = new Command('checkout')
    .description('Switch to a specific version')
    .argument('<version>', 'Version to checkout (e.g., 1.0.0, v1.0.0)')
    .option('--branch <name>', 'Create new branch for this version')
    .option('--force', 'Discard uncommitted changes')
    .action(async (version: string, options: {
      branch?: string;
      force?: boolean;
    }) => {
      try {
        const config = loadConfig();
        const gitAvailable = await isGitAvailable();
        
        if (!gitAvailable) {
          console.error(chalk.red('Error: Git required for checkout command'));
          process.exit(1);
        }
        
        const git = createGit(process.cwd());
        const isRepo = await git.isGitRepo();
        
        if (!isRepo) {
          console.error(chalk.red('Error: Not a Git repository'));
          process.exit(1);
        }
        
        // Check for uncommitted changes
        const hasChanges = await git.hasUncommittedChanges();
        if (hasChanges && !options.force) {
          console.error(chalk.red('Error: Uncommitted changes in working directory'));
          console.error(chalk.gray('Use --force to discard changes, or commit/stash first'));
          process.exit(1);
        }
        
        // Normalize version
        const normalizedVersion = version.replace(/^v/, '');
        const tagName = `${config.versioning.tagPrefix}${normalizedVersion}`;
        
        // Check if tag exists
        const tags = await git.getTags();
        if (!tags.includes(tagName)) {
          console.error(chalk.red(`Error: Tag ${tagName} not found`));
          console.error(chalk.gray('Available tags:'));
          const versionTags = tags.filter(t => t.startsWith(config.versioning.tagPrefix));
          for (const tag of versionTags.slice(0, 10)) {
            console.error(chalk.gray(`  ${tag}`));
          }
          process.exit(1);
        }
        
        // Checkout
        try {
          await git.checkout(tagName, { branch: options.branch });
          
          if (options.branch) {
            console.log(chalk.green(`✓ Created branch '${options.branch}' at ${tagName}`));
          } else {
            console.log(chalk.green(`✓ Checked out ${tagName}`));
            console.log(chalk.yellow('Note: You are in detached HEAD state'));
            console.log(chalk.gray('To make changes, create a branch: git checkout -b <branch-name>'));
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Checkout failed'}`));
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return cmd;
}
