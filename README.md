"# Student Engagement Portal

A real-time video-based virtual classroom with AI-powered emotion detection to monitor student engagement.

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Vite + React)
│  - Student View │
│  - Teacher View │
└────────┬────────┘
         │ WebSocket + REST
         ▼
┌─────────────────┐
│   Node.js       │ (Express + Socket.IO)
│   Gateway       │
│  - Auth & Token │
│  - WebSocket    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Python ML     │ (FastAPI + PyTorch)
│   Microservice  │
│  - Emotion AI   │
└─────────────────┘
```

## 🎯 Features

### For Students

- ✅ Join video calls using Agora WebSDK
- ✅ Real-time facial emotion detection
- ✅ See your own detected emotion and confidence
- ✅ View other participants in the call

### For Teachers

- ✅ Join video calls with students
- ✅ Live dashboard showing all students
- ✅ Real-time emotion monitoring for each student
- ✅ Aggregate statistics (emotion distribution, average confidence)
- ✅ Timestamps for emotion updates

## 📁 Project Structure

```
student-engagement-portal/
├── frontend-react/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API & Socket services
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend-node/            # Node.js gateway server
│   ├── server.js            # Main server file
│   ├── package.json
│   ├── .env                 # Environment variables
│   └── Dockerfile
│
├── backend-ml/              # Python ML microservice
│   ├── main.py              # FastAPI application
│   ├── models/              # PyTorch model directory
│   │   └── model.pt         # Your trained model
│   ├── requirements.txt
│   ├── .env
│   └── Dockerfile
│
├── docker-compose.yml       # Multi-container orchestration
├── .env                     # Root environment file
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker & Docker Compose (optional)

### Option 1: Run with Docker (Recommended)

1. **Place your PyTorch model:**

   ```bash
   # Copy your trained model.pt file to:
   backend-ml/models/model.pt
   ```

2. **Configure environment:**

   ```bash
   # Edit .env file with your Agora credentials
   # (Already configured with your current credentials)
   ```

3. **Start all services:**

   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - ML Service: http://localhost:8000

### Option 2: Run Manually (Development)

#### 1. Backend ML Service

```bash
cd backend-ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Place your model.pt in models/ directory

# Start service
python main.py
```

The ML service will run on `http://localhost:8000`

#### 2. Backend Node Server

```bash
cd backend-node

# Install dependencies
npm install

# Start server
npm start
```

The Node server will run on `http://localhost:3000`

#### 3. Frontend React App

```bash
cd frontend-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎮 Usage

### As a Student

1. Open http://localhost:5173 (or http://localhost if using Docker)
2. Click "Join as Student"
3. Enter your name and a channel name
4. Click "Join Class"
5. Allow camera and microphone permissions
6. Your emotion will be detected and displayed every 2 seconds

### As a Teacher

1. Open http://localhost:5173 (or http://localhost if using Docker)
2. Click "Join as Teacher"
3. Enter your name and the same channel name as students
4. Click "Join Class"
5. You'll see all students with their real-time emotions

## 🔧 Configuration

### Backend Node (.env)

```bash
# Agora Configuration
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate

# Server Configuration
PORT=3000

# Python ML Service
ML_SERVICE_URL=http://localhost:8000

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Backend ML (.env)

```bash
# ML Service Configuration
PORT=8000
HOST=0.0.0.0

# Model Configuration
MODEL_PATH=./models/model.pt
IMAGE_SIZE=224

# Emotion Labels (customize based on your model)
EMOTION_LABELS=neutral,happy,sad,angry,surprised,fearful,disgusted
```

## 🤖 Model Requirements

Your PyTorch model should:

- **Input**: RGB image tensor of shape `(batch_size, 3, 224, 224)`
- **Output**: Logits for emotion classification (shape: `(batch_size, num_emotions)`)
- **Format**: PyTorch `.pt` file saved with `torch.save()`

**Example model structure:**

```python
import torch
import torch.nn as nn

class EmotionModel(nn.Module):
    def __init__(self, num_emotions=7):
        super().__init__()
        # Your model architecture

    def forward(self, x):
        # x shape: (batch_size, 3, 224, 224)
        # return logits of shape: (batch_size, num_emotions)
        return logits

# Save model
torch.save(model, 'models/model.pt')
```

If you don't have a model yet, the service will use a placeholder model that returns random predictions for testing.

## 📡 API Endpoints

### Backend Node

- `GET /health` - Health check
- `GET /api/token?channel=<name>&role=<student|teacher>` - Get Agora token
- `GET /api/students/:channelName` - Get students in channel

### WebSocket Events

**Student Events:**

- `student:join` - Student joins a channel
- `student:leave` - Student leaves a channel
- `frame:send` - Student sends video frame for emotion detection
- `emotion:result` - Server returns emotion prediction

**Teacher Events:**

- `teacher:join` - Teacher joins a channel
- `teacher:leave` - Teacher leaves a channel
- `students:list` - Receive list of students
- `emotion:update` - Receive student emotion update

### Backend ML

- `GET /health` - Health check
- `POST /predict` - Predict emotion from base64 image
- `GET /emotions` - Get supported emotion labels

## 🛠️ Development

### Frontend Development

```bash
cd frontend-react
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development

```bash
cd backend-node
npm start        # Start server
npm run dev      # Start with nodemon (auto-reload)
```

### ML Service Development

```bash
cd backend-ml
python main.py   # Start with auto-reload
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend-node
docker-compose up -d backend-node
```

## 📊 Data Flow

1. **Student joins class:**

   - Student enters channel name
   - Frontend requests Agora token from Node backend
   - Student joins Agora video call
   - WebSocket connection established

2. **Emotion Detection:**

   - Student's video captured every 2 seconds
   - Frame converted to base64 image
   - Sent to Node backend via WebSocket
   - Node forwards to Python ML service
   - ML service returns emotion prediction
   - Node broadcasts to student and teacher

3. **Teacher Dashboard:**
   - Teacher sees all students in real-time
   - Emotion updates displayed as they arrive
   - Aggregate statistics calculated

## 🔐 Security Considerations

For production deployment:

1. **Move secrets to secure storage** (AWS Secrets Manager, etc.)
2. **Enable HTTPS** for all services
3. **Implement proper authentication** (JWT, OAuth)
4. **Add rate limiting** for API endpoints
5. **Validate and sanitize** all inputs
6. **Use CORS properly** (don't allow all origins in production)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

MIT License

## 🙏 Acknowledgments

- **Agora SDK** - Video calling infrastructure
- **PyTorch** - Deep learning framework
- **FastAPI** - Python web framework
- **Socket.IO** - Real-time communication
- **React** - UI framework

## 📞 Support

For issues or questions:

1. Check the console logs in browser DevTools
2. Check backend logs: `docker-compose logs -f`
3. Ensure all services are running
4. Verify your model is placed correctly

---

**Built with ❤️ for better online education**"
