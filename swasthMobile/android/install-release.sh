#!/bin/bash

# Install Android Release APK Script
# Works on macOS, Linux, and Windows (via Git Bash/WSL)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# APK path
APK_PATH="app/build/outputs/apk/release/app-release.apk"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Swasth Mobile - Release APK Installer${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}Error: Release APK not found!${NC}"
    echo -e "${YELLOW}Please build the release APK first by running:${NC}"
    echo -e "${YELLOW}  ./gradlew assembleRelease${NC}\n"
    exit 1
fi

# Get APK size
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo -e "APK found: ${GREEN}$APK_PATH${NC} (${APK_SIZE})"

# Check if adb is available
if ! command -v adb &> /dev/null; then
    echo -e "${RED}Error: adb command not found!${NC}"
    echo -e "${YELLOW}Please install Android SDK Platform Tools:${NC}"
    echo -e "${YELLOW}  macOS: brew install android-platform-tools${NC}"
    echo -e "${YELLOW}  Windows: Download from https://developer.android.com/studio/releases/platform-tools${NC}\n"
    exit 1
fi

echo -e "adb found: ${GREEN}$(command -v adb)${NC}\n"

# Check for connected devices
echo "Checking for connected devices..."
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo -e "${RED}Error: No Android devices connected!${NC}"
    echo -e "${YELLOW}Please connect your device via USB and enable USB debugging.${NC}\n"
    exit 1
fi

echo -e "${GREEN}Found $DEVICES connected device(s)${NC}\n"

# Show connected devices
echo "Connected devices:"
adb devices
echo ""

# Install APK
echo -e "${YELLOW}Installing release APK...${NC}"
adb install -r "$APK_PATH"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Installation successful!${NC}"
    echo -e "${GREEN}The Swasth Mobile app has been installed on your device.${NC}\n"

    # Optional: Launch the app
    read -p "Would you like to launch the app now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Launching app...${NC}"
        adb shell am start -n com.swasthmobile/.MainActivity
        echo -e "${GREEN}✓ App launched!${NC}\n"
    fi
else
    echo -e "\n${RED}✗ Installation failed!${NC}"
    echo -e "${YELLOW}Please check the error message above.${NC}\n"
    exit 1
fi
