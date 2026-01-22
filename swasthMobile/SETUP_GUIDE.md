# 🚀 Swasth Mobile - Setup & Build Guide

## ✅ Migration Status: COMPLETE

All Expo dependencies have been successfully removed and replaced with React Native CLI equivalents.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **JDK** (Java Development Kit) 11 or higher
- **Android Studio** with Android SDK
- **React Native CLI** (install via: `npm install -g react-native-cli`)

### Android Studio Setup
1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, ensure these are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
3. Configure Android SDK:
   - Open Android Studio → More Actions → SDK Manager
   - Install SDK Platform for Android 14 (API Level 34)
   - Install Android SDK Build-Tools 34.0.0

### Environment Variables (Windows)
Add these to your system PATH:
```
%LOCALAPPDATA%\Android\Sdk\platform-tools
%LOCALAPPDATA%\Android\Sdk\tools
%LOCALAPPDATA%\Android\Sdk\emulator
```

---

## 🔧 Installation Steps

### 1. Navigate to Project Directory
```bash
cd C:\Users\shahz\MSWASTH\swasthMobile
```

### 2. Install Node Modules
```bash
npm install
```

This will install all dependencies from package.json (~150 packages)

### 3. Link Vector Icons (Important!)
```bash
npx react-native-asset
```

This links the MaterialCommunityIcons font files to your Android project.

### 4. Configure API Endpoint
Open `src/config/api.js` and update the API base URL:
```javascript
// Change this line to your backend server IP
const API_BASE_URL = "http://YOUR_IP_ADDRESS:3000/api";
```

To find your IP address:
- Windows: `ipconfig` (look for IPv4 Address)
- Use your local network IP, not localhost
- Example: `http://192.168.1.5:3000/api`

---

## 📱 Running the App

### Method 1: Run on Physical Device (Recommended)

#### Enable Developer Options on Android Phone:
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back to Settings → System → Developer Options
4. Enable "USB Debugging"

#### Connect and Run:
```bash
# Connect your phone via USB

# Verify device is connected
adb devices

# Start Metro bundler (in terminal 1)
npm start

# Run the app (in terminal 2)
npm run android
```

### Method 2: Run on Android Emulator

#### Create Android Virtual Device (AVD):
1. Open Android Studio
2. More Actions → Virtual Device Manager
3. Create Device → Select device (e.g., Pixel 6)
4. Select System Image: Android 14 (API 34)
5. Finish and start the emulator

#### Run the App:
```bash
# Start Metro bundler (in terminal 1)
npm start

# Run the app (in terminal 2)
npm run android
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Command not found: react-native"
**Solution:**
```bash
npm install -g react-native-cli
```

### Issue 2: "SDK location not found"
**Solution:**
Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Issue 3: Metro bundler connection failed
**Solution:**
```bash
# Clear Metro cache
npm start -- --reset-cache

# Or delete cache manually
rm -rf $TMPDIR/metro-* $TMPDIR/haste-*
```

### Issue 4: "Unable to load script"
**Solution:**
```bash
# Ensure Metro is running first
npm start

# Then in new terminal
npm run android
```

### Issue 5: Gradle build failed
**Solution:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Issue 6: Vector icons not displaying
**Solution:**
```bash
# Re-link vector icons
npx react-native-asset

# Rebuild the app
npm run android
```

### Issue 7: "Network request failed" on login
**Solution:**
- Update API URL in `src/config/api.js`
- Make sure backend server is running
- Use local network IP, not localhost
- Check firewall settings allow connections

---

## 📦 Build for Production

### Generate Release APK

1. **Generate a signing key:**
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure gradle:**
Edit `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('my-release-key.keystore')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'my-key-alias'
        keyPassword 'YOUR_PASSWORD'
    }
}
```

3. **Build release APK:**
```bash
cd android
./gradlew assembleRelease
```

4. **Find APK:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🧪 Testing Checklist

After installation, test these features:

### Authentication Flow
- [ ] Onboarding screens display correctly
- [ ] Can navigate through onboarding
- [ ] Login screen loads
- [ ] Can register new account
- [ ] Can login with existing account
- [ ] Session persists after app restart

### Main Features
- [ ] Dashboard loads with user data
- [ ] Health tracker displays vitals
- [ ] Chat interface works
- [ ] Profile shows user info
- [ ] Family management accessible
- [ ] Navigation between screens works

### Visual Elements
- [ ] Gradients display correctly
- [ ] Icons render properly
- [ ] Colors match design system
- [ ] No layout issues
- [ ] Safe area handling correct

---

## 📊 Project Structure Reference

```
swasthMobile/
├── android/                        # Android native code
│   ├── app/
│   │   ├── build.gradle           # App-level gradle config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/swasthmobile/
│   │       │   ├── MainActivity.java
│   │       │   └── MainApplication.java
│   │       └── res/
│   ├── build.gradle               # Project-level gradle
│   └── gradle.properties
│
├── src/
│   ├── config/
│   │   └── api.js                 # ⚙️ API configuration (UPDATE THIS!)
│   ├── design-system/
│   │   ├── figmaTokens.js         # Design tokens
│   │   ├── FigmaButton.js
│   │   ├── FigmaCard.js
│   │   ├── FigmaInput.js
│   │   └── HeaderBar.js
│   ├── hooks/
│   │   └── useAuth.js             # Authentication context
│   ├── navigation/
│   │   └── AppNavigator.js        # Navigation setup
│   └── screens/
│       ├── OnboardingScreen.js
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       └── main/
│           ├── DashboardScreen.js
│           ├── HealthTrackerScreen.js
│           ├── ChatScreen.js
│           ├── ProfileScreen.js
│           ├── FamilyScreen.js
│           └── [19 more screens...]
│
├── App.js                          # Root component
├── index.js                        # Entry point
├── package.json                    # Dependencies
├── babel.config.js
└── metro.config.js
```

---

## 🎯 Quick Start Commands

```bash
# Install dependencies
npm install

# Link vector icons
npx react-native-asset

# Start Metro bundler
npm start

# Run on Android (new terminal)
npm run android

# Clear cache if issues
npm start -- --reset-cache

# Rebuild if needed
cd android && ./gradlew clean && cd .. && npm run android
```

---

## 📝 Important Notes

### API Configuration
⚠️ **CRITICAL**: Update API URL in `src/config/api.js` before first run:
```javascript
const API_BASE_URL = "http://YOUR_IP:3000/api";
```

### Backend Server
Ensure your backend server is running on the specified IP and port.

### Network Connectivity
- App and backend must be on same network
- Use local network IP, not localhost
- Firewall must allow connections on backend port

### First Run
- First build takes 5-10 minutes
- Subsequent builds are faster
- Metro bundler must be running before app launch

---

## 📞 Support & Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)

### Project Documentation
- `README.md` - Project overview
- `MIGRATION_SUMMARY.md` - Detailed migration report
- `package.json` - All dependencies listed

---

## ✅ Success Criteria

Your installation is successful when:
1. ✅ App builds without errors
2. ✅ App launches on device/emulator
3. ✅ Onboarding screens display correctly
4. ✅ Can login/register
5. ✅ Dashboard loads with data
6. ✅ Navigation works between screens
7. ✅ Icons and gradients render properly

---

**🎉 Congratulations! Your React Native CLI app is ready to run!**

Run `npm run android` to start developing.
