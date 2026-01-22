# 🚀 Quick Start Guide - Login Fix

## Problem: Network error aur login kaam nahi kar raha

---

## ✅ Solution (5 Minutes)

### Step 1: Backend Start Karo (2 min)

```bash
# Terminal 1
cd C:\Users\shahz\MSWASTH\backend
npm start
```

**Expected output:**
```
✅ Connected to MongoDB
🚀 Server running on port 3000
```

**Agar error:**
- MongoDB error → Internet check karo
- Port error → Port 3000 already used hai, kill karo:
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <NUMBER> /F
  ```

---

### Step 2: IP Address Nikalo (30 sec)

```bash
ipconfig
```

**Look for:** `IPv4 Address` under your Wi-Fi adapter
Example: `192.168.1.5` ya `10.208.217.64`

---

### Step 3: Mobile App API Update Karo (1 min)

**File:** `swasthMobile\src\config\api.js`

**Line 10 change karo:**
```javascript
// ❌ Galat (localhost kaam nahi karega)
const API_BASE_URL = "http://localhost:3000/api";

// ✅ Sahi (apna IP use karo)
const API_BASE_URL = "http://192.168.1.5:3000/api";  // <-- Apna IP
```

---

### Step 4: App Rebuild Karo (2 min)

```bash
# Terminal 2
cd C:\Users\shahz\MSWASTH\swasthMobile

# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

### Step 5: Login Test Karo

**Test Credentials:**
- Email: koi bhi (register karo pehle)
- Password: koi bhi (min 6 chars)

**Pehli baar?** Register button click karo aur account banao.

---

## 🧪 Quick Test (Optional)

### Backend test karo browser me:

```
http://YOUR_IP:3000/api
```

**Should show:**
```json
{
  "message": "Swasth API is running"
}
```

### Connection test script:

```bash
cd C:\Users\shahz\MSWASTH\backend
node test-connection.js
```

This will show:
- ✅ MongoDB connection status
- ✅ Your IP address
- ✅ Environment variables

---

## ⚠️ Important Notes

1. **Same Wi-Fi:** Mobile aur laptop dono same Wi-Fi pe hone chahiye
2. **Firewall:** Windows firewall port 3000 allow kare (usually auto-allowed)
3. **IP Change:** Wi-Fi disconnect/reconnect pe IP change ho sakta hai, dobara check karo

---

## 🔥 Common Issues

### "Network error. Server not reachable"
→ Backend running nahi hai: `npm start` karo

### "Request timeout"
→ IP galat hai: `ipconfig` se verify karo

### "Invalid credentials"
→ Pehle register karo ya password check karo

---

## 📞 Still Issues?

Check `NETWORK_FIX_GUIDE.md` for detailed troubleshooting!

---

**Total Time: ~5 minutes** ⏱️

Bas ye 5 steps karo aur app kaam karega! 🎉
