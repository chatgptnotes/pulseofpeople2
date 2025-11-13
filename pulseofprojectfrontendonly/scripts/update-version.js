#!/usr/bin/env node

/**
 * Auto-increment version script
 * Runs on git push to increment version number
 * Updates package.json and VersionFooter component
 */

const fs = require('fs');
const path = require('path');

// Read package.json
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Increment minor version (1.0 -> 1.1 -> 1.2, etc.)
const newVersion = `${major}.${minor + 1}.0`;

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update VersionFooter component
const versionFooterPath = path.join(__dirname, '../src/components/VersionFooter.tsx');
let versionFooterContent = fs.readFileSync(versionFooterPath, 'utf8');

// Get current date
const today = new Date().toISOString().split('T')[0];

// Replace version and date
versionFooterContent = versionFooterContent.replace(
  /const APP_VERSION = '[\d.]+'/,
  `const APP_VERSION = '${newVersion}'`
);
versionFooterContent = versionFooterContent.replace(
  /const LAST_UPDATED = '[\d-]+'/,
  `const LAST_UPDATED = '${today}'`
);

fs.writeFileSync(versionFooterPath, versionFooterContent);

console.log(`✅ Version updated: ${packageJson.version.split('.').slice(0, 2).join('.')} → ${newVersion}`);
console.log(`✅ Date updated: ${today}`);
console.log(`✅ Files updated: package.json, VersionFooter.tsx`);

process.exit(0);
