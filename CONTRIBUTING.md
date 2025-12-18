# Contributing to ZipIt

Thank you for your interest in contributing to ZipIt! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/narduk/zipit.git
   cd zipit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Set up Doppler** (for secrets management)
   ```bash
   doppler setup --project zipit --config dev
   ```

## Development Workflow

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Build and test
   ```bash
   npm run build
   npm test
   ```

4. Commit your changes (follow conventional commits)
   ```bash
   git commit -m "feat: add new feature"
   ```

5. Push and create a Pull Request

## Code Style

- Use TypeScript for all source code
- Follow the existing code style (2 spaces, single quotes)
- Run `npm run build` before committing to ensure TypeScript compiles
- Add tests for new features

## Project Structure

```
zipit/
├── src/           # TypeScript source files
├── dist/          # Compiled JavaScript (generated)
├── bin/           # Executable scripts
├── templates/     # Cursor command templates
├── tests/         # Test files
└── README.md      # Documentation
```

## Testing

Run the integration tests:
```bash
npm test
```

The tests clone sample repositories and verify that zip and txt generation works correctly.

## Submitting Changes

1. Ensure all tests pass
2. Update documentation if needed
3. Update CHANGELOG.md with your changes
4. Submit a Pull Request with a clear description

## Questions?

Open an issue on GitHub if you have questions or need help.

