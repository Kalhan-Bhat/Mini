@echo off
echo ========================================
echo Student Engagement Portal - Setup
echo ========================================
echo.

echo [1/4] Setting up Backend Node...
cd backend-node
if not exist node_modules (
    call npm install
) else (
    echo Node modules already installed
)
cd ..

echo.
echo [2/4] Setting up Frontend React...
cd frontend-react
if not exist node_modules (
    call npm install
) else (
    echo Node modules already installed
)
cd ..

echo.
echo [3/4] Setting up Backend ML...
cd backend-ml
if not exist venv (
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    echo Virtual environment already exists
    call venv\Scripts\activate
    pip install -r requirements.txt
)
cd ..

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Place your model.pt file in: backend-ml\models\
echo 2. Run start.bat to start all services
echo ========================================
pause
