// Quick script to fix escaped quotes in ProfileVerificationPage.tsx
const fs = require('fs');

try {
  // Read the file
  const filePath = '/components/ProfileVerificationPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix escaped quotes in JSX attributes
  content = content.replace(/\\"/g, '"');
  
  // Write back
  fs.writeFileSync(filePath, content);
  
  console.log('Fixed escaped quotes in ProfileVerificationPage.tsx');
} catch (error) {
  console.error('Error:', error.message);
}