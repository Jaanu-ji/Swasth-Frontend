# 🔧 Metro Bundler Fix

## Issue: Metro Error

Metro bundler mein error aa raha tha.

## ✅ Solution Applied

### Step 1: Kill All Node Processes
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Start Metro with Cache Reset
```bash
cd swasthMobile
npx react-native start --reset-cache
```

### Step 3: Setup Port Forwarding
```bash
adb reverse tcp:8081 tcp:8081
```

### Step 4: Restart App
```bash
adb shell am force-stop com.swasthmobile
adb shell am start -n com.swasthmobile/com.swasthmobile.MainActivity
```

## ✅ Status

- Metro: Running ✅
- Port: 8081 ✅
- Cache: Reset ✅
- App: Restarted ✅

## 📱 Expected Result

Phone pe ab properly load hona chahiye without errors.

## 🔍 If Still Error

Metro terminal mein kya error dikha:
```bash
# Check Metro output
tail -50 C:/Users/shahz/AppData/Local/Temp/claude/C--Users-shahz-MSWASTH/tasks/b47f80b.output
```

## 🛠️ Quick Commands

```bash
# Check Metro status
curl http://localhost:8081/status

# Reload app on phone
adb shell input text "RR"

# Or shake device and press Reload
```

---
**Status**: Metro restarted with clean cache ✅
