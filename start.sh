#!/bin/bash

echo "========================================"
echo "Starting Student Engagement Portal"
echo "========================================"
echo ""

# Start Backend ML Service
echo "Starting Backend ML Service..."
cd backend-ml
source venv/bin/activate
python main.py &
ML_PID=$!
cd ..
sleep 3

# Start Backend Node Server
echo "Starting Backend Node Server..."
cd backend-node
npm start &
NODE_PID=$!
cd ..
sleep 3

# Start Frontend React App
echo "Starting Frontend React App..."
cd frontend-react
npm run dev &
REACT_PID=$!
cd ..

echo ""
echo "========================================"
echo "All services started!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3000"
echo "ML Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for Ctrl+C
trap "kill $ML_PID $NODE_PID $REACT_PID; exit" INT
wait
