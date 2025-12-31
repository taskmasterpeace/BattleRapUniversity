@echo off
cd /d "%~dp0"
echo.
echo Starting SpriteX...
echo.
start "" "http://localhost:3456"
node server.js
