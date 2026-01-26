# Swasth Mobile - APK Installation Guide

This guide explains how to install the Android release APK on your device using the provided installation scripts.

## Prerequisites

1. **Android Device** with USB debugging enabled
2. **USB Cable** to connect your device to computer
3. **ADB (Android Debug Bridge)** installed on your computer

### Installing ADB

#### macOS
```bash
brew install android-platform-tools
```

#### Windows
Download Android SDK Platform Tools from:
https://developer.android.com/studio/releases/platform-tools

Extract and add the folder to your system PATH.

#### Linux
```bash
sudo apt install android-tools-adb  # Ubuntu/Debian
sudo yum install android-tools       # Fedora/CentOS
```

## Enable USB Debugging on Android

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Connect your device to computer via USB
6. Accept the USB debugging authorization prompt on your device

## Installation Methods

### Method 1: Using Installation Scripts (Recommended)

#### On macOS/Linux:
```bash
# Make script executable (first time only)
chmod +x install-release.sh

# Run the installer
./install-release.sh
```

#### On Windows:
```cmd
# Run the batch file
install-release.bat
```

Or if you have Git Bash/WSL:
```bash
bash install-release.sh
```

### Method 2: Manual Installation

#### Build and Install:
```bash
# Build the release APK
./gradlew assembleRelease

# Install on connected device
adb install -r app/build/outputs/apk/release/app-release.apk
```

#### Launch the app:
```bash
adb shell am start -n com.swasthmobile/.MainActivity
```

## Troubleshooting

### "adb: command not found"
- Make sure Android SDK Platform Tools are installed
- Add ADB to your system PATH

### "No devices/emulators found"
- Check if device is connected via USB
- Enable USB debugging on your device
- Accept USB debugging authorization prompt
- Try `adb devices` to verify connection

### "Installation failed"
- Uninstall the existing app first: `adb uninstall com.swasthmobile`
- Try installing again

### "APK not found"
- Build the release APK first: `./gradlew assembleRelease`

## Verify Installation

Check if the app is installed:
```bash
adb shell pm list packages | grep swasthmobile
```

View app info:
```bash
adb shell dumpsys package com.swasthmobile
```

## Additional Commands

### Uninstall app:
```bash
adb uninstall com.swasthmobile
```

### View app logs:
```bash
adb logcat | grep "ReactNative"
```

### List connected devices:
```bash
adb devices
```

---

**Note:** The release APK is signed with the production keystore and optimized for distribution.
