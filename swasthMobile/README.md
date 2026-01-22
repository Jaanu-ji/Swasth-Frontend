# Swasth Mobile - React Native CLI

This is the **React Native CLI** version of the Swasth health tracking application, fully migrated from Expo.

## 🎯 Migration Summary

### What Was Migrated
- ✅ Complete React Native CLI project structure
- ✅ Android build configuration (gradle files, AndroidManifest.xml)
- ✅ Design system (figmaTokens, FigmaButton, FigmaCard, FigmaInput, HeaderBar)
- ✅ Authentication hooks (useAuth with AsyncStorage)
- ✅ API configuration with Axios
- ✅ React Navigation Stack Navigator
- ✅ All auth screens (Onboarding, Login, Register)
- ✅ All main screens (24 screens - Dashboard, HealthTracker, Chat, Profile, Family, etc.)

### Key Replacements Made
- `expo-linear-gradient` → `react-native-linear-gradient`
- `@expo/vector-icons/MaterialCommunityIcons` → `react-native-vector-icons/MaterialCommunityIcons`
- `expo-router` → `@react-navigation/native` with Native Stack
- Expo app structure → Standard React Native CLI structure

## 📂 Project Structure

```
swasthMobile/
├── android/                    # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/swasthmobile/
│   │   │   │   ├── MainActivity.java
│   │   │   │   └── MainApplication.java
│   │   │   └── res/
│   │   └── build.gradle
│   ├── gradle/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
├── src/
│   ├── config/
│   │   └── api.js              # Axios API configuration
│   ├── design-system/
│   │   ├── figmaTokens.js      # Design tokens (colors, spacing, etc.)
│   │   ├── FigmaButton.js      # Custom button component
│   │   ├── FigmaCard.js        # Custom card component
│   │   ├── FigmaInput.js       # Custom input component
│   │   ├── HeaderBar.js        # Header navigation bar
│   │   └── index.js            # Exports
│   ├── hooks/
│   │   └── useAuth.js          # Authentication context & hook
│   ├── navigation/
│   │   └── AppNavigator.js     # React Navigation setup
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
├── App.js                      # Root component
├── index.js                    # App registry entry point
├── package.json
├── babel.config.js
├── metro.config.js
└── android/                    # Android-specific files

```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- JDK 11 or higher
- Android Studio with Android SDK
- React Native CLI: `npm install -g react-native-cli`

### Installation

1. **Install dependencies**
   ```bash
   cd swasthMobile
   npm install
   ```

2. **Link vector icons (if needed)**
   ```bash
   npx react-native-asset
   ```

3. **Start Metro bundler**
   ```bash
   npm start
   ```

4. **Run on Android**
   ```bash
   # In a new terminal
   npm run android
   ```

## 📱 Available Screens

### Auth Flow
- **Onboarding** - 4-screen carousel with app features
- **Login** - Email/password authentication
- **Register** - User signup with health metrics

### Main App Screens
- **Dashboard** - Health overview with quick stats
- **Health Tracker** - Track vitals (heart rate, BP, temperature, weight)
- **Add Vitals** - Add new health measurements
- **Vitals History** - View historical data with charts
- **Chat** - AI Doctor chat interface
- **AI Insights** - AI-generated health recommendations
- **Health Analytics** - Analytics dashboard
- **Water Tracker** - Daily water intake tracking
- **Calorie Tracker** - Calorie monitoring
- **Diet** - Diet recommendations
- **Meal Planner** - Meal planning interface
- **Add Meal** - Log meals
- **Workouts** - Workout tracking
- **Exercise Videos** - Exercise library
- **Step Counter** - Daily step tracking
- **Reminders** - Medication/appointment reminders
- **Family** - Manage family health profiles
- **Member Dashboard** - Individual family member data
- **Profile** - User profile with BMI calculation
- **Emergency Card** - Emergency medical information
- **OCR** - Medical report scanner
- **Report Scanner** - Scan medical documents
- **Recipes** - Healthy recipe suggestions
- **Vaccination** - Vaccination record tracking

## 🔧 Configuration

### API Base URL
Update the API URL in `src/config/api.js`:
```javascript
const API_BASE_URL = "http://YOUR_IP_ADDRESS:3000/api";
```

### Android Package Name
- Package: `com.swasthmobile`
- Located in: `android/app/src/main/AndroidManifest.xml`

## 📦 Dependencies

### Core
- react-native 0.74.5
- react 18.2.0
- @react-navigation/native ^6.1.9
- @react-navigation/native-stack ^6.9.17

### UI & Design
- react-native-linear-gradient ^2.8.3
- react-native-vector-icons ^10.0.3
- react-native-paper ^5.14.5
- react-native-svg ^15.2.0
- react-native-chart-kit ^6.12.0
- lucide-react-native ^0.562.0

### Utilities
- @react-native-async-storage/async-storage ^1.23.1
- axios ^1.13.2
- socket.io-client ^4.8.1

### Navigation
- react-native-gesture-handler ^2.16.1
- react-native-reanimated ^3.10.1
- react-native-safe-area-context ^4.10.5
- react-native-screens ^3.31.1

## 🔨 Build Commands

```bash
# Development
npm start                  # Start Metro bundler
npm run android           # Run on Android device/emulator

# Production
cd android
./gradlew assembleRelease # Build release APK
```

## 📝 Notes

- **No Expo Dependencies**: This project has been completely migrated to React Native CLI with zero Expo dependencies
- **Vector Icons**: Using `react-native-vector-icons` instead of `@expo/vector-icons`
- **Linear Gradient**: Using `react-native-linear-gradient` instead of `expo-linear-gradient`
- **Navigation**: Using React Navigation Native Stack instead of Expo Router
- **Original Frontend**: The original Expo frontend remains unchanged in `../frontend/` directory

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Missing dependencies
```bash
npm install
cd android && ./gradlew clean && cd ..
```

## 🎯 Next Steps

1. Install dependencies: `npm install`
2. Update API URL in `src/config/api.js`
3. Run the app: `npm run android`
4. Test authentication flow
5. Verify all screens are accessible

---

**Migration completed successfully!** 🎉

All Expo dependencies have been removed and replaced with React Native CLI equivalents.
