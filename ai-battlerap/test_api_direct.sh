#!/bin/bash

# Battle Offer Generation API Testing Script
# This script tests the internal API endpoints directly

BASE_URL="http://localhost:3005"
INTERNAL_SECRET="local-dev-secret-123"

echo "=================================="
echo "Battle Offer Generation API Tests"
echo "=================================="
echo ""

# Test 1: Generate Battle Offers
echo "Test 1: Calling /api/internal/generate-battle-offers"
echo "------------------------------------------------------"
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer ${INTERNAL_SECRET}" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/internal/generate-battle-offers")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract offers created count
OFFERS_CREATED=$(echo "$RESPONSE" | jq -r '.offersCreated' 2>/dev/null || echo "unknown")
echo "Offers Created: $OFFERS_CREATED"
echo ""

# Test 2: Try calling again (should return 0 new offers due to duplicate prevention)
echo "Test 2: Calling again to test duplicate prevention"
echo "---------------------------------------------------"
RESPONSE2=$(curl -s -X POST \
  -H "Authorization: Bearer ${INTERNAL_SECRET}" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/internal/generate-battle-offers")

echo "Response:"
echo "$RESPONSE2" | jq '.' 2>/dev/null || echo "$RESPONSE2"
echo ""

OFFERS_CREATED2=$(echo "$RESPONSE2" | jq -r '.offersCreated' 2>/dev/null || echo "unknown")
echo "Offers Created (2nd attempt): $OFFERS_CREATED2"
echo ""

if [ "$OFFERS_CREATED2" == "0" ]; then
  echo "✅ PASS: Duplicate prevention working correctly"
else
  echo "⚠️  WARNING: Expected 0 offers on 2nd attempt, got $OFFERS_CREATED2"
fi

echo ""
echo "=================================="
echo "Test Complete"
echo "=================================="
