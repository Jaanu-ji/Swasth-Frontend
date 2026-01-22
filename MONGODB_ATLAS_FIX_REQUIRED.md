# 🔴 MongoDB Atlas Fix Required

## Current Status

✅ **Working:**
- React Native CLI app compiled and installed
- Metro bundler running stable (port 8081)
- Backend server running (port 3000)
- API IP updated: `192.168.29.192:3000`
- All import paths fixed
- App can reach backend server

❌ **Not Working:**
- MongoDB Atlas connection failed
- Login/Register not working
- All database operations failing

---

## Error

```
❌ MongoDB connection error: Error: querySrv ECONNREFUSED
_mongodb._tcp.cluster0.kktggol.mongodb.net
```

**Root Cause:** DNS cannot resolve your MongoDB cluster hostname.

**Possible Reasons:**
1. Cluster is PAUSED
2. Cluster was deleted
3. IP address not whitelisted
4. Network/firewall blocking MongoDB

---

## 🔧 Fix Steps (MongoDB Atlas Dashboard)

### Step 1: Login to Atlas
Go to: https://cloud.mongodb.com/
Login with your account

### Step 2: Check Cluster Status
1. Click "Database" in left sidebar
2. Find "Cluster0"
3. Check status:
   - If **PAUSED** → Click "Resume" button
   - If **TERMINATED** → Create new cluster
   - If **ACTIVE** → Go to Step 3

### Step 3: Fix Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address" button
3. **Option A (Recommended for testing):**
   - Click "Allow access from anywhere"
   - This adds `0.0.0.0/0`
4. **Option B (More secure):**
   - Enter your current IP: `192.168.29.192`
5. Click "Confirm"

### Step 4: Verify Database User
1. Click "Database Access" in left sidebar
2. Verify user exists: `shahzebansari1996_db_user`
3. If not, create new user:
   - Username: `shahzebansari1996_db_user`
   - Password: `shahzeb123`
   - Role: `Atlas Admin` or `Read and write to any database`

---

## Current Configuration

**Backend .env file:**
```
MONGO_URI=mongodb+srv://shahzebansari1996_db_user:shahzeb123@cluster0.kktggol.mongodb.net/swasth?appName=Cluster0
```

**Mobile App API:**
```
http://192.168.29.192:3000/api
```

---

## ✅ After Fixing Atlas

Once Atlas is accessible:

1. **Restart backend:**
   ```bash
   cd C:\Users\shahz\MSWASTH\backend
   npm start
   ```

2. **Check logs for success:**
   ```
   🚀 Server running on http://localhost:3000
   ✅ MongoDB connected successfully
   ```

3. **Test connection:**
   ```bash
   curl http://192.168.29.192:3000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
   ```
   Should return: `{"message":"Invalid email or password"}` (this is good - means DB is working!)

4. **Reload app on phone:**
   - Open app
   - Try to register new user
   - Should work! 🎉

---

## 🆘 If Atlas Still Not Working

**Alternative: Use another free MongoDB Atlas cluster**

1. Create new free cluster (M0)
2. Get connection string
3. Update in `.env` file
4. Restart backend

**Or use a different database provider:**
- MongoDB Atlas alternatives
- Local MongoDB (requires installation)

---

## 📱 Testing Without Database

The app will show:
- ✅ Onboarding screens load
- ✅ Login/Register UI visible
- ❌ "Server not reachable" or "Login failed" on submit

This is expected without database connection.

---

**Last Updated:** 2026-01-17
**Your IP:** 192.168.29.192
**Backend Port:** 3000
**Metro Port:** 8081
**Device:** RZCW60B7WFE
