# SwasthMobile - Run Karne Ke Instructions

## ✅ Setup Complete Hai! Ab Bas Device Connect Karo

### Method 1: Physical Android Phone (Recommended)

1. **USB Debugging Enable Karo**
   - Phone Settings > About Phone
   - "Build Number" ko 7 baar tap karo (Developer Mode enable hoga)
   - Settings > Developer Options > USB Debugging ON karo

2. **Phone USB se Connect Karo**
   - USB cable se phone laptop se connect karo
   - Phone pe "Allow USB Debugging" ka popup aayega - ALLOW karo

3. **Device Check Karo**
   ```bash
   cd swasthMobile
   adb devices
   ```
   - Aapko device ka naam dikhna chahiye

4. **App Run Karo**
   ```bash
   npm run android
   ```

### Method 2: Android Emulator (Optional)

Agar physical phone nahi hai toh:

1. **Android Studio** kholo
2. **Device Manager** > **Create Virtual Device**
3. Koi bhi phone select karo (e.g., Pixel 4)
4. System Image download karo (API 34 recommended)
5. Emulator start karo
6. Fir run karo:
   ```bash
   npm run android
   ```

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Metro Bundler
cd swasthMobile
npm start

# Terminal 2 - Android Build (device connect karne ke baad)
cd swasthMobile
npm run android
```

## ✅ Verification Checklist

Ye sab already done hai aapke system mein:
- [x] Node.js installed
- [x] npm installed
- [x] JDK installed
- [x] Android Studio installed
- [x] ANDROID_HOME set
- [x] Gradle configured
- [x] Dependencies installed
- [ ] **Device/Emulator connected** ⬅️ SIRF YE KARNA HAI!

## 📱 Expected Output

Jab sahi se chalega:
```
info Starting JS server...
info Launching emulator...
info Installing the app...
BUILD SUCCESSFUL in 45s
info Connecting to the development server...
info Starting the app...
```

Fir aapke phone pe **Swasth** app khul jayega! 🎉
