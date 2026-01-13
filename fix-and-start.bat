@echo off
echo Copying all folders from original project...
robocopy Z:\AbsurditySketchMachine Z:\test-app /E /XD node_modules .git .expo .supabase _supabase /XF package-lock.json *.log /NFL /NDL /NJH /NJS
echo.
echo Done! Restarting Expo...
cd /d Z:\test-app
npx expo start --clear
