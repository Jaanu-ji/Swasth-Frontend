# 🔧 Metro Stability Fix

## Issue: Metro baar baar band ho raha hai

Background mein Metro stable nahi chal raha.

## ✅ Solution: Foreground Metro Window

### Step 1: Start Metro in Dedicated Window

**Option A: Double-click file**
```
swasthMobile folder mein jaao
"start-metro.bat" file ko double-click karo
```

**Option B: Manual command**
```bash
cd C:\Users\shahz\MSWASTH\swasthMobile
npx react-native start
```

Ek dedicated window khulegi. **Isko open rehne do!**

### Step 2: Setup Port Forwarding

**New terminal/CMD window mein:**
```bash
adb reverse tcp:8081 tcp:8081
```

### Step 3: Reload App

Phone pe app ko reload karo:
- Shake device
- Press "Reload"

Ya command se:
```bash
adb shell input text "RR"
```

---

## 🎯 Why This Works

**Background Metro**: Process auto-terminate ho sakta hai
**Foreground Metro**: Visible window = stable process

---

## ✅ Expected Output

Metro window mein ye dikhe:
```
                ######                ######
              ###     ####        ####     ###
            ##          ###    ###          ##

               Welcome to Metro
              Fast - Scalable - Integrated

Lis
tening on port: 8081

BUNDLE  ./index.js ████████████████ 100%
```

---

## 🔍 Verification

```bash
# Check Metro is running
curl http://localhost:8081/status
# Should return: packager-status:running

# Check process
netstat -ano | findstr :8081
# Should show: LISTENING
```

---

## 📱 Phone Status

When Metro is stable:
- No connection errors
- Fast reload
- Changes reflect immediately
- No red screens

---

## 🛠️ If Metro Still Crashes

1. **Check port conflict:**
```bash
netstat -ano | findstr :8081
# Kill conflicting process if any
```

2. **Clear Metro cache:**
```bash
npx react-native start --reset-cache
```

3. **Check Node version:**
```bash
node --version
# Should be >= 18
```

---

**Keep Metro window open and visible!**
**Don't close it until development is done!**
