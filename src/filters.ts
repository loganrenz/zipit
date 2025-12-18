import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import ignore from 'ignore';

export interface FilterOptions {
  customExcludes?: string[];
  customIncludes?: string[];
}

// Default exclusions for common build artifacts, dependencies, and generated files
const DEFAULT_EXCLUDES = [
  'node_modules',
  '__pycache__',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'venv',
  '.venv',
  'env',
  '.env',
  '*.pyc',
  '*.pyo',
  '*.pyd',
  '.pytest_cache',
  '.mypy_cache',
  '.coverage',
  'htmlcov',
  '.tox',
  '.eggs',
  '*.egg-info',
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  '.idea',
  '.vscode',
  '.cursor',
  'coverage',
  '.nyc_output',
  '.cache',
  'tmp',
  'temp',
  '.tmp',
  '.temp',
  'out',
  '.out',
  'target',
  '.gradle',
  '.class',
  '*.class',
  '.sass-cache',
  '.parcel-cache',
  '.turbo',
  '.vercel',
  '.netlify',
];

export class FileFilter {
  private ig: ignore.Ignore;
  private customExcludes: string[];
  private customIncludes: string[];

  constructor(options: FilterOptions = {}) {
    this.ig = ignore();
    this.customExcludes = options.customExcludes || [];
    this.customIncludes = options.customIncludes || [];

    // Add default excludes
    DEFAULT_EXCLUDES.forEach(pattern => {
      this.ig.add(`**/${pattern}`);
      this.ig.add(pattern);
    });

    // Add custom excludes
    this.customExcludes.forEach(pattern => {
      this.ig.add(`**/${pattern}`);
      this.ig.add(pattern);
    });
  }

  /**
   * Load and parse .gitignore files recursively
   */
  loadGitignore(rootDir: string): void {
    this._loadGitignoreRecursive(rootDir, rootDir);
  }

  private _loadGitignoreRecursive(rootDir: string, currentDir: string, visited: Set<string> = new Set()): void {
    // Avoid infinite loops and already processed directories
    const normalizedDir = currentDir.replace(/\\/g, '/');
    if (visited.has(normalizedDir)) {
      return;
    }
    visited.add(normalizedDir);

    const gitignorePath = join(currentDir, '.gitignore');
    
    if (existsSync(gitignorePath)) {
      try {
        const content = readFileSync(gitignorePath, 'utf-8');
        const relativePath = currentDir === rootDir 
          ? '' 
          : currentDir.replace(rootDir, '').replace(/^[/\\]/, '').replace(/\\/g, '/');
        
        // Parse gitignore patterns
        const patterns = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'))
          .map(pattern => {
            // Handle patterns relative to the gitignore file location
            if (pattern.startsWith('/')) {
              // Absolute from root of the gitignore file's directory
              if (relativePath) {
                return `${relativePath}${pattern}`;
              }
              return pattern;
            } else if (relativePath) {
              // Relative to subdirectory - add prefix
              return `${relativePath}/${pattern}`;
            }
            return pattern;
          });

        patterns.forEach(pattern => {
          this.ig.add(pattern);
        });
      } catch (error) {
        // Silently ignore errors reading .gitignore
      }
    }

    // Recursively process subdirectories (but skip excluded ones)
    try {
      const entries = readdirSync(currentDir);
      for (const entry of entries) {
        // Skip .git and node_modules to avoid unnecessary traversal
        if (entry === '.git' || entry === 'node_modules') {
          continue;
        }

        const fullPath = join(currentDir, entry);
        try {
          const stats = statSync(fullPath);
          if (stats.isDirectory()) {
            // Check if this directory should be excluded before traversing
            if (!this.shouldExclude(fullPath, rootDir)) {
              this._loadGitignoreRecursive(rootDir, fullPath, visited);
            }
          }
        } catch {
          // Skip entries we can't access
        }
      }
    } catch (error) {
      // Silently ignore errors reading directory
    }
  }

  /**
   * Check if a file should be excluded
   */
  shouldExclude(filePath: string, relativeToRoot: string = ''): boolean {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    let relativePath: string;
    
    if (relativeToRoot) {
      const rootNormalized = relativeToRoot.replace(/\\/g, '/');
      relativePath = normalizedPath.replace(rootNormalized, '').replace(/^\//, '');
    } else {
      relativePath = normalizedPath;
    }

    // Ensure relativePath is relative (not absolute)
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }

    // Check against ignore patterns (only use relative path for ignore library)
    try {
      if (this.ig.ignores(relativePath)) {
        // But allow if explicitly included
        if (this.customIncludes.length > 0) {
          return !this.customIncludes.some(include => {
            const includePattern = include.replace(/\\/g, '/');
            return relativePath.includes(includePattern);
          });
        }
        return true;
      }
    } catch (error) {
      // If ignore check fails, fall through to custom excludes
    }

    // Check custom excludes
    if (this.customExcludes.length > 0) {
      const shouldExclude = this.customExcludes.some(exclude => {
        const excludePattern = exclude.replace(/\\/g, '/');
        return relativePath.includes(excludePattern);
      });
      if (shouldExclude) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a file should be included (opposite of shouldExclude)
   */
  shouldInclude(filePath: string, relativeToRoot: string = ''): boolean {
    return !this.shouldExclude(filePath, relativeToRoot);
  }
}

