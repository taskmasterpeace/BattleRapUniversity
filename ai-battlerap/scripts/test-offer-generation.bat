@echo off
REM Quick script to trigger battle offer generation locally (Windows)
REM Usage: scripts\test-offer-generation.bat

echo Triggering battle offer generation...
echo.

REM You need to set your INTERNAL_API_SECRET here or in environment
REM Get it from .env.local file

curl -X POST http://localhost:3000/api/internal/generate-battle-offers ^
  -H "Authorization: Bearer %INTERNAL_API_SECRET%" ^
  -H "Content-Type: application/json"

echo.
echo Done! Check /battle/offers to see new offers.
pause
