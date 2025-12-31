#!/bin/bash

# Gaming UI Redesign Script
# Replaces generic styling with gaming theme across all pages

echo "Starting Gaming UI Redesign..."

# Background colors
find ./app -name "*.tsx" -type f -exec sed -i 's/bg-zinc-950/bg-[#18191c]/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/bg-zinc-900/bg-[#2d2f35]/g' {} \;

# Border colors
find ./app -name "*.tsx" -type f -exec sed -i 's/border-zinc-800/border-[#3a3d44]/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/border-zinc-700/border-[#3a3d44]/g' {} \;

# Border widths
find ./app -name "*.tsx" -type f -exec sed -i 's/\bborder\b\([^-]\)/border-2\1/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/border-b\b/border-b-2/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/border-t\b/border-t-2/g' {} \;

# Orange accent color
find ./app -name "*.tsx" -type f -exec sed -i 's/text-orange-500/text-[#ff8c42]/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/bg-orange-500/bg-[#ff8c42]/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/hover:text-orange-400/hover:text-[#ff9d5c]/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/hover:bg-orange-600/hover:bg-[#ff9d5c]/g' {} \;

# Typography - Add font-display to headers
find ./app -name "*.tsx" -type f -exec sed -i 's/\bfont-bold\b uppercase/font-display font-black uppercase/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/\bfont-black\b tracking-tighter/font-display font-black tracking-tighter/g' {} \;
find ./app -name "*.tsx" -type f -exec sed -i 's/\bfont-semibold\b uppercase/font-display font-black uppercase/g' {} \;

echo "Gaming UI Redesign Complete!"
echo ""
echo "Changed:"
echo "- Backgrounds: zinc-950 → #18191c, zinc-900 → #2d2f35"
echo "- Borders: zinc-800/700 → #3a3d44, added border-2"
echo "- Orange accent: orange-500 → #ff8c42"
echo "- Typography: Added font-display font-black to headers"
