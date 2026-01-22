# 🔧 SwasthMobile - Error Fixing Guide

## 🚨 Current Status: Red Error Screen

App install ho gaya hai but red error screen dikh rahi hai.

---

## 📱 **Step 1: Check Current Test**

Maine temporarily simple test app load kiya hai.

**Expected Screen:**
```
✅ SwasthMobile Test
App is working!
```

**Phone pe:**
- Agar ye simple text dikhe = Basic setup THEEK hai ✅
- Agar abhi bhi red error = Configuration issue hai ❌

---

## 🔍 **Step 2: Read Error Message**

Red screen pe error message likha hoga. Common errors:

### **A. Network Error / API Connection**
```
Error: Network error. Server not reachable.
```

**Fix:**
```javascript
// src/config/api.js line 10
const API_BASE_URL = "http://10.208.217.64:3000/api";
```

**Change to:**
1. **Laptop ka IP address** (same WiFi):
   ```bash
   # Windows CMD:
   ipconfig
   # Look for: IPv4 Address
   # Example: 192.168.1.5
   ```

2. Update karo:
   ```javascript
   const API_BASE_URL = "http://192.168.1.5:3000/api"; // Your IP
   ```

3. **Backend server chalu ho** na chahiye:
   ```bash
   cd backend
   npm start
   ```

---

### **B. Module Not Found Error**
```
Error: Unable to resolve module 'react-native-vector-icons'
```

**Fix:**
```bash
cd swasthMobile
npm install
cd android && ./gradlew.bat clean
cd ..
npm start --reset-cache
```

---

### **C. Import Error**
```
Error: Cannot find module '../components/Something'
```

**Fix:** Missing component files
- Check file path spelling
- Verify file exists
- Case-sensitive hai (LoginScreen ≠ loginScreen)

---

### **D. Design System Error**
```
Error: figmaTokens is undefined
```

**Check:**
```bash
ls src/design-system/
# Should have: figmaTokens.js
```

---

### **E. Navigation Error**
```
Error: Couldn't find a 'component' prop for the screen 'Dashboard'
```

**Fix:** Screen file missing ya import galat hai
- Verify `src/screens/main/DashboardScreen.js` exists
- Check import in `AppNavigator.js`

---

## 🛠️ **Quick Fixes**

### **Fix 1: Reset Metro Cache**
```bash
cd swasthMobile
npm start -- --reset-cache
```

### **Fix 2: Rebuild App**
```bash
cd android
./gradlew.bat clean
./gradlew.bat assembleDebug
cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### **Fix 3: Clear App Data**
Phone pe:
```
Settings > Apps > Swasth > Storage > Clear Data
```

### **Fix 4: Restart Everything**
```bash
# Stop Metro
Ctrl + C

# Kill all node processes
taskkill /F /IM node.exe

# Restart
npm start

# Reload app (phone pe):
Shake device > Reload
```

---

## 📋 **Error Screenshot Checklist**

Phone pe red error screen hai toh ye information note karo:

1. **Error Title**: (Top pe red background mein)
   - Example: "Error: Network Error"

2. **Error Message**: (Detailed message)
   - Example: "Unable to resolve module..."

3. **Stack Trace**: (File paths with line numbers)
   - Example: "at App.js:10:5"

4. **Console Logs**: Terminal pe Metro bundler mein

---

## 🎯 **Common Solutions**

### **Solution 1: Backend Not Running**

**Error:**
```
Network error. Server not reachable.
```

**Fix:**
```bash
# Terminal 1 - Backend
cd C:\Users\shahz\MSWASTH\backend
npm start

# Terminal 2 - Metro
cd C:\Users\shahz\MSWASTH\swasthMobile
npm start

# Check backend:
curl http://localhost:3000/api/health
```

---

### **Solution 2: Wrong IP Address**

Phone aur laptop **same WiFi** pe hona chahiye!

```bash
# Windows - Get IP:
ipconfig

# Look for:
# Wireless LAN adapter Wi-Fi:
#   IPv4 Address: 192.168.1.X
```

Update `src/config/api.js`:
```javascript
const API_BASE_URL = "http://192.168.1.X:3000/api";
```

---

### **Solution 3: Missing Dependencies**

```bash
cd swasthMobile
rm -rf node_modules
npm install
cd android && ./gradlew.bat clean
cd ..
npm start --reset-cache
```

---

## 🔍 **Debug Commands**

### **View Logs:**
```bash
# React Native JS logs
adb logcat -s ReactNativeJS:V

# All React Native logs
adb logcat -s ReactNative:V ReactNativeJS:V

# Clear and watch
adb logcat -c && adb logcat -s ReactNativeJS:V
```

### **Check App Status:**
```bash
# Is app running?
adb shell pidof com.swasthmobile

# Which screen is focused?
adb shell dumpsys window | grep mCurrentFocus
```

### **Reload App:**
```bash
# From terminal
adb shell input text "RR"

# Or on device
Shake device > Press "Reload"
```

---

## 🧪 **Test Mode (Current)**

Index.js temporarily changed to:
```javascript
import App from './TestApp'; // Simple test
```

**If test works:**
✅ Basic setup OK
❌ Issue in main App.js / screens

**To restore main app:**
```javascript
import App from './App'; // Original
```

---

## 📞 **Need Help?**

Agar error fix nahi ho raha:

1. **Screenshot lo** red error screen ka
2. **Metro bundler output** copy karo
3. **Error message** puri note karo
4. Share karo!

---

## ✅ **Success Checklist**

Jab app sahi chal jaye:

- [ ] No red error screen
- [ ] Onboarding/Login screen dikhe
- [ ] Metro bundler connected
- [ ] Console mein errors nahi
- [ ] Navigation working

---

## 🎯 **Next Steps**

**Ab kya karna hai:**

1. **Phone pe dekho** - Simple test app dikha?
2. **Agar YES** - Original app restore karte hain
3. **Agar NO** - Error message batao

---

*Note: Test mode active hai! Original app ke liye index.js restore karna hoga.*
