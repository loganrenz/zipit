# Publishing Guide

This document outlines the steps to publish ZipIt to npmjs.com.

## Prerequisites

1. **npm account**: Ensure you have an npm account and are logged in
   ```bash
   npm login
   ```

2. **Doppler setup**: Configure Doppler for secrets management
   ```bash
   doppler setup --project zipit --config dev
   ```
   Note: You may need to create the `zipit` project in Doppler first.

3. **GitHub repository**: Ensure the repository exists and is accessible
   - Repository URL: https://github.com/narduk/zipit.git

## Pre-Publishing Checklist

- [x] All tests pass (`npm test`)
- [x] Build succeeds (`npm run build`)
- [x] Version number is correct in `package.json`
- [x] CHANGELOG.md is updated
- [x] README.md is complete and accurate
- [x] LICENSE file is present
- [x] `.npmignore` is configured correctly
- [x] `package.json` has all required fields:
  - [x] name, version, description
  - [x] main, types, bin
  - [x] repository, bugs, homepage
  - [x] keywords, license, author
  - [x] files array (what gets published)

## Publishing Steps

1. **Verify package contents**
   ```bash
   npm pack --dry-run
   ```
   This shows what files will be included in the published package.

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Publish to npm**
   ```bash
   npm publish
   ```
   
   For the first time, you may want to publish as a beta/rc:
   ```bash
   npm publish --tag beta
   ```

5. **Verify publication**
   - Check https://www.npmjs.com/package/@narduk/cursor-zipit
   - Test installation: `npm install @narduk/cursor-zipit`
   - Test CLI: `npx @narduk/cursor-zipit --help`

## Post-Publishing

1. **Create a GitHub release**
   - Tag the release: `git tag v1.0.0`
   - Push tag: `git push origin v1.0.0`
   - Create release on GitHub with release notes from CHANGELOG.md

2. **Update documentation**
   - Ensure README.md has correct installation instructions
   - Update any external documentation

## Version Management

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

Update version in `package.json` and `CHANGELOG.md` before publishing.

## Troubleshooting

### Package name
Using `@narduk/cursor-zipit` (scoped package). Scoped packages require `--access public` flag:
```bash
npm publish --access public
```

### Authentication errors
```bash
npm login
# Enter your npm credentials
```

### Permission errors
Ensure you have publish access to the package. For scoped packages, you may need:
```bash
npm publish --access public
```

