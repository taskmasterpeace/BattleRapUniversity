#!/bin/bash
# Test PixelLab v2 API with single crowd reactor sprite generation
# Matches the existing style: pixel art bust, chroma green bg, emotional reaction

API_KEY="${PIXELLAB_API_KEY:-8a33c429-1ea4-489b-aa2d-0587bbfdd885}"
BASE="https://api.pixellab.ai/v2"

echo "=== POST /create-image-pixflux ==="
RESPONSE=$(curl -sS -X POST "$BASE/create-image-pixflux" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "battle rap crowd member, head and shoulders bust, hand on face shocked oh-shit reaction, pixel art, vibrant colors, urban hip-hop style, on bright green chroma key background",
    "image_size": {"width": 64, "height": 64},
    "text_guidance_scale": 8,
    "outline": "single color black outline",
    "shading": "basic shading",
    "detail": "low detail",
    "view": "side",
    "no_background": false
  }')

echo "$RESPONSE" | head -c 2000
echo ""
echo "---"
JOB_ID=$(echo "$RESPONSE" | grep -oE '"id"[^,]*' | head -1)
echo "Job: $JOB_ID"
