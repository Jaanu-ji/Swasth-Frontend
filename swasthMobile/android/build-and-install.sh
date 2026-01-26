#!/bin/bash

# Build and Install Android Release APK Script
# Works on macOS, Linux, and Windows (via Git Bash/WSL)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Swasth Mobile - Build & Install${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if adb is available
if ! command -v adb &> /dev/null; then
    echo -e "${RED}Error: adb command not found!${NC}"
    echo -e "${YELLOW}Please install Android SDK Platform Tools:${NC}"
    echo -e "${YELLOW}  macOS: brew install android-platform-tools${NC}"
    echo -e "${YELLOW}  Windows: Download from https://developer.android.com/studio/releases/platform-tools${NC}\n"
    exit 1
fi

# Check for connected devices
echo -e "${BLUE}[1/3] Checking for connected devices...${NC}"
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo -e "${RED}Error: No Android devices connected!${NC}"
    echo -e "${YELLOW}Please connect your device via USB and enable USB debugging.${NC}\n"
    exit 1
fi

echo -e "${GREEN}✓ Found $DEVICES connected device(s)${NC}"
adb devices
echo ""

# Build release APK
echo -e "${BLUE}[2/3] Building release APK...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}\n"

./gradlew assembleRelease

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Build failed!${NC}"
    echo -e "${YELLOW}Please check the error messages above.${NC}\n"
    exit 1
fi

APK_PATH="app/build/outputs/apk/release/app-release.apk"

if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}Error: APK not found at expected location!${NC}\n"
    exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo -e "\n${GREEN}✓ Build successful!${NC}"
echo -e "APK: ${GREEN}$APK_PATH${NC} (${APK_SIZE})\n"

# Install APK
echo -e "${BLUE}[3/3] Installing APK on device...${NC}"
adb install -r "$APK_PATH"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Installation successful!${NC}"
    echo -e "${GREEN}The Swasth Mobile app has been installed on your device.${NC}\n"

    # Launch the app
    read -p "Would you like to launch the app now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Launching app...${NC}"
        adb shell am start -n com.swasthmobile/.MainActivity
        echo -e "${GREEN}✓ App launched!${NC}\n"
    fi

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}All done! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}\n"
else
    echo -e "\n${RED}✗ Installation failed!${NC}"
    echo -e "${YELLOW}Please check the error message above.${NC}\n"
    exit 1
fi
