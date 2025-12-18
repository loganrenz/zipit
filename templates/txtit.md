# TxtIt Command

Generates a single text file containing the project directory structure and all code files with metadata headers.

## Usage

\`\`\`bash
npx @narduk/cursor-zipit txt
\`\`\`

## Options

- `-o, --output <path>`: Specify output file path (default: `project-code.txt`)
- `-r, --root <dir>`: Specify root directory (default: current directory)
- `-e, --exclude <pattern>`: Additional exclusion patterns (can be used multiple times)
- `-i, --include <pattern>`: Additional inclusion patterns (can be used multiple times)

## Examples

\`\`\`bash
# Create text file in current directory
npx @narduk/cursor-zipit txt

# Create text file with custom output path
npx @narduk/cursor-zipit txt -o my-project.txt

# Exclude additional patterns
npx @narduk/cursor-zipit txt -e "*.log" -e "*.tmp"

# Include specific patterns
npx @narduk/cursor-zipit txt -i "*.config.js"
\`\`\`

## Output Format

The text file includes:
1. **Header**: Generation timestamp and root directory
2. **Directory Tree**: Visual tree structure of the project
3. **File Contents**: Each code file with:
   - File path
   - Language/type
   - File size
   - Line count
   - Full file contents
4. **Summary**: Total files and size statistics

## What Gets Excluded

By default, the following are excluded:
- `node_modules`, `__pycache__`, `.git`
- Build directories: `dist`, `build`, `.next`, `.nuxt`
- Virtual environments: `venv`, `.venv`
- Environment files: `.env`
- Build artifacts: `*.pyc`, `*.class`, etc.
- IDE directories: `.idea`, `.vscode`, `.cursor`
- And patterns from `.gitignore` files

