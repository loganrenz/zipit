#!/usr/bin/env node

import { Command } from 'commander';
import { createZip } from './zipit';
import { createTxt } from './txtit';
import { resolve } from 'path';

const program = new Command();

program
  .name('zipit')
  .description('Create zip archives and text dumps of project code with smart exclusions')
  .version('1.0.0');

program
  .command('zip')
  .description('Create a zip archive of project code')
  .option('-o, --output <path>', 'Output file path (default: project-code.zip)')
  .option('-r, --root <dir>', 'Root directory (default: current directory)')
  .option('-e, --exclude <pattern>', 'Additional exclusion patterns (can be used multiple times)', (value, prev: string[] = []) => {
    prev.push(value);
    return prev;
  })
  .option('-i, --include <pattern>', 'Additional inclusion patterns (can be used multiple times)', (value, prev: string[] = []) => {
    prev.push(value);
    return prev;
  })
  .action(async (options) => {
    try {
      const rootDir = options.root ? resolve(options.root) : process.cwd();
      await createZip({
        outputPath: options.output,
        rootDir,
        customExcludes: options.exclude,
        customIncludes: options.include,
      });
    } catch (error) {
      console.error('Error creating zip:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('txt')
  .description('Create a text file with project structure and code')
  .option('-o, --output <path>', 'Output file path (default: project-code.txt)')
  .option('-r, --root <dir>', 'Root directory (default: current directory)')
  .option('-e, --exclude <pattern>', 'Additional exclusion patterns (can be used multiple times)', (value, prev: string[] = []) => {
    prev.push(value);
    return prev;
  })
  .option('-i, --include <pattern>', 'Additional inclusion patterns (can be used multiple times)', (value, prev: string[] = []) => {
    prev.push(value);
    return prev;
  })
  .action(async (options) => {
    try {
      const rootDir = options.root ? resolve(options.root) : process.cwd();
      await createTxt({
        outputPath: options.output,
        rootDir,
        customExcludes: options.exclude,
        customIncludes: options.include,
      });
    } catch (error) {
      console.error('Error creating text file:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

