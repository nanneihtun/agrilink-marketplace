#!/usr/bin/env node

/**
 * localStorage Cleanup Script
 * 
 * This script helps clean up localStorage usage and demo logic
 * from the Figma prototype transition to Supabase production.
 * 
 * Run with: node cleanup-localstorage.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting localStorage cleanup...\n');

// Files to clean up
const filesToClean = [
  'src/components/LocalStorageDebugger.tsx',
  'src/components/StorageDebugPanel.tsx', 
  'src/components/StorageManager.tsx',
  'src/components/StorageStatusIndicator.tsx',
  'src/components/StorageMonitor.tsx',
  'src/components/SimpleVerificationTester.tsx'
];

// Check which files exist and can be removed
const existingFiles = filesToClean.filter(file => {
  const fullPath = path.join(__dirname, file);
  return fs.existsSync(fullPath);
});

console.log(`📁 Found ${existingFiles.length} debug files to remove:`);
existingFiles.forEach(file => console.log(`   - ${file}`));

if (existingFiles.length === 0) {
  console.log('✅ No debug files found to remove.\n');
} else {
  console.log('\n🗑️  These files can be safely removed as they are debug components from the Figma prototype.\n');
}

// Check for localStorage usage in critical files
const criticalFiles = [
  'src/components/ChatInterface.tsx',
  'src/components/Messages.tsx', 
  'src/App.tsx'
];

console.log('🔍 Checking critical files for localStorage usage:\n');

criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const localStorageMatches = content.match(/localStorage\./g);
    const agriconnectMatches = content.match(/agriconnect-myanmar/g);
    
    console.log(`📄 ${file}:`);
    console.log(`   - localStorage calls: ${localStorageMatches ? localStorageMatches.length : 0}`);
    console.log(`   - agriconnect-myanmar references: ${agriconnectMatches ? agriconnectMatches.length : 0}`);
    
    if (localStorageMatches && localStorageMatches.length > 0) {
      console.log(`   ⚠️  Still using localStorage - needs Supabase migration`);
    } else {
      console.log(`   ✅ No localStorage usage found`);
    }
    console.log('');
  }
});

console.log('📋 Next Steps:');
console.log('1. Run the MIGRATION_FIXES.sql in your Supabase SQL editor');
console.log('2. Update ChatInterface.tsx to use Supabase offers table');
console.log('3. Update Messages.tsx to remove localStorage user data fallback');
console.log('4. Clean up App.tsx sample product logic');
console.log('5. Remove debug components (optional)');

console.log('\n🎯 Benefits after cleanup:');
console.log('✅ Consistent Supabase data source');
console.log('✅ Better performance (no localStorage parsing)');
console.log('✅ Real-time updates');
console.log('✅ Multi-device data sync');
console.log('✅ Cleaner production codebase');

console.log('\n✨ Cleanup analysis complete!');
