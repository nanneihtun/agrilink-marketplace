const fs = require('fs');
const path = '/components/ProfileVerificationPage.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace all instances of \\\" with "
content = content.replace(/\\\\\"/g, '"');

fs.writeFileSync(path, content);
console.log('Fixed escaped quotes in ProfileVerificationPage.tsx');