#!/bin/bash

# Fix ${colors.border-2} to ${colors.border} in template strings

echo "Fixing template string border references..."

# Fix template string border-2 references
find ./app -name "*.tsx" -type f -exec sed -i 's/\${colors\.border-2}/\${colors.border}/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/\${colors\.border-2}/\${colors.border}/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/\${tierColors\.border-2}/\${tierColors.border}/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/\${tierColors\.border-2}/\${tierColors.border}/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/\${stateColors\.border-2}/\${stateColors.border}/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/\${stateColors\.border-2}/\${stateColors.border}/g' {} \;

echo "Fixed all template string border references!"
