// Quick fix script to replace escaped quotes
const fs = require('fs');

const filePath = '/components/ProfileVerificationPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of \\\" with regular quotes
content = content.replace(/\\\\\"/g, '"');

fs.writeFileSync(filePath, content);
console.log('Fixed escaped quotes in ProfileVerificationPage.tsx');