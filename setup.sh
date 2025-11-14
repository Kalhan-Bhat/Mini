# Student Engagement Portal - Setup Script for Mac/Linux

echo "========================================"
echo "Student Engagement Portal - Setup"
echo "========================================"
echo ""

echo "[1/4] Setting up Backend Node..."
cd backend-node
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Node modules already installed"
fi
cd ..

echo ""
echo "[2/4] Setting up Frontend React..."
cd frontend-react
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Node modules already installed"
fi
cd ..

echo ""
echo "[3/4] Setting up Backend ML..."
cd backend-ml
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "Virtual environment already exists"
    source venv/bin/activate
    pip install -r requirements.txt
fi
cd ..

echo ""
echo "[4/4] Setup complete!"
echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Place your model.pt file in: backend-ml/models/"
echo "2. Run ./start.sh to start all services"
echo "========================================"
