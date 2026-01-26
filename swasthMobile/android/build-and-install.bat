@echo off
REM Build and Install Android Release APK Script for Windows
REM Requires Android SDK Platform Tools installed and in PATH

setlocal enabledelayedexpansion

echo ========================================
echo Swasth Mobile - Build ^& Install
echo ========================================
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

REM Check for connected devices
echo [1/3] Checking for connected devices...
adb devices | findstr /R "device$" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] No Android devices connected!
    echo Please connect your device via USB and enable USB debugging.
    echo.
    exit /b 1
)

echo [SUCCESS] Device(s) connected:
adb devices
echo.

REM Build release APK
echo [2/3] Building release APK...
echo This may take a few minutes...
echo.

call gradlew.bat assembleRelease

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo Please check the error messages above.
    echo.
    exit /b 1
)

set APK_PATH=app\build\outputs\apk\release\app-release.apk

if not exist "%APK_PATH%" (
    echo [ERROR] APK not found at expected location!
    echo.
    exit /b 1
)

for %%I in ("%APK_PATH%") do set APK_SIZE=%%~zI
set /a APK_SIZE_MB=!APK_SIZE! / 1048576
echo.
echo [SUCCESS] Build successful!
echo APK: %APK_PATH% (!APK_SIZE_MB! MB)
echo.

REM Install APK
echo [3/3] Installing APK on device...
adb install -r "%APK_PATH%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Installation successful!
    echo The Swasth Mobile app has been installed on your device.
    echo.

    REM Launch the app
    set /p LAUNCH="Would you like to launch the app now? (y/n): "
    if /i "!LAUNCH!"=="y" (
        echo Launching app...
        adb shell am start -n com.swasthmobile/.MainActivity
        echo [SUCCESS] App launched!
        echo.
    )

    echo ========================================
    echo All done! 🎉
    echo ========================================
    echo.
) else (
    echo.
    echo [ERROR] Installation failed!
    echo Please check the error message above.
    echo.
    exit /b 1
)

endlocal
pause
