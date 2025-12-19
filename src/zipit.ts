import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, relative, resolve, isAbsolute } from 'path';
import { glob } from 'glob';
import archiver from 'archiver';
import { FileFilter } from './filters';

export interface ZipOptions {
  outputPath?: string;
  rootDir?: string;
  customExcludes?: string[];
  customIncludes?: string[];
}

/**
 * Create a zip archive of project code
 */
export async function createZip(options: ZipOptions = {}): Promise<string> {
  const rootDir = resolve(options.rootDir || process.cwd());
  const outputPath = options.outputPath || join(rootDir, 'project-code.zip');

  // Ensure output directory exists
  const outputDir = resolve(outputPath, '..');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Initialize file filter
  const filter = new FileFilter({
    customExcludes: options.customExcludes,
    customIncludes: options.customIncludes,
  });

  // Load .gitignore files
  filter.loadGitignore(rootDir);

  return new Promise(async (promiseResolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on('close', () => {
      console.log(`✓ Zip archive created: ${outputPath}`);
      console.log(`  Total size: ${archive.pointer()} bytes`);
      promiseResolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    try {
      // Find all files in the project
      let files = await glob('**/*', {
        cwd: rootDir,
        dot: false, // Don't include dotfiles by default (except those we explicitly want)
        ignore: ['node_modules/**', '.git/**'], // Quick filter for common exclusions
        absolute: false,
      });

      // Normalize all paths to be relative to rootDir
      // This handles edge cases where glob might return absolute paths despite absolute: false
      files = files.map((file) => {
        // Check if file is an absolute path (glob should return relative, but handle edge cases)
        let absolutePath: string;
        if (isAbsolute(file)) {
          // If absolute, use it directly (but verify it's within rootDir)
          absolutePath = file;
        } else {
          // If relative, resolve it relative to rootDir
          absolutePath = resolve(rootDir, file);
        }
        
        // Convert to relative path from rootDir
        const relPath = relative(rootDir, absolutePath);
        
        // Normalize path separators to forward slashes
        return relPath.split(/[/\\]/).join('/');
      }).filter((file) => {
        // Filter out paths that are outside rootDir (safety check)
        // relative() returns paths starting with '../' if outside rootDir
        return file && !file.startsWith('../') && !file.startsWith('..\\') && file !== '..';
      });

      // Also include dotfiles that are typically code files
      const dotFilePatterns = [
        '.gitignore',
        '.gitattributes',
        '.eslintrc*',
        '.prettierrc*',
        '.babelrc*',
        '.env.example',
        '.env.template',
        '.dockerignore',
        '.editorconfig',
        '.nvmrc',
        '.node-version',
      ];

      // Collect all dotfile matches
      const dotFilePromises = dotFilePatterns.map((pattern) =>
        glob(pattern, { cwd: rootDir, absolute: false }).catch(() => [])
      );
      const dotFileResults = await Promise.all(dotFilePromises);
      const dotFiles = dotFileResults.flat();

      // Normalize dotfile paths as well
      const normalizedDotFiles = dotFiles.map((file) => {
        // Handle both absolute and relative paths from glob
        const absolutePath = isAbsolute(file) ? file : resolve(rootDir, file);
        const relPath = relative(rootDir, absolutePath);
        return relPath.split(/[/\\]/).join('/');
      }).filter((file) => {
        // Filter out paths that are outside rootDir
        return file && !file.startsWith('../') && !file.startsWith('..\\') && file !== '..';
      });

      // Add dotfiles that aren't already in the files list
      normalizedDotFiles.forEach((file) => {
        if (!files.includes(file)) {
          files.push(file);
        }
      });

      let addedCount = 0;
      let excludedCount = 0;

      // Get relative output path for exclusion
      const outputRelativePath = relative(rootDir, outputPath);

      files.forEach((file) => {
        // Ensure file is always relative at this point
        const normalizedFile = file.split(/[/\\]/).join('/');
        const fullPath = join(rootDir, normalizedFile);
        const relativePath = normalizedFile;

        // Skip the output file itself
        if (relativePath === outputRelativePath || fullPath === outputPath) {
          excludedCount++;
          return;
        }

        // Check if file should be included
        if (filter.shouldInclude(fullPath, rootDir)) {
          // Check if it's actually a file (not a directory)
          try {
            const fs = require('fs');
            const stats = fs.statSync(fullPath);
            if (stats.isFile()) {
              archive.file(fullPath, { name: relativePath });
              addedCount++;
            }
          } catch (error) {
            // Skip files that can't be read
          }
        } else {
          excludedCount++;
        }
      });

      // Finalize the archive
      archive.finalize();

      console.log(`  Files added: ${addedCount}`);
      console.log(`  Files excluded: ${excludedCount}`);
    } catch (err) {
      reject(err);
    }
  });
}

