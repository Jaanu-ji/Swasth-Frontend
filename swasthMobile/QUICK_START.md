# 🚀 SwasthMobile - Quick Start Guide

## ✅ Current Status

**App**: Successfully built & working
**Metro**: Running on port 8081
**Version**: WorkingApp.js (Auth screens)

---

## 📱 To Run The App

### Step 1: Connect Phone
```bash
# USB cable se phone connect karo
# Settings > Developer Options > USB Debugging ON karo
# "Allow USB Debugging" popup pe ALLOW karo

# Verify:
adb devices
# Should show your device ✅
```

### Step 2: Start Metro (if not running)
```bash
cd C:\Users\shahz\MSWASTH\swasthMobile
npx react-native start --reset-cache
```

### Step 3: Port Forwarding
```bash
adb reverse tcp:8081 tcp:8081
```

### Step 4: Install & Launch
```bash
# Option A: Auto install & launch
npm run android

# Option B: Manual
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.swasthmobile/com.swasthmobile.MainActivity
```

---

## 📂 Current App Versions

### WorkingApp.js (CURRENT) ✅
- Onboarding screen
- Login screen
- Register screen
- With AuthProvider

**To use:**
```javascript
// index.js
import App from './WorkingApp';
```

### SimpleApp.js (TESTED) ✅
- Basic navigation
- Home + Login screens
- No backend dependency

### MinimalApp.js (TESTED) ✅
- Green screen test
- Verifies basic setup

### App.js (ORIGINAL) ⏳
- All 25+ screens
- Full features
- Will enable after testing

---

## 🔧 If App Not Loading

### 1. Metro Not Running
```bash
# Check
curl http://localhost:8081/status
# Should return: packager-status:running

# If not, restart:
npx react-native start --reset-cache
```

### 2. Device Not Connected
```bash
adb devices
# Should show device

# If not:
# - Reconnect USB cable
# - Enable USB Debugging again
# - Allow popup on phone
```

### 3. Port Forwarding Missing
```bash
adb reverse tcp:8081 tcp:8081
```

### 4. App Needs Reload
```bash
# On phone: Shake device > Reload
# Or via command:
adb shell input text "RR"
```

---

## 📱 What You Should See

### On WorkingApp.js:
1. **Onboarding Screen** with:
   - Icon (heart/group/dumbbell/shield)
   - Title & description
   - Slider dots
   - Skip / Next buttons

2. **After Next/Skip**:
   - Login screen
   - Email & password fields
   - Login button

---

## 🎯 Testing Progress

| Version | Status | Notes |
|---------|--------|-------|
| MinimalApp | ✅ WORKING | Basic test passed |
| SimpleApp | ✅ WORKING | Navigation OK |
| WorkingApp | 🔄 TESTING | Auth screens loading |
| Full App | ⏳ PENDING | All features |

---

## 🛠️ Quick Debug Commands

```bash
# Check Metro
netstat -ano | findstr :8081

# Check device
adb devices

# Port forward
adb reverse tcp:8081 tcp:8081

# Restart app
adb shell am force-stop com.swasthmobile
adb shell am start -n com.swasthmobile/com.swasthmobile.MainActivity

# Reload
adb shell input text "RR"

# View logs
adb logcat -s ReactNativeJS:V
```

---

## ✅ Success Checklist

- [ ] USB connected (adb devices shows device)
- [ ] Metro running (port 8081)
- [ ] Port forwarding setup
- [ ] App installed
- [ ] App launched
- [ ] Onboarding screen visible

---

## 📞 Current Configuration

**Metro Process**: Running (PID varies)
**Port**: 8081 ✅
**App Package**: com.swasthmobile
**Current Version**: WorkingApp.js

---

**Next**: Batao phone pe kya dikha! 📱
