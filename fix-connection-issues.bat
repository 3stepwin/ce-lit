@echo off
echo ===================================================
echo FIXING CONNECTION ISSUES
echo ===================================================
echo.

echo Step 1: Killing all node processes to reset connections...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM ngrok.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Done!
echo.

echo Step 2: Clearing Expo cache...
cd AbsurditySketchMachine
if exist .expo\*.* del /F /Q .expo\*.*
if exist node_modules\.cache rmdir /S /Q node_modules\.cache
echo Done!
echo.

echo Step 3: Checking Supabase connection...
cd ..
node --version
echo.

echo Step 4: Testing Supabase connectivity...
cd AbsurditySketchMachine
node check_tables.js
echo.

echo ===================================================
echo FIX COMPLETE! Now you can restart the app.
echo ===================================================
echo.
echo To restart, run: .\start_absurdity.bat
echo.
pause
