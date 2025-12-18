#!/usr/bin/env node

const { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } = require('fs');
const { join, dirname } = require('path');

/**
 * Post-install script to create Cursor command files
 */
function setupCursorCommands() {
  const projectRoot = process.cwd();
  const cursorCommandsDir = join(projectRoot, '.cursor', 'commands');
  const templatesDir = join(__dirname, '..', 'templates');

  // Create .cursor/commands directory if it doesn't exist
  if (!existsSync(cursorCommandsDir)) {
    mkdirSync(cursorCommandsDir, { recursive: true });
    console.log('✓ Created .cursor/commands directory');
  }

  // Copy command templates
  const commands = ['zipit.md', 'txtit.md'];
  
  commands.forEach((command) => {
    const templatePath = join(templatesDir, command);
    const targetPath = join(cursorCommandsDir, command);

    if (existsSync(templatePath)) {
      try {
        copyFileSync(templatePath, targetPath);
        console.log(`✓ Created Cursor command: ${command}`);
      } catch (error) {
        console.warn(`⚠ Failed to create ${command}:`, error.message);
      }
    } else {
      console.warn(`⚠ Template not found: ${templatePath}`);
    }
  });

  console.log('\n✓ ZipIt Cursor commands installed successfully!');
  console.log('  Use /zipit or /txtit in Cursor to create archives.');
  console.log('  Package: @narduk/zipit\n');
}

// Run setup
try {
  setupCursorCommands();
} catch (error) {
  console.error('Error setting up Cursor commands:', error);
  process.exit(1);
}

