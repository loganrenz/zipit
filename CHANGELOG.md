# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added
- Initial release
- `zipit zip` command to create zip archives of project code
- `txtit txt` command to generate text files with directory structure and code
- Smart file filtering with default exclusions for common build artifacts
- Recursive `.gitignore` parsing and respect
- Cursor IDE integration with automatic command file creation
- CLI with options for output path, root directory, excludes, and includes
- TypeScript support with type definitions
- Comprehensive documentation

### Features
- Excludes `node_modules`, build artifacts, cache directories, and more
- Preserves directory structure in zip files
- Generates formatted text files with file metadata (language, size, line count)
- Supports custom exclusion and inclusion patterns
- Automatic Cursor command setup on install

