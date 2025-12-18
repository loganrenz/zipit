# ZipIt

Create zip archives and text dumps of project code with smart exclusions. Perfect for sharing code with AI assistants like ChatGPT or Cursor.

## Features

- 🗜️ **Zip Creation**: Create compressed archives of your project code
- 📄 **Text Export**: Generate a single text file with directory structure and all code
- 🎯 **Smart Exclusions**: Automatically excludes `node_modules`, build artifacts, and more
- 📋 **Gitignore Support**: Respects `.gitignore` patterns
- 🎨 **Cursor Integration**: Automatically creates `/zipit` and `/txtit` commands in Cursor

## Installation

```bash
npm install @narduk/cursor-zipit
```

Or globally:

```bash
npm install -g @narduk/cursor-zipit
```

## Usage

### CLI Commands

#### Create Zip Archive

```bash
npx @narduk/cursor-zipit zip
```

Creates `project-code.zip` in the current directory.

#### Create Text File

```bash
npx @narduk/cursor-zipit txt
```

Creates `project-code.txt` in the current directory with directory structure and all code files.

### Command Options

Both commands support the following options:

- `-o, --output <path>`: Specify output file path
- `-r, --root <dir>`: Specify root directory (default: current directory)
- `-e, --exclude <pattern>`: Additional exclusion patterns (can be used multiple times)
- `-i, --include <pattern>`: Additional inclusion patterns (can be used multiple times)

### Examples

```bash
# Create zip with custom output
npx @narduk/cursor-zipit zip -o my-project.zip

# Create text file with custom output
npx @narduk/cursor-zipit txt -o my-project.txt

# Exclude additional patterns
npx @narduk/cursor-zipit zip -e "*.log" -e "*.tmp"

# Include specific files
npx @narduk/cursor-zipit zip -i "*.config.js" -i "*.config.ts"
```

## Cursor Integration

When you install `zipit`, it automatically creates Cursor command files in `.cursor/commands/`:

- `/zipit` - Creates a zip archive
- `/txtit` - Creates a text file

Simply type `/zipit` or `/txtit` in Cursor's command palette to use them!

## What Gets Excluded

By default, ZipIt excludes:

- **Dependencies**: `node_modules`, `venv`, `.venv`
- **Build Artifacts**: `dist`, `build`, `.next`, `.nuxt`, `out`, `target`
- **Cache**: `__pycache__`, `.cache`, `.parcel-cache`, `.turbo`
- **Environment**: `.env`, `.env.local`
- **IDE**: `.idea`, `.vscode`, `.cursor`
- **Version Control**: `.git`
- **Compiled Files**: `*.pyc`, `*.class`, `*.o`
- **Logs**: `*.log`
- **And more**: Plus anything in your `.gitignore` files

## Text File Format

The text file output includes:

1. **Header**: Generation timestamp and root directory
2. **Directory Tree**: Visual tree structure of the project
3. **File Contents**: Each code file with:
   - File path
   - Language/type
   - File size
   - Line count
   - Full file contents
4. **Summary**: Total files and size statistics

Example:

```
PROJECT CODE EXPORT
================================================================================
Generated: 2024-01-15T10:30:00.000Z
Root Directory: /path/to/project
================================================================================

DIRECTORY STRUCTURE
================================================================================
├── src
│   ├── index.ts
│   └── utils.ts
└── package.json
================================================================================

================================================================================
FILE 1 of 3
================================================================================
Path: src/index.ts
Language: TypeScript
Size: 1.2 KB (1234 bytes)
Lines: 45
================================================================================

[file contents here...]
```

## API Usage

You can also use ZipIt programmatically:

```typescript
import { createZip, createTxt } from '@narduk/cursor-zipit';

// Create zip
await createZip({
  outputPath: './output.zip',
  rootDir: './src',
  customExcludes: ['*.test.ts'],
  customIncludes: ['*.config.*'],
});

// Create text file
await createTxt({
  outputPath: './output.txt',
  rootDir: './src',
  customExcludes: ['*.test.ts'],
});
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

