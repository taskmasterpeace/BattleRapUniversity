#!/bin/bash

# Gaming UI Redesign Script for Components
# Replaces generic styling with gaming theme across all components

echo "Starting Components Gaming UI Redesign..."

# Background colors
find ./components -name "*.tsx" -type f -exec sed -i 's/bg-zinc-950/bg-[#18191c]/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/bg-zinc-900/bg-[#2d2f35]/g' {} \;

# Border colors
find ./components -name "*.tsx" -type f -exec sed -i 's/border-zinc-800/border-[#3a3d44]/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/border-zinc-700/border-[#3a3d44]/g' {} \;

# Border widths - only replace standalone "border" (not border-r, border-l, etc.)
find ./components -name "*.tsx" -type f -exec sed -i 's/\bborder\b\([^-]\)/border-2\1/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/border-b\b/border-b-2/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/border-t\b/border-t-2/g' {} \;

# Orange accent color
find ./components -name "*.tsx" -type f -exec sed -i 's/text-orange-500/text-[#ff8c42]/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/bg-orange-500/bg-[#ff8c42]/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/hover:text-orange-400/hover:text-[#ff9d5c]/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/hover:bg-orange-600/hover:bg-[#ff9d5c]/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/border-orange-500/border-[#ff8c42]/g' {} \;

# Typography - Add font-display to headers
find ./components -name "*.tsx" -type f -exec sed -i 's/\bfont-bold\b uppercase/font-display font-black uppercase/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/\bfont-black\b tracking-tighter/font-display font-black tracking-tighter/g' {} \;
find ./components -name "*.tsx" -type f -exec sed -i 's/\bfont-semibold\b uppercase/font-display font-black uppercase/g' {} \;

echo "Components Gaming UI Redesign Complete!"
echo ""
echo "Updated all component files with gaming theme"
