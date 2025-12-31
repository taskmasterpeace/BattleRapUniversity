#!/bin/bash

# Fix border-2: back to border: in object keys

echo "Fixing border keys in objects..."

# Fix border-2: back to border: in object keys
find ./app -name "*.tsx" -type f -exec sed -i 's/border-2:/border:/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/border-2:/border:/g' {} \;

echo "Fixed all border keys!"
