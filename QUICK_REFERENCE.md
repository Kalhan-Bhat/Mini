# Quick Reference Card 🚀

## 📦 One-Command Setup

```bash
# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh && ./setup.sh
```

## 🎬 One-Command Start

```bash
# Windows
start.bat

# Mac/Linux
chmod +x start.sh && ./start.sh
```

## 🐳 Docker Commands

```bash
# Start everything
docker-compose up --build

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f
```

## 🌐 URLs

| Service          | URL                   | Purpose            |
| ---------------- | --------------------- | ------------------ |
| **Frontend**     | http://localhost:5173 | Student/Teacher UI |
| **Backend API**  | http://localhost:3000 | REST API           |
| **ML Service**   | http://localhost:8000 | Emotion Detection  |
| **Health Check** | /health               | All services       |

## 📂 Key Files

| File             | Location                                   | Purpose           |
| ---------------- | ------------------------------------------ | ----------------- |
| **React App**    | `frontend-react/src/App.jsx`               | Main app          |
| **Student View** | `frontend-react/src/pages/StudentPage.jsx` | Student UI        |
| **Teacher View** | `frontend-react/src/pages/TeacherPage.jsx` | Teacher dashboard |
| **Node Server**  | `backend-node/server.js`                   | Gateway server    |
| **ML Service**   | `backend-ml/main.py`                       | Emotion detection |
| **Your Model**   | `backend-ml/models/model.pt`               | PyTorch model     |

## 🔧 Configuration

| File                 | Settings                   |
| -------------------- | -------------------------- |
| `backend-node/.env`  | Agora credentials, ports   |
| `backend-ml/.env`    | Model path, emotion labels |
| `docker-compose.yml` | Multi-container config     |

## 📡 API Endpoints

### Backend (Node.js)

```bash
GET  /health                          # Health check
GET  /api/token?channel=X&role=Y      # Get Agora token
GET  /api/students/:channelName       # List students
```

### ML Service (Python)

```bash
GET  /health                          # Health check
POST /predict                         # Detect emotion
GET  /emotions                        # List supported emotions
```

## 🔌 WebSocket Events

### Student → Server

```javascript
socket.emit("student:join", { studentId, studentName, channelName });
socket.emit("frame:send", { studentId, frame, channelName, timestamp });
socket.emit("student:leave", { studentId, channelName });
```

### Teacher → Server

```javascript
socket.emit("teacher:join", { teacherId, teacherName, channelName });
socket.emit("teacher:leave", { teacherId, channelName });
```

### Server → Client

```javascript
// To student
socket.on("emotion:result", { emotion, confidence, timestamp });

// To teacher
socket.on("students:list", { students });
socket.on("emotion:update", { studentId, studentName, emotion, confidence });
socket.on("student:joined", { studentId, studentName });
socket.on("student:left", { studentId });
```

## 🎯 Testing Flow

1. **Start Services** → Run `start.bat` or Docker
2. **Student Joins** → http://localhost:5173 → Join as Student → Enter name + channel
3. **Teacher Joins** → New browser → Join as Teacher → Same channel name
4. **Verify** → Student sees emotion, teacher sees student in dashboard

## 🐛 Quick Debugging

| Issue                | Check                           | Fix                             |
| -------------------- | ------------------------------- | ------------------------------- |
| Port in use          | `netstat -ano \| findstr :3000` | Kill process or change port     |
| ML not working       | http://localhost:8000/health    | Check model in `models/` folder |
| Video not showing    | Browser console (F12)           | Allow camera permissions        |
| Emotion not updating | WebSocket connection            | Restart backend server          |
| Docker fails         | `docker ps`                     | `docker-compose down -v`        |

## 📊 Log Locations

```bash
# Development (terminals)
Terminal 1: ML Service logs
Terminal 2: Node Backend logs
Terminal 3: React Frontend logs

# Docker
docker-compose logs -f
docker-compose logs -f backend-node
docker-compose logs -f backend-ml
docker-compose logs -f frontend-react
```

## 🎨 Customization Points

| What               | Where                 | Example                      |
| ------------------ | --------------------- | ---------------------------- |
| Frame capture rate | `StudentPage.jsx:100` | Change `2000` to `5000` (5s) |
| Emotion labels     | `backend-ml/.env`     | Change `EMOTION_LABELS`      |
| Image size         | `backend-ml/.env`     | Change `IMAGE_SIZE`          |
| Port numbers       | `.env` files          | Change `PORT` values         |
| UI colors          | `App.css`             | Modify CSS variables         |

## 🔐 Environment Variables

### Backend Node (`.env`)

```bash
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
PORT=3000
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Backend ML (`.env`)

```bash
PORT=8000
HOST=0.0.0.0
MODEL_PATH=./models/model.pt
IMAGE_SIZE=224
EMOTION_LABELS=neutral,happy,sad,angry,surprised,fearful,disgusted
```

## 📚 Documentation Files

| File                 | Content                |
| -------------------- | ---------------------- |
| `README.md`          | Complete documentation |
| `GETTING_STARTED.md` | Quick start guide      |
| `PROJECT_SUMMARY.md` | What was built         |
| `ARCHITECTURE.md`    | System architecture    |
| `QUICK_REFERENCE.md` | This file              |

## 🚨 Common Errors

### "Cannot find module"

```bash
cd backend-node && npm install
cd frontend-react && npm install
```

### "Model not found"

```bash
# Place model.pt in:
backend-ml/models/model.pt
```

### "Port already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "WebSocket connection failed"

```bash
# Check backend is running
curl http://localhost:3000/health
```

## 💡 Pro Tips

1. **Use Docker** for easiest setup
2. **Check health endpoints** first when debugging
3. **Enable CORS** in production correctly
4. **Use placeholder model** for initial testing
5. **Read console logs** - they're very detailed
6. **Test with one student first** before multiple

## 🎓 Next Steps After Setup

- [ ] Test with student and teacher
- [ ] Try multiple students
- [ ] Place your real model
- [ ] Customize emotion labels
- [ ] Adjust UI styling
- [ ] Deploy to production
- [ ] Add database (optional)
- [ ] Implement authentication (optional)

## 📞 Getting Help

1. Check browser console (F12)
2. Check terminal output
3. Visit health endpoints
4. Read error messages
5. Check this documentation

---

## ⚡ Emergency Commands

```bash
# Kill everything
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Reset Docker
docker-compose down -v
docker system prune -a

# Fresh install
rm -rf node_modules frontend-react/node_modules backend-node/node_modules
npm run setup
```

---

**Keep this file handy! Bookmark it! 📌**

For detailed information, see `README.md` and `GETTING_STARTED.md`
