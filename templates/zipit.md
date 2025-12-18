# ZipIt Command

Creates a zip archive of the project code, excluding build artifacts, dependencies, and other unnecessary files.

## Usage

\`\`\`bash
npx @narduk/cursor-zipit zip
\`\`\`

## Options

- `-o, --output <path>`: Specify output file path (default: `project-code.zip`)
- `-r, --root <dir>`: Specify root directory (default: current directory)
- `-e, --exclude <pattern>`: Additional exclusion patterns (can be used multiple times)
- `-i, --include <pattern>`: Additional inclusion patterns (can be used multiple times)

## Examples

\`\`\`bash
# Create zip in current directory
npx @narduk/cursor-zipit zip

# Create zip with custom output path
npx @narduk/cursor-zipit zip -o my-project.zip

# Exclude additional patterns
npx @narduk/cursor-zipit zip -e "*.log" -e "*.tmp"

# Include specific patterns
npx @narduk/cursor-zipit zip -i "*.config.js"
\`\`\`

## What Gets Excluded

By default, the following are excluded:
- `node_modules`, `__pycache__`, `.git`
- Build directories: `dist`, `build`, `.next`, `.nuxt`
- Virtual environments: `venv`, `.venv`
- Environment files: `.env`
- Build artifacts: `*.pyc`, `*.class`, etc.
- IDE directories: `.idea`, `.vscode`, `.cursor`
- And patterns from `.gitignore` files

