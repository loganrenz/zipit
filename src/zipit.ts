import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, relative, resolve } from 'path';
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

  return new Promise(async (resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on('close', () => {
      console.log(`✓ Zip archive created: ${outputPath}`);
      console.log(`  Total size: ${archive.pointer()} bytes`);
      resolve(outputPath);
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

      // Add dotfiles that aren't already in the files list
      dotFiles.forEach((file) => {
        if (!files.includes(file)) {
          files.push(file);
        }
      });

      let addedCount = 0;
      let excludedCount = 0;

      files.forEach((file) => {
        const fullPath = join(rootDir, file);
        const relativePath = relative(rootDir, fullPath);

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

