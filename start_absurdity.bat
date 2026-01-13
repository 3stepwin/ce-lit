@echo off
echo ===================================================
echo   ABSURDITY AI SKETCH MACHINE - LAUNCHER
echo ===================================================
echo.
echo [1/3] Mounting Virtual Workspace (Z:) to fix path issues...
subst Z: "c:\Users\garfi\Dropbox\My PC (LAPTOP-HD9G8F0V)\Downloads\cultengine-lit"
if %errorlevel% neq 0 (
    echo [INFO] Z: drive might already be mounted. Continuing...
)

echo.
echo [2/3] Navigate to migrated app...
cd /d Z:\test-app

echo.
echo [3/3] Starting Expo Server...
echo NOTE: NativeWind is temporarily disabled due to Windows path bugs.
echo To restore styling, move the project to a simple path (e.g. C:\Projects).
echo.
npx expo start --clear
pause
