#!/bin/bash

# Quick script to trigger battle offer generation locally
# Usage: ./scripts/test-offer-generation.sh

# Read secret from .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep INTERNAL_API_SECRET | xargs)
fi

if [ -z "$INTERNAL_API_SECRET" ]; then
  echo "Error: INTERNAL_API_SECRET not found in .env.local"
  exit 1
fi

echo "Triggering battle offer generation..."
echo ""

curl -X POST http://localhost:3000/api/internal/generate-battle-offers \
  -H "Authorization: Bearer $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  | json_pp

echo ""
echo "Done! Check /battle/offers to see new offers."
