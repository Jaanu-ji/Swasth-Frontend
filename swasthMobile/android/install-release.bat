@echo off
REM Install Android Release APK Script for Windows
REM Requires Android SDK Platform Tools installed and in PATH

setlocal enabledelayedexpansion

echo ========================================
echo Swasth Mobile - Release APK Installer
echo ========================================
echo.

set APK_PATH=app\build\outputs\apk\release\app-release.apk

REM Check if APK exists
if not exist "%APK_PATH%" (
    echo [ERROR] Release APK not found!
    echo Please build the release APK first by running:
    echo   gradlew.bat assembleRelease
    echo.
    exit /b 1
)

echo APK found: %APK_PATH%
for %%I in ("%APK_PATH%") do set APK_SIZE=%%~zI
set /a APK_SIZE_MB=!APK_SIZE! / 1048576
echo APK size: !APK_SIZE_MB! MB
echo.

REM Check if adb is available
where adb >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] adb command not found!
    echo Please install Android SDK Platform Tools and add to PATH.
    echo Download from: https://developer.android.com/studio/releases/platform-tools
    echo.
    exit /b 1
)

echo adb found:
where adb
echo.

REM Check for connected devices
echo Checking for connected devices...
adb devices | findstr /R "device$" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] No Android devices connected!
    echo Please connect your device via USB and enable USB debugging.
    echo.
    exit /b 1
)

echo Connected devices:
adb devices
echo.

REM Install APK
echo Installing release APK...
adb install -r "%APK_PATH%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Installation successful!
    echo The Swasth Mobile app has been installed on your device.
    echo.

    REM Optional: Launch the app
    set /p LAUNCH="Would you like to launch the app now? (y/n): "
    if /i "!LAUNCH!"=="y" (
        echo Launching app...
        adb shell am start -n com.swasthmobile/.MainActivity
        echo [SUCCESS] App launched!
        echo.
    )
) else (
    echo.
    echo [ERROR] Installation failed!
    echo Please check the error message above.
    echo.
    exit /b 1
)

endlocal
pause
