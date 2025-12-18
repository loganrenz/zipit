import { readFileSync, statSync } from 'fs';
import { extname, basename } from 'path';

export interface FileInfo {
  path: string;
  size: number;
  language: string;
  lineCount: number;
}

// Language detection based on file extension
const LANGUAGE_MAP: Record<string, string> = {
  '.js': 'JavaScript',
  '.jsx': 'JavaScript (React)',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript (React)',
  '.py': 'Python',
  '.java': 'Java',
  '.cpp': 'C++',
  '.c': 'C',
  '.cs': 'C#',
  '.go': 'Go',
  '.rs': 'Rust',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.scala': 'Scala',
  '.clj': 'Clojure',
  '.hs': 'Haskell',
  '.ml': 'OCaml',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'SASS',
  '.less': 'Less',
  '.json': 'JSON',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.ini': 'INI',
  '.conf': 'Config',
  '.sh': 'Shell',
  '.bash': 'Bash',
  '.zsh': 'Zsh',
  '.fish': 'Fish',
  '.ps1': 'PowerShell',
  '.bat': 'Batch',
  '.cmd': 'Batch',
  '.sql': 'SQL',
  '.md': 'Markdown',
  '.txt': 'Text',
  '.dockerfile': 'Dockerfile',
  '.dockerignore': 'Docker Ignore',
  '.gitignore': 'Git Ignore',
  '.gitattributes': 'Git Attributes',
  '.env': 'Environment',
  '.lock': 'Lock File',
  '.log': 'Log',
};

/**
 * Get language/type for a file based on extension
 */
export function getFileLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const basenameLower = basename(filePath).toLowerCase();
  
  // Check for special filenames first
  if (basenameLower === 'dockerfile' || basenameLower.startsWith('dockerfile.')) {
    return 'Dockerfile';
  }
  if (basenameLower === 'makefile' || basenameLower.startsWith('makefile.')) {
    return 'Makefile';
  }
  if (basenameLower.startsWith('.env')) {
    return 'Environment';
  }
  
  return LANGUAGE_MAP[ext] || ext.slice(1).toUpperCase() || 'Unknown';
}

/**
 * Count lines in a file
 */
export function countLines(filePath: string): number {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

/**
 * Get file size in bytes
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file info object
 */
export function getFileInfo(filePath: string): FileInfo {
  return {
    path: filePath,
    size: getFileSize(filePath),
    language: getFileLanguage(filePath),
    lineCount: countLines(filePath),
  };
}

/**
 * Read file content safely
 */
export function readFileContent(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    return `[Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

