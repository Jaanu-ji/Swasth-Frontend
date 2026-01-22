@echo off
title Metro Bundler - SwasthMobile
cd /d "%~dp0"
echo Starting Metro Bundler...
echo Keep this window open!
echo.
npx react-native start --reset-cache
pause
