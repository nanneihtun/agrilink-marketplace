#!/usr/bin/env python3

# Fix escaped quotes in ProfileVerificationPage.tsx
import re

# Read the file
with open('/components/ProfileVerificationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace escaped quotes with regular quotes
content = content.replace('\\"', '"')

# Write back the fixed content
with open('/components/ProfileVerificationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed escaped quotes in ProfileVerificationPage.tsx")