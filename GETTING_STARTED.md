# Getting Started Guide - Student Engagement Portal

This guide will help you set up and run the Student Engagement Portal in 5 minutes.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Running the Application](#running-the-application)
4. [Testing the Application](#testing-the-application)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.10+** - [Download](https://www.python.org/)
- **Git** (optional) - [Download](https://git-scm.com/)

### Optional (for Docker deployment)

- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)

### Your PyTorch Model

You need your trained emotion detection model (`model.pt` file). If you don't have one yet, the application will use a placeholder model for testing.

## Quick Setup

### Step 1: Install Dependencies

Open a terminal in the project root and run:

**Windows:**

```bash
setup.bat
```

**Mac/Linux:**

```bash
chmod +x setup.sh
./setup.sh
```

This script will:

- Install Node.js dependencies for backend and frontend
- Create Python virtual environment
- Install Python dependencies

### Step 2: Add Your Model

Copy your trained PyTorch model to:

```
backend-ml/models/model.pt
```

**Important:** If you skip this step, a placeholder model will be used (returns random predictions for testing).

## Running the Application

### Option 1: Using Start Script (Easiest)

**Windows:**

```bash
start.bat
```

**Mac/Linux:**

```bash
chmod +x start.sh
./start.sh
```

This will start all three services:

- ✅ Python ML Service on http://localhost:8000
- ✅ Node.js Backend on http://localhost:3000
- ✅ React Frontend on http://localhost:5173

### Option 2: Manual Start (for debugging)

Open 3 separate terminals:

**Terminal 1 - ML Service:**

```bash
cd backend-ml
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

python main.py
```

**Terminal 2 - Node Backend:**

```bash
cd backend-node
npm start
```

**Terminal 3 - React Frontend:**

```bash
cd frontend-react
npm run dev
```

### Option 3: Using Docker

```bash
# Make sure Docker Desktop is running
docker-compose up --build
```

Access the app at http://localhost (port 80)

## Testing the Application

### Test as Student

1. Open browser: http://localhost:5173
2. Click **"Join as Student"**
3. Enter:
   - Name: `Alice`
   - Channel: `class101`
4. Click **"Join Class"**
5. Allow camera/microphone permissions
6. You should see:
   - Your video feed
   - Emotion detection updating every 2 seconds

### Test as Teacher

1. Open a NEW browser window (or incognito): http://localhost:5173
2. Click **"Join as Teacher"**
3. Enter:
   - Name: `Professor Smith`
   - Channel: `class101` (same as student)
4. Click **"Join Class"**
5. You should see:
   - Your video feed
   - Student's video feed
   - Student's real-time emotion in the dashboard

### Multiple Students

Open more browser windows/tabs and join as different students with the same channel name. The teacher will see all students' emotions in real-time.

## Troubleshooting

### Issue: "Module not found" errors

**Solution:**

```bash
# Re-run setup
cd backend-node
npm install

cd ../frontend-react
npm install

cd ../backend-ml
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Backend won't start - "Port 3000 already in use"

**Solution:**

```bash
# Windows - Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: ML Service fails - "Model not found"

**Solution:**
This is expected if you haven't placed your model yet. The service will use a placeholder model. Check the logs - you should see:

```
⚠️ Model file not found at ./models/model.pt
Creating a placeholder model for testing
```

To fix: Copy your `model.pt` to `backend-ml/models/`

### Issue: Video not showing

**Solution:**

1. Grant camera/microphone permissions when prompted
2. Check if other apps are using the camera
3. Try a different browser (Chrome/Edge recommended)
4. Check browser console for errors (F12)

### Issue: Emotions not updating

**Solution:**

1. Check ML service is running: http://localhost:8000/health
2. Check backend is running: http://localhost:3000/health
3. Look at browser console (F12) for WebSocket errors
4. Make sure all three services are running

### Issue: "WebSocket connection failed"

**Solution:**

1. Make sure Node backend is running on port 3000
2. Check `.env` files have correct URLs
3. Disable browser extensions that might block WebSockets
4. Try clearing browser cache

### Issue: Docker containers won't start

**Solution:**

```bash
# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

## Environment Configuration

### Backend Node (.env)

Located at: `backend-node/.env`

```bash
AGORA_APP_ID=e406f5072e4b40bab7ad97258614a32a
AGORA_APP_CERTIFICATE=6c2c3eb204554da49d048d48a5f991c5
PORT=3000
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Backend ML (.env)

Located at: `backend-ml/.env`

```bash
PORT=8000
HOST=0.0.0.0
MODEL_PATH=./models/model.pt
IMAGE_SIZE=224
EMOTION_LABELS=neutral,happy,sad,angry,surprised,fearful,disgusted
```

**Note:** Adjust `EMOTION_LABELS` to match your model's output classes.

## Verifying Everything Works

Run these checks:

1. **ML Service Health Check:**

   ```bash
   curl http://localhost:8000/health
   ```

   Should return: `{"status":"healthy","model_loaded":true,"device":"cpu"}`

2. **Backend Health Check:**

   ```bash
   curl http://localhost:3000/health
   ```

   Should return: `{"status":"OK","timestamp":"..."}`

3. **Frontend:**
   Open http://localhost:5173 - should see the home page

## Project Structure Summary

```
student-engagement-portal/
├── backend-node/          # Node.js gateway (port 3000)
├── backend-ml/            # Python ML service (port 8000)
├── frontend-react/        # React app (port 5173)
├── setup.bat/.sh          # Setup script
├── start.bat/.sh          # Start all services
└── README.md              # Full documentation
```

## Next Steps

Once everything is running:

1. ✅ Test with one student and one teacher
2. ✅ Test with multiple students
3. ✅ Try different browsers
4. ✅ Test emotion detection with different expressions
5. ✅ Customize emotion labels in `backend-ml/.env`
6. ✅ Replace placeholder model with your trained model
7. ✅ Adjust frame capture interval in `StudentPage.jsx` (line ~100)

## Performance Tips

- **Frame capture interval:** Default is 2 seconds. Adjust in `frontend-react/src/pages/StudentPage.jsx`
- **Image size:** Default is 224x224. Adjust in `backend-ml/.env`
- **Model optimization:** Use TorchScript for faster inference
- **Network:** Use local network for faster communication

## Getting Help

1. Check browser console (F12) for frontend errors
2. Check terminal output for backend errors
3. Check `docker-compose logs -f` if using Docker
4. Verify all services are running on correct ports
5. Test each service health endpoint individually

## Success Checklist

- [ ] All dependencies installed (npm + pip)
- [ ] Three terminals running (ML, Node, React) OR Docker running
- [ ] Can access http://localhost:5173
- [ ] Student can join and see video
- [ ] Teacher can join and see student
- [ ] Emotions appear in teacher dashboard
- [ ] No console errors

---

**If you've completed this checklist, congratulations! 🎉 Your Student Engagement Portal is ready!**
