# ✅ React Native CLI - Fixed for Windows

## Problem Solved ✅

The deprecated `react-native-cli@2.0.1` has been **removed** from your global npm packages.

You now use the modern React Native CLI that comes bundled with React Native itself.

---

## How to Run Your App on Windows

### Method 1: Using npx (Recommended)

```cmd
cd C:\Users\shahz\MSWASTH\swasthMobile

REM Start Metro bundler
npx react-native start

REM In a NEW terminal, run the app
npx react-native run-android
```

### Method 2: Using npm scripts

```cmd
cd C:\Users\shahz\MSWASTH\swasthMobile

REM Start Metro bundler
npm start

REM In a NEW terminal, run the app
npm run android
```

---

## Important: First Time Setup

### 1. Ensure Dependencies are Installed
```cmd
npm install
```

### 2. Link Vector Icons
```cmd
npx react-native-asset
```

### 3. Update API URL
Edit `src\config\api.js` and change:
```javascript
const API_BASE_URL = "http://YOUR_IP_ADDRESS:3000/api";
```

Find your IP with: `ipconfig` (look for IPv4 Address)

---

## Windows-Specific Commands

### Check React Native CLI Version
```cmd
npx react-native -v
```

### List Available Commands
```cmd
npx react-native --help
```

### Clear Metro Cache (if issues)
```cmd
npx react-native start --reset-cache
```

### Clean Android Build
```cmd
cd android
gradlew clean
cd ..
```

### Full Rebuild
```cmd
cd android
gradlew clean
cd ..
del /f /s /q node_modules
npm install
npx react-native run-android
```

---

## Verify Your Setup

Run these commands to verify everything is ready:

```cmd
REM 1. Check Node version (should be v20.20.0)
node --version

REM 2. Check npm version
npm --version

REM 3. Check React Native CLI works
npx react-native -v

REM 4. Check no global react-native-cli
npm list -g react-native-cli

REM 5. Check Android devices
adb devices
```

---

## Common Windows Issues

### Issue 1: "npx not recognized"
**Solution:** Reinstall Node.js from https://nodejs.org/

### Issue 2: Long Path Error
**Solution:** Enable long paths:
```cmd
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f
```

### Issue 3: Gradle permission denied
**Solution:**
```cmd
cd android
icacls gradlew /grant Everyone:F
cd ..
```

### Issue 4: Metro bundler won't start
**Solution:**
```cmd
npx react-native start --reset-cache
```

### Issue 5: Android SDK not found
**Solution:** Set ANDROID_HOME environment variable:
```
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start Metro | `npm start` or `npx react-native start` |
| Run Android | `npm run android` or `npx react-native run-android` |
| Clean cache | `npx react-native start --reset-cache` |
| Clean build | `cd android && gradlew clean && cd ..` |
| Check devices | `adb devices` |
| Install deps | `npm install` |

---

## ✅ You're Ready!

Your React Native CLI environment is now properly configured for Windows.

Run your app with:
```cmd
cd C:\Users\shahz\MSWASTH\swasthMobile
npm start
```

Then in a new terminal:
```cmd
npm run android
```

---

## What Changed?

### Before (❌ Broken)
- Global `react-native-cli@2.0.1` installed
- Caused "cli.init is not a function" error
- Incompatible with modern React Native

### After (✅ Fixed)
- No global CLI package needed
- Uses `@react-native-community/cli` bundled with React Native 0.74.5
- Modern, maintained CLI
- All commands work via `npx react-native`

---

**Your environment is now ready for React Native development on Windows!** 🎉
