@echo off
REM Deployment Verification Script for Windows
REM Run this to check if your services are properly deployed

echo 🔍 Checking Student Engagement Portal Deployment...
echo.

REM Check if environment variables are set
echo 📋 Checking Environment Variables...

if exist "backend-node\.env" (
    echo ✓ backend-node\.env exists
    
    findstr /C:"AGORA_APP_ID=your_agora_app_id" backend-node\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✗ AGORA_APP_ID not configured in backend-node\.env
    ) else (
        echo ✓ AGORA_APP_ID configured
    )
    
    findstr /C:"AGORA_APP_CERTIFICATE=your_agora_certificate" backend-node\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✗ AGORA_APP_CERTIFICATE not configured in backend-node\.env
    ) else (
        echo ✓ AGORA_APP_CERTIFICATE configured
    )
) else (
    echo ✗ backend-node\.env missing
)

echo.

if exist "frontend-react\.env" (
    echo ✓ frontend-react\.env exists
    
    findstr /C:"VITE_AGORA_APP_ID=your_agora_app_id" frontend-react\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ⚠ VITE_AGORA_APP_ID not configured in frontend-react\.env
    ) else (
        echo ✓ VITE_AGORA_APP_ID configured
    )
) else (
    echo ⚠ frontend-react\.env missing (may use defaults)
)

echo.

REM Check if model exists
echo 🤖 Checking ML Model...
if exist "backend-ml\models\emotion_model_traced.pt" (
    echo ✓ ML model exists
) else (
    echo ✗ ML model missing at backend-ml\models\emotion_model_traced.pt
)

echo.

REM Check if node_modules are installed
echo 📦 Checking Dependencies...

if exist "backend-node\node_modules" (
    echo ✓ backend-node dependencies installed
) else (
    echo ⚠ backend-node dependencies not installed
    echo   Run: cd backend-node ^&^& npm install
)

if exist "frontend-react\node_modules" (
    echo ✓ frontend-react dependencies installed
) else (
    echo ⚠ frontend-react dependencies not installed
    echo   Run: cd frontend-react ^&^& npm install
)

if exist "backend-ml\requirements.txt" (
    echo ✓ backend-ml requirements.txt exists
) else (
    echo ✗ backend-ml requirements.txt missing
)

echo.

REM Check .gitignore
echo 🔧 Checking Configuration...

if exist ".gitignore" (
    findstr /C:".env" .gitignore >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ .env files are gitignored
    ) else (
        echo ✗ .env not in .gitignore (SECURITY RISK!)
    )
) else (
    echo ✗ .gitignore missing
)

echo.
echo 🎯 Deployment Readiness Summary:
echo.
echo Next steps:
echo 1. Ensure all environment variables are configured
echo 2. Install dependencies: npm install in each service
echo 3. Test locally before deploying
echo 4. Follow QUICK_DEPLOY.md for deployment steps
echo 5. Use PRODUCTION_CHECKLIST.md to verify everything
echo.
echo 📚 Documentation:
echo   - QUICK_DEPLOY.md - Quick deployment guide
echo   - DEPLOYMENT.md - Detailed deployment instructions
echo   - PRODUCTION_CHECKLIST.md - Pre-launch checklist
echo.

pause
