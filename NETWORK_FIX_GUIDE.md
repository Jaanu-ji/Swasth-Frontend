# 🔧 Network Error & Login Fix Guide

**Problem:** Network error hai aur login kaam nahi kar raha
**Solution:** Ye steps follow karo

---

## 🔍 Step 1: Backend Server Check Karo

### Backend chal raha hai ya nahi?

```bash
cd C:\Users\shahz\MSWASTH\backend
npm start
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server running on port 3000
```

**Agar error aaye:**
- ❌ `EADDRINUSE`: Port 3000 already in use
  ```bash
  # Windows pe port kill karo
  netstat -ano | findstr :3000
  taskkill /PID <PID_NUMBER> /F
  ```

- ❌ `MongoServerError`: MongoDB connection failed
  - Check internet connection
  - Verify MongoDB Atlas IP whitelist (0.0.0.0/0 hona chahiye)

---

## 🌐 Step 2: IP Address Update Karo

### Apna laptop ka IP address nikalo:

**Windows:**
```bash
ipconfig
```

**Look for:** IPv4 Address under "Wi-Fi" or "Ethernet"
Example: `192.168.1.5` or `10.208.217.64`

### Mobile aur laptop same Wi-Fi pe hone chahiye!

---

## 📱 Step 3: SwasthMobile API URL Update Karo

**File:** `C:\Users\shahz\MSWASTH\swasthMobile\src\config\api.js`

**Line 10 pe apna IP address dalo:**

```javascript
const API_BASE_URL = "http://YOUR_IP_HERE:3000/api";
```

**Example:**
```javascript
const API_BASE_URL = "http://192.168.1.5:3000/api";
```

⚠️ **Important:**
- ❌ `http://localhost:3000` - Real device pe kaam NAHI karega
- ❌ `http://127.0.0.1:3000` - Real device pe kaam NAHI karega
- ✅ `http://192.168.1.5:3000` - Ye kaam karega (apna IP use karo)

---

## 🔥 Step 4: Firewall Allow Karo

### Windows Firewall me port 3000 allow karo:

```bash
# Run as Administrator
netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=3000
```

**Ya manually:**
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Port → TCP → 3000 → Allow the connection
4. Apply to all profiles

---

## 🧪 Step 5: Backend Test Karo

### Browser me ye URL open karo:

```
http://YOUR_IP:3000/api
```

Example: `http://192.168.1.5:3000/api`

**Expected Response:**
```json
{
  "message": "Swasth API is running",
  "version": "1.0.0"
}
```

**Agar kaam nahi kiya:**
- Backend server running hai?
- Firewall allowed hai?
- IP address sahi hai?

---

## 📲 Step 6: Mobile App Rebuild Karo

**Important:** API URL change karne ke baad rebuild zaroori hai!

```bash
cd C:\Users\shahz\MSWASTH\swasthMobile

# Android
npx react-native run-android

# iOS (Mac only)
npx react-native run-ios
```

---

## 🔐 Step 7: Login Test Karo

### Test user create karo (agar nahi hai):

**Method 1: Postman/Browser**
```
POST http://YOUR_IP:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@test.com",
  "password": "test123",
  "height": "170",
  "weight": "70"
}
```

**Method 2: MongoDB directly**
Check if users exist:
```javascript
// MongoDB Compass ya Atlas
db.users.find()
```

### Ab login karo app me:
- Email: `test@test.com`
- Password: `test123`

---

## 🐛 Common Errors & Solutions

### Error 1: "Network error. Server not reachable"
**Reason:** Backend server off hai ya IP galat hai
**Fix:**
1. Backend start karo: `npm start`
2. IP address verify karo
3. Firewall check karo

### Error 2: "Request timeout"
**Reason:** Backend slow respond kar raha hai
**Fix:**
1. MongoDB connection check karo
2. Internet speed check karo
3. Timeout badhao api.js me (line 15): `timeout: 30000`

### Error 3: "Invalid email or password"
**Reason:** User nahi hai ya password galat hai
**Fix:**
1. Register karo pehle
2. Password correct enter karo
3. MongoDB me user check karo

### Error 4: "CORS error"
**Reason:** Backend CORS properly configured nahi hai
**Fix:** Already configured hai (`origin: "*"`), agar phir bhi error aaye:
```javascript
// backend/server.js
app.use(cors({
  origin: "*",
  credentials: true
}));
```

---

## ✅ Complete Checklist

Before testing login:

- [ ] Backend server running (`npm start`)
- [ ] MongoDB connected (green tick in console)
- [ ] IP address nikala (ipconfig)
- [ ] swasthMobile/src/config/api.js me IP updated
- [ ] Firewall me port 3000 allowed
- [ ] Browser me backend test kiya
- [ ] Mobile app rebuild kiya
- [ ] Same Wi-Fi pe mobile aur laptop dono
- [ ] Test user create kiya (agar nahi tha)

---

## 🚀 Quick Fix Commands

### Backend Start:
```bash
cd C:\Users\shahz\MSWASTH\backend
npm start
```

### Get IP:
```bash
ipconfig
```

### Update Mobile API:
```bash
# Edit this file:
C:\Users\shahz\MSWASTH\swasthMobile\src\config\api.js

# Change line 10:
const API_BASE_URL = "http://YOUR_IP:3000/api";
```

### Rebuild App:
```bash
cd C:\Users\shahz\MSWASTH\swasthMobile
npx react-native run-android
```

---

## 📞 Still Not Working?

### Debug Steps:

1. **Check Backend Logs:**
```bash
# Backend terminal me ye dikhna chahiye:
POST /api/auth/login 200 (success)
# Ya
POST /api/auth/login 401 (wrong password)
```

2. **Check Mobile Logs:**
```bash
npx react-native log-android
# Ya
npx react-native log-ios
```

3. **Check Network:**
```bash
# Mobile se backend ping karo (Postman mobile app use karo)
GET http://YOUR_IP:3000/api
```

---

## 💡 Pro Tips

1. **IP Address Change Hota Hai:**
   - Har baar Wi-Fi reconnect pe IP change ho sakta hai
   - Agar suddenly kaam nahi kare, pehle IP check karo

2. **Static IP Set Karo:**
   - Router settings me laptop ko static IP assign karo
   - Fir IP kabhi change nahi hoga

3. **Development Pe:**
   - Hamesha same Wi-Fi use karo
   - Mobile hotspot use mat karo (IP change hota rehta hai)

4. **Production Pe:**
   - Backend ko cloud deploy karo (Heroku, Railway, Render)
   - Fir IP hardcode nahi karna padega

---

**Agar in steps ke baad bhi kaam nahi kara, specific error message batao!** 🔍
