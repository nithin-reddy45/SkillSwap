@echo off
title SkillSwap Dev Runner
echo ==========================================
echo    Starting SkillSwap Server & Client
echo ==========================================

echo Starting Backend Server on http://localhost:5000...
start cmd /k "cd /d %~dp0server && node server.js"

timeout /t 2 >nul

echo Starting Frontend Client on http://localhost:5173...
start cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Both services have been launched in separate terminal windows!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ==========================================
