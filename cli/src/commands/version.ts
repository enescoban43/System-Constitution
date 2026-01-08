/**
 * Version Command
 * Manage specification versions
 */

import { Command } from 'commander';
import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { loadConfig, findSpecFile } from '../config/loader.js';
import { createGit, isGitAvailable } from '../versioning/git.js';
import { bumpVersion, getCurrentVersion, parseChangeEntry, type BumpType } from '../versioning/bump.js';
import { checkVersionConsistency } from '../versioning/history.js';

export function createVersionCommand(): Command {
  const cmd = new Command('version')
    .description('Show or manage specification version')
    .argument('[command]', 'Subcommand: bump, check, tag')
    .argument('[type]', 'For bump: major|minor|patch')
    .option('-m, --message <msg>', 'Commit message (for bump)')
    .option('-c, --change <spec>', 'Add change entry (format: op:target:field:type)')
    .option('--no-commit', "Update spec but don't commit")
    .option('--no-tag', "Don't create Git tag")
    .option('--dry-run', 'Show what would happen')
    .option('-f, --file <file>', 'Spec file path')
    .action(async (subcommand: string | undefined, bumpType: string | undefined, options: {
      message?: string;
      change?: string;
      commit: boolean;
      tag: boolean;
      dryRun?: boolean;
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
        const git = gitAvailable ? createGit(process.cwd()) : null;
        
        // No subcommand - show current version
        if (!subcommand) {
          const version = getCurrentVersion(specFile);
          if (version) {
            console.log(version);
          } else {
            console.error(chalk.red('Cannot read version from spec'));
            process.exit(1);
          }
          return;
        }
        
        // Handle subcommands
        switch (subcommand) {
          case 'bump': {
            if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
              console.error(chalk.red('Error: Specify bump type: major, minor, or patch'));
              process.exit(1);
            }
            
            if (!options.message) {
              console.error(chalk.red('Error: Message required for bump (-m "message")'));
              process.exit(1);
            }
            
            const changes = options.change
              ? [parseChangeEntry(options.change)]
              : [];
            
            const result = await bumpVersion(git, {
              specFile,
              type: bumpType as BumpType,
              message: options.message,
              changes,
              noCommit: !options.commit,
              noTag: !options.tag,
              dryRun: options.dryRun,
            });
            
            if (result.success) {
              if (options.dryRun) {
                console.log(chalk.yellow('Dry run - no changes made'));
              }
              console.log(chalk.green(`✓ Version bumped: ${result.previousVersion} → ${result.newVersion}`));
              if (result.commitHash) {
                console.log(chalk.gray(`  Commit: ${result.commitHash.substring(0, 7)}`));
              }
              if (result.tagName) {
                console.log(chalk.gray(`  Tag: ${result.tagName}`));
              }
            } else {
              console.error(chalk.red('Version bump failed:'));
              for (const error of result.errors || []) {
                console.error(chalk.red(`  • ${error}`));
              }
              process.exit(1);
            }
            break;
          }
          
          case 'check': {
            const result = await checkVersionConsistency(
              specFile,
              git,
              config.versioning.tagPrefix
            );
            
            console.log();
            console.log(chalk.bold('Version Consistency Check'));
            console.log(chalk.gray('========================='));
            console.log();
            
            for (const check of result.checks) {
              const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
              console.log(`${icon} ${check.name}: ${check.message}`);
              if (check.suggestion) {
                console.log(chalk.cyan(`  Run: ${check.suggestion}`));
              }
            }
            
            console.log();
            if (result.ok) {
              console.log(chalk.green('All checks passed!'));
            } else {
              const failed = result.checks.filter(c => !c.passed).length;
              console.log(chalk.red(`${failed} check(s) failed`));
              process.exit(1);
            }
            break;
          }
          
          case 'tag': {
            if (!git) {
              console.error(chalk.red('Error: Git not available'));
              process.exit(1);
            }
            
            const version = getCurrentVersion(specFile);
            if (!version) {
              console.error(chalk.red('Cannot read version from spec'));
              process.exit(1);
            }
            
            const tagName = `${config.versioning.tagPrefix}${version}`;
            
            try {
              await git.tag(tagName, `Version ${version}`);
              console.log(chalk.green(`✓ Created tag: ${tagName}`));
            } catch (error) {
              console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Failed to create tag'}`));
              process.exit(1);
            }
            break;
          }
          
          default:
            console.error(chalk.red(`Unknown subcommand: ${subcommand}`));
            console.error(chalk.gray('Available: bump, check, tag'));
            process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return cmd;
}
