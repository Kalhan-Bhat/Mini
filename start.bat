@echo off
echo ========================================
echo Starting Student Engagement Portal
echo ========================================
echo.

echo Starting all services...
echo.

start "Backend ML Service" cmd /k "cd backend-ml && venv\Scripts\activate && python main.py"
timeout /t 3 /nobreak > nul

start "Backend Node Server" cmd /k "cd backend-node && npm start"
timeout /t 3 /nobreak > nul

start "Frontend React App" cmd /k "cd frontend-react && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo ML Service: http://localhost:8000
echo.
echo Press any key to stop all services...
pause > nul

taskkill /FI "WindowTitle eq Backend ML Service*" /T /F
taskkill /FI "WindowTitle eq Backend Node Server*" /T /F
taskkill /FI "WindowTitle eq Frontend React App*" /T /F

echo.
echo All services stopped.
pause
