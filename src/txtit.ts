import { readdirSync, statSync, existsSync } from 'fs';
import { join, relative, resolve, sep } from 'path';
import { glob } from 'glob';
import { createWriteStream } from 'fs';
import { FileFilter } from './filters';
import { getFileInfo, readFileContent, formatFileSize } from './utils';

export interface TxtOptions {
  outputPath?: string;
  rootDir?: string;
  customExcludes?: string[];
  customIncludes?: string[];
}

/**
 * Generate directory tree structure
 */
function generateTree(
  dirPath: string,
  rootDir: string,
  prefix: string = '',
  isLast: boolean = true,
  filter: FileFilter,
  maxDepth: number = 10,
  currentDepth: number = 0
): string {
  if (currentDepth >= maxDepth) {
    return '';
  }

  try {
    const entries = readdirSync(dirPath)
      .filter((entry) => {
        const fullPath = join(dirPath, entry);
        return filter.shouldInclude(fullPath, rootDir);
      })
      .sort((a, b) => {
        const aPath = join(dirPath, a);
        const bPath = join(dirPath, b);
        const aIsDir = statSync(aPath).isDirectory();
        const bIsDir = statSync(bPath).isDirectory();

        // Directories first
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

    if (entries.length === 0) {
      return '';
    }

    let tree = '';
    entries.forEach((entry, index) => {
      const fullPath = join(dirPath, entry);
      const isLastEntry = index === entries.length - 1;
      const stats = statSync(fullPath);
      const relativePath = relative(rootDir, fullPath);

      const connector = isLastEntry ? '└── ' : '├── ';
      tree += prefix + connector + entry + '\n';

      if (stats.isDirectory()) {
        const extension = isLastEntry ? '    ' : '│   ';
        const subTree = generateTree(
          fullPath,
          rootDir,
          prefix + extension,
          isLastEntry,
          filter,
          maxDepth,
          currentDepth + 1
        );
        tree += subTree;
      }
    });

    return tree;
  } catch (error) {
    return '';
  }
}

/**
 * Create a text file with project structure and code
 */
export async function createTxt(options: TxtOptions = {}): Promise<string> {
  const rootDir = resolve(options.rootDir || process.cwd());
  const outputPath = options.outputPath || join(rootDir, 'project-code.txt');

  // Initialize file filter
  const filter = new FileFilter({
    customExcludes: options.customExcludes,
    customIncludes: options.customIncludes,
  });

  // Load .gitignore files
  filter.loadGitignore(rootDir);

  return new Promise(async (resolve, reject) => {
    const output = createWriteStream(outputPath);
    const separator = '='.repeat(80);

    try {
      // Write header
      output.write('PROJECT CODE EXPORT\n');
      output.write(separator + '\n');
      output.write(`Generated: ${new Date().toISOString()}\n`);
      output.write(`Root Directory: ${rootDir}\n`);
      output.write(separator + '\n\n');

      // Generate and write directory tree
      output.write('DIRECTORY STRUCTURE\n');
      output.write(separator + '\n');
      const tree = generateTree(rootDir, rootDir, '', true, filter);
      output.write(tree || '[Empty or all files excluded]\n');
      output.write('\n' + separator + '\n\n');

      // Find all code files
      let files = await glob('**/*', {
        cwd: rootDir,
        dot: false,
        ignore: ['node_modules/**', '.git/**'],
        absolute: false,
      });

      // Include important dotfiles
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

      // Filter and sort files
      const codeFiles = files
        .filter((file) => {
          const fullPath = join(rootDir, file);
          try {
            const stats = statSync(fullPath);
            return stats.isFile() && filter.shouldInclude(fullPath, rootDir);
          } catch {
            return false;
          }
        })
        .sort();

      let fileCount = 0;
      let totalSize = 0;

      // Write each file
      codeFiles.forEach((file, index) => {
        const fullPath = join(rootDir, file);
        const relativePath = relative(rootDir, fullPath);

        try {
          const fileInfo = getFileInfo(fullPath);
          const content = readFileContent(fullPath);

          // File header
          output.write(`\n${separator}\n`);
          output.write(`FILE ${index + 1} of ${codeFiles.length}\n`);
          output.write(separator + '\n');
          output.write(`Path: ${relativePath}\n`);
          output.write(`Language: ${fileInfo.language}\n`);
          output.write(`Size: ${formatFileSize(fileInfo.size)} (${fileInfo.size} bytes)\n`);
          output.write(`Lines: ${fileInfo.lineCount}\n`);
          output.write(separator + '\n\n');

          // File content
          output.write(content);

          // File footer
          if (index < codeFiles.length - 1) {
            output.write('\n' + separator + '\n');
          }

          fileCount++;
          totalSize += fileInfo.size;
        } catch (error) {
          output.write(`\n[Error processing file: ${relativePath}]\n`);
          output.write(`Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        }
      });

      // Write footer
      output.write('\n\n' + separator + '\n');
      output.write('SUMMARY\n');
      output.write(separator + '\n');
      output.write(`Total Files: ${fileCount}\n`);
      output.write(`Total Size: ${formatFileSize(totalSize)} (${totalSize} bytes)\n`);
      output.write(`Generated: ${new Date().toISOString()}\n`);
      output.write(separator + '\n');

      output.end();

      output.on('finish', () => {
        console.log(`✓ Text file created: ${outputPath}`);
        console.log(`  Files included: ${fileCount}`);
        console.log(`  Total size: ${formatFileSize(totalSize)}`);
        resolve(outputPath);
      });

      output.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

